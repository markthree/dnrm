import { version } from "./src/version.ts";
import { build, emptyDir } from "https://deno.land/x/dnt@0.37.0/mod.ts";
import { execa } from "https://deno.land/x/ndeno@v1.4.2/src/process.ts";

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
    await Promise.all(
      [
        Deno.copyFile("LICENSE", "npm/LICENSE"),
        Deno.copyFile("README.md", "npm/README.md"),
        cleanModuleMetadata(),
      ],
    );
    await execa(["npm", "publish"], {
      cwd: "./npm",
    });
  },
});

async function cleanModuleMetadata() {
  const mod = "npm/esm/mod.js";

  const text = await Deno.readTextFile(mod);

  const normalizedText = text.replace(
    /if.*\(import.meta.main\).*{([\w\W]*)}/,
    "$1",
  )!;

  await Deno.writeTextFile(mod, normalizedText);
}
