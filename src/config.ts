import { exists, homedir, resolve } from "./deps.ts";
import { hotUrlRegistrys, registryKeys, registrys } from "./registrys.ts";

async function getConfigPath(local = false) {
  const rc = ".npmrc";
  if (local || (await exists(rc, { isFile: true, isReadable: true }))) {
    return rc;
  }
  return resolve(homedir(), rc);
}

export const registryReg = /(?<=registry=).*/;

export function getConfigRegistry(configText: string) {
  const [url = ""] = registryReg.exec(configText) || [];
  return hotUrlRegistrys[url] ??
    registryKeys.find((k) => registrys[k] === url);
}

export async function getConfig(local?: boolean) {
  const configPath = await getConfigPath(local);
  try {
    const configText = await Deno.readTextFile(configPath);
    const configRegistry = getConfigRegistry(configText) ?? "npm";
    return { configPath, configRegistry, configText };
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return {
        configPath,
        configText: "",
        configRegistry: "npm",
      };
    }
    throw error;
  }
}
