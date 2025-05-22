#!/usr/bin/env tsx
import { readdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import inquirer from "inquirer";
import { execSync } from "child_process";

const PACKAGES_DIR = path.resolve(__dirname, "../packages");
const MONOREPO_ROOT = path.resolve(__dirname, "..");

function log(msg: string) {
  console.log(msg);
}

function getAllPackages(): string[] {
  return readdirSync(PACKAGES_DIR).filter((name) => {
    const pkgJsonPath = path.join(PACKAGES_DIR, name, "package.json");
    return name !== ".DS_Store" && pkgJsonPath && require("fs").existsSync(pkgJsonPath);
  });
}

function getAllPackageNames(): string[] {
  return getAllPackages()
    .map((pkg) => {
      const pkgJsonPath = path.join(PACKAGES_DIR, pkg, "package.json");
      const pkgJson = JSON.parse(readFileSync(pkgJsonPath, "utf-8"));
      return pkgJson.name;
    })
    .filter(Boolean);
}

function getPackageJson(pkg: string) {
  const pkgJsonPath = path.join(PACKAGES_DIR, pkg, "package.json");
  return JSON.parse(readFileSync(pkgJsonPath, "utf-8"));
}

function writePackageJson(pkg: string, pkgJson: any) {
  const pkgJsonPath = path.join(PACKAGES_DIR, pkg, "package.json");
  writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2) + "\n");
}

function run(cmd: string, opts: any = {}) {
  log(`$ ${cmd}`);
  execSync(cmd, { stdio: "inherit", ...opts });
}

function getPendingChangesets(): string[] {
  const changesetDir = path.join(MONOREPO_ROOT, ".changeset");
  if (!require("fs").existsSync(changesetDir)) return [];
  return readdirSync(changesetDir).filter((f) => f.endsWith(".md"));
}

function isPrivate(pkg: string): boolean {
  const pkgJson = getPackageJson(pkg);
  return !!pkgJson.private;
}

function isDirty(pkg: string): boolean {
  try {
    const pkgDir = path.join(PACKAGES_DIR, pkg);
    const gitStatus = execSync(`git status --porcelain ${pkgDir}`).toString().trim();
    return gitStatus.length > 0;
  } catch {
    return false;
  }
}

function autoFixWorkspaceDeps() {
  log("🔎 Checking workspace:* dependencies...");
  const allPackages = getAllPackages();
  const allPackageNames = getAllPackageNames();
  let hasAutoFix = false;

  for (const pkg of allPackages) {
    const pkgJson = getPackageJson(pkg);
    let changed = false;

    for (const depType of ["dependencies", "devDependencies", "peerDependencies"]) {
      const deps = pkgJson[depType] || {};
      for (const [dep, version] of Object.entries(deps)) {
        if (
          typeof version === "string" &&
          version.startsWith("workspace:") &&
          !allPackageNames.includes(dep)
        ) {
          log(`🔧 Auto-fixing "${dep}" in "${pkg}" (${depType}) from "${version}" to "^latest"`);
          let latestVersion = "^1.0.0";
          try {
            latestVersion = "^" + execSync(`npm view ${dep} version`).toString().trim();
          } catch {
            log(`⚠️  Could not fetch latest ${dep} from npm, using ^1.0.0`);
          }
          deps[dep] = latestVersion;
          changed = true;
          hasAutoFix = true;
        }
      }
      if (changed) pkgJson[depType] = deps;
    }
    if (changed) {
      writePackageJson(pkg, pkgJson);
      log(`✅ Fixed package.json in "${pkg}"`);
    }
  }
  if (hasAutoFix) {
    log("📦 Re-installing dependencies after auto-fix...");
    run("pnpm install");
  } else {
    log("✅ All workspace:* dependencies are valid.\n");
  }
}

async function ensureChangesetsInteractive(allPackages: string[]) {
  const changesetDir = path.join(MONOREPO_ROOT, ".changeset");
  if (!require("fs").existsSync(changesetDir)) {
    log("🦋  No .changeset folder found. Initializing changesets...");
    run("pnpm exec changeset init");
  }
  let hasUnreleasedChangeset =
    require("fs").existsSync(changesetDir) &&
    readdirSync(changesetDir).some((f) => f.endsWith(".md"));

  // Always ask if user wants to create a new release
  const { wantRelease } = await inquirer.prompt([
    {
      name: "wantRelease",
      type: "confirm",
      message: "Do you want to create a new release (bump version)?",
      default: !hasUnreleasedChangeset,
    },
  ]);

  if (wantRelease) {
    const { pkgsToRelease } = await inquirer.prompt([
      {
        name: "pkgsToRelease",
        type: "checkbox",
        message: "Which packages have changes and need a release?",
        choices: allPackages.filter((pkg) => !isPrivate(pkg)),
      },
    ]);
    if (!pkgsToRelease.length) {
      log("❌ No packages selected for release. Exiting.");
      process.exit(0);
    }
    for (const pkg of pkgsToRelease) {
      const { bumpType, summary } = await inquirer.prompt([
        {
          name: "bumpType",
          type: "list",
          message: `Select version bump type for ${pkg}:`,
          choices: ["patch", "minor", "major"],
          default: "patch",
        },
        {
          name: "summary",
          type: "input",
          message: `Enter a summary changelog message for ${pkg}:`,
          validate: (input) => input.trim().length > 0 || "Summary cannot be empty",
        },
      ]);
      const pkgName = getPackageJson(pkg).name;
      run(
        `pnpm exec changeset add --package ${pkgName} --type ${bumpType} --summary "${summary.replace(/"/g, '\"')}"`
      );
    }
    log("✅ Changesets created.\n");
    hasUnreleasedChangeset = true;
  } else if (!hasUnreleasedChangeset) {
    log("❌ No pending changesets and no new release requested. Exiting.");
    process.exit(0);
  }
}

async function main() {
  autoFixWorkspaceDeps();

  const allPackages = getAllPackages();

  // Only prompt for changesets if there are no pending changesets
  const pendingChangesets = getPendingChangesets();
  if (pendingChangesets.length === 0) {
    const { wantRelease } = await inquirer.prompt([
      {
        name: "wantRelease",
        type: "confirm",
        message: "Do you want to create a new release (bump version)?",
        default: true,
      },
    ]);
    if (wantRelease) {
      const { pkgsToRelease } = await inquirer.prompt([
        {
          name: "pkgsToRelease",
          type: "checkbox",
          message: "Which packages have changes and need a release?",
          choices: allPackages.filter((pkg) => !isPrivate(pkg)),
        },
      ]);
      if (!pkgsToRelease.length) {
        log("❌ No packages selected for release. Exiting.");
        process.exit(0);
      }
      for (const pkg of pkgsToRelease) {
        const { bumpType, summary } = await inquirer.prompt([
          {
            name: "bumpType",
            type: "list",
            message: `Select version bump type for ${pkg}:`,
            choices: ["patch", "minor", "major"],
            default: "patch",
          },
          {
            name: "summary",
            type: "input",
            message: `Enter a summary changelog message for ${pkg}:`,
            validate: (input) => input.trim().length > 0 || "Summary cannot be empty",
          },
        ]);
        const pkgName = getPackageJson(pkg).name;
        run(
          `pnpm exec changeset add --package ${pkgName} --type ${bumpType} --summary "${summary.replace(/"/g, '\"')}"`
        );
      }
      log("✅ Changesets created.\n");
    } else {
      log("❌ No pending changesets and no new release requested. Exiting.");
      process.exit(0);
    }
  } else {
    log("ℹ️  Pending changesets detected, skipping changeset creation.");
  }

  log("Detected packages: " + allPackages.join(", "));

  const { selectedPackages } = await inquirer.prompt([
    {
      name: "selectedPackages",
      type: "checkbox",
      message: "📦 Which packages do you want to publish?",
      choices: allPackages.filter((pkg) => !isPrivate(pkg)),
      default: allPackages.filter((pkg) => !isPrivate(pkg)),
    },
  ]);

  if (!selectedPackages.length) {
    log("❌ No packages selected. Exiting.");
    process.exit(0);
  }

  for (const pkg of selectedPackages) {
    if (isDirty(pkg)) {
      const { commitMessage } = await inquirer.prompt([
        {
          name: "commitMessage",
          type: "input",
          message: `📝 Enter a commit message for ${pkg} (required to publish):`,
          validate: (input) => input.trim().length > 0 || "Commit message cannot be empty",
        },
      ]);
      try {
        const pkgDir = path.join(PACKAGES_DIR, pkg);
        run(`git add ${pkgDir}`);
        run(`git commit -m "${commitMessage}"`);
        log(`✅ Changes committed for ${pkg}`);
      } catch {
        log(`❌ Failed to commit changes for ${pkg}`);
        process.exit(1);
      }
    }
    // Build before publishing
    try {
      run(`pnpm --filter ${pkg} build`);
    } catch {
      log(`❌ Build failed for ${pkg}`);
      process.exit(1);
    }
  }

  // Always run changeset version and install before publish
  log("📦 Running changeset version...");
  run("pnpm changeset version");
  run("pnpm install");

  for (const pkg of selectedPackages) {
    const pkgJson = getPackageJson(pkg);
    if (pkgJson.private) {
      log(`🔒 Skipping private package: ${pkg}`);
      continue;
    }
    const version = pkgJson.version;
    log(`🚀 Publishing ${pkg}@${version}...`);
    const publishCmd = `pnpm publish --filter ${pkg} --access public --no-git-checks`;
    try {
      run(publishCmd);
    } catch {
      log(`❌ Publish failed for ${pkg}`);
      process.exit(1);
    }
  }

  log("✅ Done! All selected packages are published.");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});