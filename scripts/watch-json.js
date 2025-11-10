// scripts/dev-server.js
import path from "path";
import { pathToFileURL } from "url";
import chokidar from "chokidar";
import * as esbuild from "esbuild";
import fs from "fs-extra";

const SRC_DIR = path.resolve("data");
const OUT_DIR = path.resolve("dist/data");
const ASSETS_SRC = path.resolve("assets");
const ASSETS_DEST = path.resolve("dist/assets");

// Ensure output directories exist
fs.ensureDirSync(OUT_DIR);
fs.ensureDirSync(ASSETS_DEST);

// ---------------------
// TypeScript -> JSON
// ---------------------
async function loadTsModule(filePath) {
  const result = await esbuild.build({
    entryPoints: [filePath],
    bundle: true,
    platform: "node",
    format: "esm",
    write: false,
  });

  const jsCode = result.outputFiles[0].text;
  const tmpFile = path.join(
    OUT_DIR,
    `.__tmp_${path.basename(filePath, ".ts")}.mjs`
  );

  fs.writeFileSync(tmpFile, jsCode, "utf8");

  const fileUrl = pathToFileURL(tmpFile).href + `?update=${Date.now()}`;
  const module = await import(fileUrl);

  fs.unlinkSync(tmpFile);
  return module;
}

async function processTsFile(filePath) {
  try {
    const module = await loadTsModule(filePath);
    const [exportName, value] = Object.entries(module)[0] || [];

    if (!exportName) {
      console.warn(`⚠️ No exports found in ${filePath}`);
      return;
    }

    const outPath = path.join(
      OUT_DIR,
      path.basename(filePath, path.extname(filePath)) + ".json"
    );

    await fs.writeJson(outPath, value, { spaces: 2 });
    console.log(`✅ Wrote ${outPath}`);
  } catch (err) {
    console.error(`❌ Error processing ${filePath}:`, err.message);
  }
}

// ---------------------
// Assets copy/remove
// ---------------------
async function copyAsset(srcPath) {
  const destPath = path.join(ASSETS_DEST, path.relative(ASSETS_SRC, srcPath));
  try {
    await fs.copy(srcPath, destPath, { overwrite: true });
    console.log(`✅ Copied ${path.relative(ASSETS_SRC, srcPath)}`);
  } catch (err) {
    console.error(`❌ Error copying ${path.relative(ASSETS_SRC, srcPath)}:`, err.message);
  }
}

async function removeAsset(srcPath) {
  const destPath = path.join(ASSETS_DEST, path.relative(ASSETS_SRC, srcPath));
  try {
    await fs.remove(destPath);
    console.log(`🗑️ Removed ${path.relative(ASSETS_SRC, srcPath)}`);
  } catch (err) {
    console.error(`❌ Error removing ${path.relative(ASSETS_SRC, srcPath)}:`, err.message);
  }
}

// ---------------------
// Initial asset sync
// ---------------------
async function syncAssets() {
  try {
    await fs.copy(ASSETS_SRC, ASSETS_DEST, { overwrite: true });
    console.log("✅ Initial sync of assets completed.");
  } catch (err) {
    console.error("❌ Error during initial asset sync:", err.message);
  }
}

// ---------------------
// Start watchers
// ---------------------
function startWatcher() {
  // Watch TypeScript files
  const tsWatcher = chokidar.watch(`${SRC_DIR}/*.ts`, { ignoreInitial: false });
  tsWatcher
    .on("add", processTsFile)
    .on("change", processTsFile)
    .on("unlink", async (filePath) => {
      const outPath = path.join(
        OUT_DIR,
        path.basename(filePath, path.extname(filePath)) + ".json"
      );
      if (await fs.pathExists(outPath)) {
        await fs.remove(outPath);
        console.log(`🗑️ Removed ${outPath}`);
      }
    });

  // Watch assets
  const assetsWatcher = chokidar.watch(`${ASSETS_SRC}/**/*`, { ignoreInitial: false });
  assetsWatcher
    .on("add", copyAsset)
    .on("change", copyAsset)
    .on("addDir", copyAsset)
    .on("unlink", removeAsset)
    .on("unlinkDir", removeAsset);

  console.log(`👀 Watching ${SRC_DIR} and ${ASSETS_SRC}...`);
}

// ---------------------
// Run everything
// ---------------------
(async () => {
  await syncAssets();
  startWatcher();
})();
