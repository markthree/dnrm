import { brightGreen } from "https://deno.land/std@0.186.0/fmt/colors.ts";
import { ensureFile } from "https://deno.land/std@0.186.0/fs/ensure_file.ts";
import {
  Command,
  EnumType,
} from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";

import {
  getCurrentRegistry,
  getUserConfigPath,
  registryReg,
} from "./src/config.ts";
import {
  listRegistrys,
  listRegistrysWithNetworkDelay,
  registryKeys,
  registrys,
} from "./src/registrys.ts";

async function prepare(local?: boolean) {
  const configPath = await getUserConfigPath(local);
  await ensureFile(configPath);
  const configText = await Deno.readTextFile(configPath);
  const currentRegistry = getCurrentRegistry(configText);
  return { configPath, currentRegistry, configText };
}

if (import.meta.main) {
  const optionalRegistry = new EnumType(registryKeys);

  const ls = new Command().description("列出源").action(async () => {
    const { currentRegistry } = await prepare();
    console.log(listRegistrys(currentRegistry) + "\n");
  });

  const test = new Command().description("测试源").action(async () => {
    const { currentRegistry } = await prepare();
    console.log(await listRegistrysWithNetworkDelay(currentRegistry) + "\n");
  });

  const use = new Command()
    .description(`使用源`)
    .usage(`[${registryKeys.join("|")}]`)
    .type("optionalRegistry", optionalRegistry)
    .arguments("<registry:optionalRegistry>").option(
      "-l, --local",
      `设置 .npmrc 在本地`,
    ).action(
      async ({ local }, newRegistry) => {
        const {
          configPath,
          configText,
          currentRegistry,
        } = await prepare(local);

        if (newRegistry === currentRegistry) {
          console.log(listRegistrys(currentRegistry) + "\n");
          return;
        }
        let newConfigText: string;
        const registryValue = registrys[newRegistry];
        if (!registryReg.test(configText)) {
          newConfigText = configText + `registry=${registryValue}`;
        } else {
          newConfigText = configText.replace(registryReg, registryValue);
        }
        await Deno.writeTextFile(configPath, newConfigText);
        console.log(listRegistrys(newRegistry) + "\n");
      },
    );

  await new Command()
    .usage("[command|option]")
    .name("dnrm")
    .version("0.4.0")
    .description("deno 实现的 nrm，每次切换源都在 100ms 内，速度超级快")
    .action(async () => {
      const { currentRegistry } = await prepare();
      console.log(
        `\n ${
          brightGreen(`${currentRegistry} -> ${registrys[currentRegistry]}`)
        }\n`,
      );
    })
    .command("ls", ls)
    .command("test", test)
    .command("use", use)
    .parse(Deno.args);
}
