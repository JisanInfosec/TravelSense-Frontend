import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env.local");
const checkOnly = process.argv.includes("--check");

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    ...options,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
  return result;
}

if (!fs.existsSync(envPath)) {
  console.error("Missing frontend/.env.local file.");
  process.exit(1);
}

const envFile = fs.readFileSync(envPath, "utf8");
const apiUrl = envFile
  .match(/^NEXT_PUBLIC_API_URL=(.*)$/m)?.[1]
  ?.trim()
  .replace(/^(["'])(.*)\1$/, "$2");
if (!apiUrl?.startsWith("https://") || !apiUrl.endsWith("/api")) {
  console.error("NEXT_PUBLIC_API_URL must be an HTTPS URL ending in /api.");
  process.exit(1);
}

run("vercel", ["--version"]);
run("npm", ["run", "lint"]);
run("npm", ["run", "build"]);

if (checkOnly) {
  console.log("Frontend deployment checks passed.");
  process.exit(0);
}

if (!fs.existsSync(path.join(root, ".vercel", "project.json"))) {
  console.log("\nSelect the existing frontend project, or create a new one.");
  run("vercel", ["link"]);
}

run(
  "vercel",
  [
    "env",
    "add",
    "NEXT_PUBLIC_API_URL",
    "--environment",
    "production",
    "--force",
    "--no-sensitive",
    "--yes",
  ],
  {
    input: `${apiUrl}\n`,
    encoding: "utf8",
    stdio: ["pipe", "inherit", "inherit"],
  },
);

const deployment = spawnSync("vercel", ["deploy", "--prod", "--yes"], {
  cwd: root,
  encoding: "utf8",
  stdio: ["inherit", "pipe", "inherit"],
});
if (deployment.error) throw deployment.error;
process.stdout.write(deployment.stdout);
if (deployment.status !== 0) process.exit(deployment.status ?? 1);

const urls = deployment.stdout.match(/https:\/\/[^\s]+/g) ?? [];
const deploymentUrl = urls.at(-1)?.replace(/\x1B\[[0-9;]*m/g, "");
if (!deploymentUrl) {
  console.error("Deployment succeeded, but its URL could not be detected.");
  process.exit(1);
}

const verification = spawnSync(
  "vercel",
  ["curl", deploymentUrl, "--", "--fail", "--silent", "--show-error"],
  {
    cwd: root,
    encoding: "utf8",
    stdio: ["inherit", "pipe", "inherit"],
  },
);
if (verification.error) throw verification.error;
if (verification.status !== 0) process.exit(verification.status ?? 1);

console.log(`\nFrontend deployment verified: ${deploymentUrl}`);
console.log(`Configured API: ${apiUrl}`);
