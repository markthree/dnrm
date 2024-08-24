import { EnumType } from "https://deno.land/x/cliffy@v1.0.0-rc.4/command/types/enum.ts";
import { Command } from "https://deno.land/x/cliffy@v1.0.0-rc.4/command/command.ts";

import { line, registryKeys, registryReg, registrys } from "./constant.ts";
import { getConfig } from "./config.ts";
import { printListRegistrys } from "./registrys.ts";
import { version } from "./version.ts";

export async function action() {
  const optionalRegistry = new EnumType(registryKeys);

  const ls = new Command()
    .description(`列出源`).option("-g, --global", `全局`).action(
      async ({ global }) => {
        const { configRegistry } = await getConfig(
          global === undefined ? undefined : !global,
        );
        printListRegistrys(configRegistry, global);
      },
    );

  const use = new Command()
    .description(`使用源`)
    .usage(`[${registryKeys.join("|")}]`)
    .type("optionalRegistry", optionalRegistry)
    .arguments("<registry:optionalRegistry>").option("-g, --global", `全局设置`)
    .option(
      "-l, --local",
      `本地项目设置`,
    ).action(
      async ({ global, local }, newRegistry) => {
        const {
          configPath,
          configText,
          configRegistry,
        } = await getConfig(global ? false : local);

        let newConfigText: string | undefined;
        const url = registrys[newRegistry];

        if (configText.length === 0) {
          // create
          newConfigText = `registry=${url}`;
        } else if (!registryReg.test(configText)) {
          // append
          let newRegistryText = `registry=${url}`;
          if (!configText.endsWith(line)) {
            newRegistryText = line + newRegistryText;
          }
          newConfigText = configText + newRegistryText;
        } else {
          // update
          if (newRegistry !== configRegistry) {
            newConfigText = configText.replace(registryReg, url);
          }
        }

        if (newConfigText) {
          await Deno.writeTextFile(configPath, newConfigText);
        }
        printListRegistrys(newRegistry, global);
      },
    );

  await new Command()
    .usage("[command|option]")
    .name("dnrm")
    .version(version)
    .description("deno 实现的 nrm，每次切换源都在 100ms 内，速度超级快")
    .command("ls", ls)
    .command("test", "测试源")
    .command("use", use)
    .parse(Deno.args);
}
