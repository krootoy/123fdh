import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = __dirname;
const distDir = path.join(rootDir, "dist");
const assetsDir = path.join(distDir, "assets");

async function main() {
  fs.mkdirSync(assetsDir, { recursive: true });

  try {
    const esbuild = await import("esbuild");
    console.log("--> Bundling React with esbuild...");
    await esbuild.build({
      entryPoints: [path.join(rootDir, "src", "main.jsx")],
      bundle: true,
      minify: true,
      sourcemap: true,
      outfile: path.join(assetsDir, "app.js"),
      define: {
        "process.env.NODE_ENV": '"production"',
      },
      loader: {
        ".jsx": "jsx",
        ".js": "jsx",
      },
    });
    console.log("--> React bundle generated successfully.");
  } catch (err) {
    if (fs.existsSync(path.join(assetsDir, "app.js"))) {
      console.log("--> Notice: Using prebuilt dist/assets/app.js (" + err.message + ")");
    } else {
      throw err;
    }
  }

  // Copy static assets
  const filesToCopy = ["index.html", "favicon.svg"];
  for (const filename of filesToCopy) {
    const src = path.join(rootDir, filename);
    const dst = path.join(distDir, filename);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dst);
      console.log(`    Copied ${filename} -> dist/${filename}`);
    }
  }

  console.log("✓ Frontend build complete!");
}

main().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
