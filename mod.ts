import { brightGreen } from "https://deno.land/std@0.170.0/fmt/colors.ts";
import { ensureFile } from "https://deno.land/std@0.185.0/fs/mod.ts";
import {
  Command,
  EnumType,
} from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";

import {
  CONFIG_NAME,
  getCurrentRegistry,
  getNpmUserConfigPath,
} from "./src/config.ts";
import {
  listRegistrys,
  listRegistrysWithNetworkDelay,
  registrys,
} from "./src/registrys.ts";

async function prepare(local?: boolean) {
  const configPath = await getNpmUserConfigPath(local);
  await ensureFile(configPath);
  const currentRegistry = await getCurrentRegistry(configPath);
  return { configPath, currentRegistry };
}

if (import.meta.main) {
  const optionalRegistryKeys = Object.keys(registrys);
  const optionalRegistrys = new EnumType(optionalRegistryKeys);

  const ls = new Command().description("列出源").action(async () => {
    const { currentRegistry } = await prepare();
    console.log(listRegistrys(currentRegistry));
  });

  const test = new Command().description("测试源").action(async () => {
    const { currentRegistry } = await prepare();
    console.log(await listRegistrysWithNetworkDelay(currentRegistry));
  });

  const use = new Command()
    .description(`使用源`)
    .usage(`[${optionalRegistryKeys.join("|")}]`)
    .type("optionalRegistrys", optionalRegistrys)
    .arguments("<registry>:optionalRegistrys]").option(
      "-l, --local",
      `设置 ${CONFIG_NAME} 在本地`,
    ).action(
      async ({ local }, newRegistry) => {
        const { configPath, currentRegistry } = await prepare(local);
        if (newRegistry === currentRegistry) {
          console.log(listRegistrys(currentRegistry));
          return;
        }
        const configText = await Deno.readTextFile(configPath);
        const registryValue = `registry=${registrys[newRegistry as string]}`;
        let newConfigText: string;
        if (!currentRegistry) {
          newConfigText = configText + registryValue;
        } else {
          newConfigText = configText.replace(/registry=.*/, registryValue);
        }

        await Deno.writeTextFile(configPath, newConfigText);

        console.log(listRegistrys(newRegistry as string));
      },
    );

  await new Command()
    .usage("[ls|use]")
    .name("dnrm")
    .version("0.3.1")
    .description("类似 nrm，但是速度超级无敌快")
    .action(async () => {
      const { currentRegistry } = await prepare();
      console.log(
        `\n ${brightGreen(`${currentRegistry} -> ${registrys[currentRegistry]}`)}`,
      );
    })
    .command("ls", ls)
    .command("test", test)
    .command("use", use)
    .parse(Deno.args);
}
