import { brightGreen } from "https://deno.land/std@0.170.0/fmt/colors.ts";
import { ensureFile } from "https://deno.land/std@0.185.0/fs/ensure_file.ts";
import {
  Command,
  EnumType,
} from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";

import {
  CONFIG_NAME,
  getCurrentRegistry,
  getUserConfigPath,
} from "./src/config.ts";
import {
  listRegistrys,
  listRegistrysWithNetworkDelay,
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
  const optionalRegistryKeys = Object.keys(registrys);
  const optionalRegistry = new EnumType(optionalRegistryKeys);

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
    .usage(`[${optionalRegistryKeys.join("|")}]`)
    .type("optionalRegistry", optionalRegistry)
    .arguments("<registry:optionalRegistry>").option(
      "-l, --local",
      `设置 ${CONFIG_NAME} 在本地`,
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
        const registryValue = `registry=${registrys[newRegistry]}`;
        let newConfigText: string;
        if (!currentRegistry) {
          newConfigText = configText + registryValue;
        } else {
          newConfigText = configText.replace(/registry=.*/, registryValue);
        }
        await Deno.writeTextFile(configPath, newConfigText);
        console.log(listRegistrys(newRegistry) + "\n");
      },
    );

  await new Command()
    .usage("[command|option]")
    .name("dnrm")
    .version("0.3.3")
    .description("deno 实现的 nrm，每次切换源都在 200ms 内，速度超级快")
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
