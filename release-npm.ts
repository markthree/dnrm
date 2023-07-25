import { version } from "./src/version.ts";
import { build, emptyDir } from "https://deno.land/x/dnt@0.38.0/mod.ts";
import { execa } from "https://deno.land/x/easy_std@v0.4.6/src/process.ts";

await emptyDir("./npm");

await build({
  outDir: "./npm",
  typeCheck: false,
  scriptModule: false,
  declaration: false,
  entryPoints: ["./mod.ts"],
  shims: {
    deno: true,
  },
  test: false,
  package: {
    type: "module",
    name: "deno-nrm",
    version: version,
    bin: {
      dnrm: "esm/mod.js",
      "deno-nrm": "esm/mod.js",
    },
    description: "deno 实现的 nrm，每次切换源都在 100ms 内，速度超级快",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/markthree/dnrm.git",
    },
    files: [
      "esm",
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
    const mod = "./npm/esm/mod.js";
    let modText = await Deno.readTextFile(mod);

    modText = shebang(cleanModuleMetadata(modText));

    await Promise.all(
      [
        Deno.copyFile("LICENSE", "npm/LICENSE"),
        Deno.copyFile("README.md", "npm/README.md"),
        Deno.copyFile(".npmrc", "npm/.npmrc"),
        Deno.writeTextFile(mod, modText),
      ],
    );

    await execa(["deno", "fmt", mod]);

    // await execa(["npm", "publish"], {
    //   cwd: "./npm",
    // });
  },
});

function cleanModuleMetadata(text: string) {
  return text.replace(
    /if.*\(import.meta.main\).*{([\w\W]*)}/,
    "$1",
  )!;
}

function shebang(text: string) {
  return `#!/usr/bin/env node\n${text}`;
}
