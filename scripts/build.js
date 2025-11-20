import { build } from "esbuild";

// The banner creates a CommonJS-compatible require() function in the ESM bundle.
// This is necessary because some bundled dependencies use dynamic require()
// calls, which aren't natively supported in ES modules. The createRequire()
// API provides this compatibility layer, allowing mixed CommonJS/ESM
// dependencies to work together.
const buildBanner = `#!/usr/bin/env node
  import { createRequire } from 'module';
  const require = createRequire(import.meta.url);`;

const buildConfig = {
  entryPoints: ["src/index.tsx"],
  outfile: "dist/index.js",
  platform: "node",
  format: "esm",
  bundle: true,
  banner: {
    js: buildBanner,
  },
};

await build(buildConfig);
