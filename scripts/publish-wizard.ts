#!/usr/bin/env tsx
import { readdirSync, readFileSync } from "fs";
import path from "path";
import inquirer from "inquirer";
import { execSync, execFileSync } from "child_process";

const PACKAGES_DIR = path.resolve(__dirname, "../packages");

const getPackages = () => {
  return readdirSync(PACKAGES_DIR).filter((name) => {
    const pkgJsonPath = path.join(PACKAGES_DIR, name, "package.json");
    return pkgJsonPath && name !== ".DS_Store";
  });
};

(async () => {
  const allPackages = getPackages();
  console.log('Detected packages:', allPackages);

  const { selectedPackages } = await inquirer.prompt([
    {
      name: "selectedPackages",
      type: "checkbox",
      message: "📦 Which packages do you want to publish?",
      choices: allPackages,
    },
  ]);

  if (selectedPackages.length === 0) {
    console.log("❌ No packages selected. Exiting.");
    process.exit(0);
  }

  const { isVersioning } = await inquirer.prompt([
    {
      name: "isVersioning",
      type: "confirm",
      message: "📌 Do you want to bump versions via Changesets?",
      default: true,
    },
  ]);

  if (isVersioning) {
    console.log("📦 Running changeset version...");
    execSync("pnpm changeset version", { stdio: "inherit" });
    execSync("pnpm install", { stdio: "inherit" }); // Update lockfile
  }

  for (const pkg of selectedPackages) {
    const pkgDir = path.join(PACKAGES_DIR, pkg);
    // Check for uncommitted changes in the package
    let isDirty = false;
    try {
      const gitStatus = execSync(`git status --porcelain ${pkgDir}`).toString().trim();
      isDirty = gitStatus.length > 0;
    } catch (e) {
      console.warn(`⚠️  Could not check git status for ${pkg}`);
    }
    if (isDirty) {
      const { commitMessage } = await inquirer.prompt([
        {
          name: "commitMessage",
          type: "input",
          message: `📝 Enter a commit message for ${pkg} (required to publish):`,
          validate: (input) => input.trim().length > 0 || 'Commit message cannot be empty',
        },
      ]);
      try {
        execSync(`git add ${pkgDir}`);
        execSync(`git commit -m "${commitMessage}"`);
        console.log(`✅ Changes committed for ${pkg}`);
      } catch (e) {
        console.error(`❌ Failed to commit changes for ${pkg}`);
        process.exit(1);
      }
    }
    const pkgJson = JSON.parse(readFileSync(path.join(pkgDir, "package.json"), "utf-8"));
    const version = pkgJson.version;
    console.log(`🚀 Publishing ${pkg}@${version}...`);
    execSync(`pnpm publish --filter ./${path.relative(process.cwd(), pkgDir)} --access public --no-git-checks`, { stdio: "inherit" });
  }

  console.log("✅ Done! All selected packages are published.");
})();
