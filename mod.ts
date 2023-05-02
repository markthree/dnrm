import { execaWithThermal } from "./src/process.ts";
import { load } from "https://deno.land/std@0.185.0/dotenv/mod.ts";
import {
  Command,
  EnumType,
} from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";

interface Registrys {
  [k: string]: string;
}

export const registrys: Registrys = {
  npm: "https://registry.npmjs.org/",
  cnpm: "https://registry.npmmirror.com/",
};

export async function getNpmUserConfigPath() {
  const configPath = await execaWithThermal("npm", [
    "config",
    "get",
    "userconfig",
  ]);
  return configPath.trim();
}

export async function getNpmUserConfig(configPath: string) {
  const config = await load({
    envPath: configPath,
  });

  return config;
}

function normalizeRegistry(registry: string) {
  for (const k in registrys) {
    if (Object.prototype.hasOwnProperty.call(registrys, k)) {
      const v = registrys[k];
      if (v === registry) {
        return k;
      }
    }
  }
  return registry;
}

if (import.meta.main) {
  const optionalRegistrys = new EnumType(Object.keys(registrys));
  await new Command()
    .name("dnrm")
    .version("0.0.1")
    .description("快速切换 npm 源")
    .type("optionalRegistrys", optionalRegistrys)
    .arguments("[registry:optionalRegistrys]")
    .action(async (_, newRegistry) => {
      console.log();
      const configPath = await getNpmUserConfigPath();
      const { registry } = await getNpmUserConfig(configPath);
      const currentRegistry = normalizeRegistry(registry);
      if (!newRegistry || newRegistry === currentRegistry) {
        console.log(`当前源为 %c${currentRegistry}`, "color: green");
        return;
      }
      const configText = await Deno.readTextFile(configPath);
      const registryValue = `registry=${registrys[newRegistry]}`;
      let newConfigText: string;
      if (!currentRegistry) {
        newConfigText = configText + registryValue;
      } else {
        newConfigText = configText.replace(/registry=.*/, registryValue);
      }

      await Deno.writeTextFile(configPath, newConfigText);

      console.log(`√ 成功切换 %c${newRegistry}`, `color: green`);
    })
    .parse(Deno.args);
}
