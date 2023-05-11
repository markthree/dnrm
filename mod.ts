import {
  Command,
  EnumType,
} from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";

import { getConfig, registryReg } from "./src/config.ts";
import {
  printCurrentRegistry,
  printListRegistrys,
  printListRegistrysWithNetworkDelay,
} from "./src/print.ts";
import { registryKeys, registrys } from "./src/registrys.ts";

if (import.meta.main) {
  const optionalRegistry = new EnumType(registryKeys);

  const ls = new Command().description("列出源").action(async () => {
    const { currentRegistry } = await getConfig();
    printListRegistrys(currentRegistry);
  });

  const test = new Command().description("测试源").action(async () => {
    const { currentRegistry } = await getConfig();
    await printListRegistrysWithNetworkDelay(currentRegistry);
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
        } = await getConfig(local);

        if (newRegistry !== currentRegistry) {
          let newConfigText: string;
          const registryValue = registrys[newRegistry];
          if (!registryReg.test(configText)) {
            newConfigText = configText + `registry=${registryValue}`;
          } else {
            newConfigText = configText.replace(registryReg, registryValue);
          }
          await Deno.writeTextFile(configPath, newConfigText);
        }

        printListRegistrys(newRegistry);
      },
    );

  await new Command()
    .usage("[command|option]")
    .name("dnrm")
    .version("0.4.2")
    .description("deno 实现的 nrm，每次切换源都在 100ms 内，速度超级快")
    .action(async () => {
      const { currentRegistry } = await getConfig();
      printCurrentRegistry(currentRegistry);
    })
    .command("ls", ls)
    .command("test", test)
    .command("use", use)
    .parse(Deno.args);
}
