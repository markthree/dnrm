import { load } from "https://deno.land/std@0.185.0/dotenv/mod.ts";
import { ensureFile, exists } from "https://deno.land/std@0.185.0/fs/mod.ts";
import { resolve } from "https://deno.land/std@0.185.0/path/mod.ts";
import {
  Command,
  EnumType,
} from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";
import { homedir } from "node:os";

import { execa, execaWithThermal } from "./src/process.ts";

const CONFIG_NAME = ".npmrc";

interface Registrys {
  [k: string]: string;
}

export const registrys: Registrys = {
  npm: "https://registry.npmjs.org/",
  cnpm: "https://registry.npmmirror.com/",
};

export async function getNpmUserConfigPath(local = false) {
  const nearestConfigPath = resolve(Deno.cwd(), CONFIG_NAME);
  if (local || await exists(nearestConfigPath)) {
    return nearestConfigPath;
  }
  const configPath = await execaWithThermal("npm", [
    "config",
    "get",
    "userconfig",
  ]);

  if (!configPath) {
    const globalConfigPath = resolve(homedir(), CONFIG_NAME);
    await execa("npm", [
      "config",
      "set",
      `userconfig=${globalConfigPath}`,
    ]);
    return globalConfigPath;
  }

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
  const optionalRegistryKeys = Object.keys(registrys);
  const optionalRegistrys = new EnumType(optionalRegistryKeys);
  await new Command()
    .name("dnrm")
    .version("0.1.1")
    .description("类似 nrm，但是速度超级无敌快")
    .usage(`[${optionalRegistryKeys.join("|")}]`)
    .type("optionalRegistrys", optionalRegistrys)
    .option("-l, --local", "本地项目下生效")
    .arguments("[registry:optionalRegistrys]")
    .action(async ({ local }, newRegistry) => {
      console.log();
      const configPath = await getNpmUserConfigPath(local);
      await ensureFile(configPath);
      const { registry } = await getNpmUserConfig(configPath);
      const currentRegistry = normalizeRegistry(registry);
      if (!newRegistry || newRegistry === currentRegistry) {
        console.log(`%c${currentRegistry}`, "color: green");
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

      console.log(`√ %c${newRegistry}`, `color: green`);
    })
    .parse(Deno.args);
}
