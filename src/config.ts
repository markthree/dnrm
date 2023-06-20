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

export function getConfigRegistry(configText: string) {
  const [url] = registryReg.exec(configText) || [];
  return registryKeys.find((k) => registrys[k] === url);
}

export async function getConfig(local?: boolean) {
  const configPath = await ensureGetConfigPath(local);
  const configText = await Deno.readTextFile(configPath);
  const configRegistry = getConfigRegistry(configText) ?? "npm";
  return { configPath, configRegistry, configText };
}
