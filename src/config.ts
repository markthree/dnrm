import { exists } from "https://deno.land/std@0.185.0/fs/exists.ts";
import { resolve } from "https://deno.land/std@0.185.0/path/mod.ts";
import { homedir } from "node:os";

import { execa, execaWithThermal } from "./process.ts";
import { registryKeys, registrys } from "./registrys.ts";

export const CONFIG_NAME = ".npmrc";

export async function getUserConfigPath(local = false) {
  if (local || await exists(CONFIG_NAME)) {
    return CONFIG_NAME;
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

export const registryReg = /(?<=registry=).*/;

function parseRegistry(text: string) {
  const [registry] = text.match(registryReg) || [];
  return registry ?? "npm";
}

export function getCurrentRegistry(configText: string) {
  const registry = parseRegistry(configText);
  return registryKeys.find((k) => {
    const v = registrys[k];
    return v === registry;
  }) ?? registry;
}
