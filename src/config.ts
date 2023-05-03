import { load } from "https://deno.land/std@0.185.0/dotenv/mod.ts";
import { exists } from "https://deno.land/std@0.185.0/fs/mod.ts";
import { resolve } from "https://deno.land/std@0.185.0/path/mod.ts";
import { homedir } from "node:os";

import { execa, execaWithThermal } from "./process.ts";
import { registrys } from "./registrys.ts";

export const CONFIG_NAME = ".npmrc";

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

export function getNpmUserConfig(configPath: string) {
  return load({
    envPath: configPath,
  });
}

export async function getCurrentRegistry(configPath: string) {
  const { registry } = await getNpmUserConfig(configPath);
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
