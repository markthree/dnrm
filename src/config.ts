import { homedir } from "node:os";
import { registryReg } from "./constant.ts";
import { exists } from "https://deno.land/std@0.195.0/fs/exists.ts";
import { hotUrlRegistrys, registryKeys, registrys } from "./constant.ts";

async function getConfigPath(local = false) {
  const rc = ".npmrc";
  if (local || (await exists(rc, { isFile: true }))) {
    return rc;
  }
  return `${homedir().replaceAll("\\", "/")}/${rc}`;
}

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
