import { version } from "./src/version.ts";
import * as esbuild from "https://deno.land/x/esbuild@v0.19.4/mod.js";
import { build, emptyDir } from "https://deno.land/x/dnt@0.38.1/mod.ts";
import { execa } from "https://deno.land/x/easy_std@v0.5.3/src/process.ts";
import {
  dirname,
  fromFileUrl,
  resolve,
} from "https://deno.land/std@0.205.0/path/mod.ts";

const npm = resolve(dirname(fromFileUrl(import.meta.url)), "npm");

await emptyDir(npm);

await build({
  outDir: npm,
  typeCheck: false,
  declaration: false,
  scriptModule: "cjs",
  entryPoints: ["./mod.ts"],
  compilerOptions: {
    target: "ES2019",
  },
  shims: {
    deno: true,
  },
  test: false,
  esModule: false,
  package: {
    version,
    name: "deno-nrm",
    bin: {
      dnrm: "dist/mod.js",
      "deno-nrm": "dist/mod.js",
    },
    description: "deno 实现的 nrm，每次切换源都在 100ms 内，速度超级快",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/markthree/dnrm.git",
    },
    files: [
      "dist",
    ],
    author: {
      name: "markthree",
      email: "1801982702@qq.com",
      url: "https://github.com/markthree",
    },
    bugs: {
      email: "1801982702@qq.com",
      url: "https://github.com/markthree/dnrm/issues",
    },
  },
  async postBuild() {
    await sanitiseDeps();
    await Promise.all(
      [
        shebang(resolve(npm, "script/mod.js")),
        Deno.copyFile(".npmrc", resolve(npm, ".npmrc")),
        Deno.copyFile("LICENSE", resolve(npm, "LICENSE")),
        Deno.copyFile("README.md", resolve(npm, "README.md")),
      ],
    );
    await bundle();
    await npmPublish();
  },
});

async function shebang(mod: string) {
  const code = await Deno.readTextFile(mod);
  await Deno.writeTextFile(mod, `#!/usr/bin/env node\n${code}`);
}

async function sanitiseDeps() {
  const packageJsonPath = resolve(npm, "package.json");
  const packageJsonText = await Deno.readTextFile(packageJsonPath);

  const packageJson = JSON.parse(packageJsonText) ?? {};
  for (const key in packageJson) {
    if (key === "dependencies") {
      const dependencies = packageJson[key];
      if (packageJson["devDependencies"]) {
        packageJson["devDependencies"] = Object.assign(
          packageJson["devDependencies"],
          dependencies,
        );
      }
      delete packageJson[key];
      break;
    }
  }

  await Deno.writeTextFile(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2),
  );

  await execa(["npm", "install"], {
    cwd: npm,
  });
}

async function bundle() {
  await esbuild.build({
    bundle: true,
    format: "cjs",
    minify: true,
    target: "ES2019",
    platform: "node",
    sourcemap: false,
    treeShaking: true,
    absWorkingDir: npm,
    outfile: "./dist/mod.js",
    entryPoints: ["./script/mod.js"],
  });
  esbuild.stop();
}

async function npmPublish() {
  await execa(["npm", "publish"], {
    cwd: npm,
  });
}
