import { Command, EnumType } from "./src/deps.ts";

import { getConfig, registryReg } from "./src/config.ts";
import {
  printListRegistrys,
  printListRegistrysWithNetworkDelay,
  printRegistry,
  registryKeys,
  registrys,
} from "./src/registrys.ts";
import { version } from "./src/version.ts";

if (import.meta.main) {
  const optionalRegistry = new EnumType(registryKeys);

  const ls = new Command().description("列出源").action(async () => {
    const { configRegistry } = await getConfig();
    printListRegistrys(configRegistry);
  });

  const test = new Command().description("测试源").action(async () => {
    const { configRegistry } = await getConfig();
    await printListRegistrysWithNetworkDelay(configRegistry);
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
          configRegistry,
        } = await getConfig(local);

        let newConfigText: string | undefined;
        const url = registrys[newRegistry];

        if (configText.length === 0) {
          // create
          newConfigText = `registry=${url}`;
        } else if (!registryReg.test(configText)) {
          // append
          newConfigText = configText + `\nregistry=${url}`;
        } else {
          // update
          if (newRegistry !== configRegistry) {
            newConfigText = configText.replace(registryReg, url);
          }
        }

        if (newConfigText) {
          await Deno.writeTextFile(configPath, newConfigText);
        }
        printListRegistrys(newRegistry);
      },
    );

  await new Command()
    .usage("[command|option]")
    .name("dnrm")
    .version(version)
    .description("deno 实现的 nrm，每次切换源都在 100ms 内，速度超级快")
    .action(async () => {
      const { configRegistry } = await getConfig();
      printRegistry(configRegistry);
    })
    .command("ls", ls)
    .command("test", test)
    .command("use", use)
    .parse(Deno.args);
}
