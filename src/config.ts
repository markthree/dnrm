import { exists } from "https://deno.land/std@0.186.0/fs/exists.ts";
import { resolve } from "https://deno.land/std@0.186.0/path/mod.ts";
import { homedir } from "node:os";

import { registryKeys, registrys } from "./registrys.ts";

export const NPMRC = ".npmrc";

export async function getUserConfigPath(local = false) {
  if (local || await exists(NPMRC)) {
    return NPMRC;
  }
  return resolve(homedir(), NPMRC);
}

export const registryReg = /(?<=registry=).*/;

function parseRegistry(text: string) {
  const [registry] = registryReg.exec(text) || [];
  return registry ?? "npm";
}

export function getCurrentRegistry(configText: string) {
  const registry = parseRegistry(configText);
  return registryKeys.find((k) => registrys[k] === registry) ?? registry;
}
