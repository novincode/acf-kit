#!/usr/bin/env tsx
import { readdirSync, readFileSync } from "fs";
import path from "path";
import inquirer from "inquirer";
import { execSync } from "child_process";

const PACKAGES_DIR = path.resolve(__dirname, "../packages");

function log(msg: string) {
  console.log(msg);
}

function getAllPackages(): string[] {
  return readdirSync(PACKAGES_DIR).filter((name) => {
    const pkgJsonPath = path.join(PACKAGES_DIR, name, "package.json");
    return name !== ".DS_Store" && require("fs").existsSync(pkgJsonPath);
  });
}

function getPackageJson(pkg: string) {
  const pkgJsonPath = path.join(PACKAGES_DIR, pkg, "package.json");
  return JSON.parse(readFileSync(pkgJsonPath, "utf-8"));
}

function run(cmd: string) {
  log(`$ ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

async function main() {
  const allPackages = getAllPackages().filter((pkg) => !getPackageJson(pkg).private);
  if (allPackages.length === 0) {
    log("❌ No public packages found.");
    process.exit(1);
  }
  const { pkgs } = await inquirer.prompt({
    name: "pkgs",
    type: "checkbox",
    message: "Select package(s) to publish:",
    choices: allPackages,
  });
  for (const pkg of pkgs) {
    const pkgJson = getPackageJson(pkg);
    log(`🚀 Publishing ${pkg}@${pkgJson.version}...`);
    const publishCmd = pkgJson.name.startsWith("@")
      ? `pnpm publish --filter ${pkg} --access public --no-git-checks`
      : `pnpm publish --filter ${pkg} --no-git-checks`;
    try {
      run(publishCmd);
      log("✅ Done!");
    } catch {
      log(`❌ Publish failed for ${pkg}`);
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});