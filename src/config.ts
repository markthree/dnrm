import { ensureFile, exists, homedir, resolve } from "./deps.ts";
import { registryKeys, registrys } from "./registrys.ts";

export async function ensureGetConfigPath(local = false) {
  let rc = ".npmrc";
  if (await exists(rc)) {
    return rc;
  }
  if (!local) {
    rc = resolve(homedir(), rc);
  }
  await ensureFile(rc);
  return rc;
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
      return registry;
    }
    return registrys[k] === registry;
  }) ?? registry;
}

export async function getConfig(local?: boolean) {
  const configPath = await ensureGetConfigPath(local);
  const configText = await Deno.readTextFile(configPath);
  const configRegistry = getConfigRegistry(configText);
  return { configPath, configRegistry, configText };
}
