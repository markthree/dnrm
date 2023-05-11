import { ensureFile } from "https://deno.land/std@0.186.0/fs/ensure_file.ts";
import { exists } from "https://deno.land/std@0.186.0/fs/exists.ts";
import { resolve } from "https://deno.land/std@0.186.0/path/mod.ts";
import { homedir } from "node:os";

import { registryKeys, registrys } from "./registrys.ts";

export async function ensureGetConfigPath(local = false) {
  const rc = ".npmrc";
  let configPath = rc;
  if (await exists(rc)) {
    return configPath;
  }
  if (!local) {
    configPath = resolve(homedir(), rc);
  }
  await ensureFile(configPath);
  return configPath;
}

export const registryReg = /(?<=registry=).*/;

function parseRegistry(text: string) {
  const [registry] = registryReg.exec(text) || [];
  return registry ?? "npm";
}

export function getConfigRegistry(configText: string) {
  const registry = parseRegistry(configText);
  return registryKeys.find((k) => {
    if (k === registry) {
      return registry
    }
    return registrys[k] === registry
  }) ?? registry;
}

export async function getConfig(local?: boolean) {
  const configPath = await ensureGetConfigPath(local);
  const configText = await Deno.readTextFile(configPath);
  const configRegistry = getConfigRegistry(configText);
  return { configPath, configRegistry, configText };
}
