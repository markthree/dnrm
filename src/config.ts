import { homedir } from "node:os";
import { registryReg } from "./constant.ts";
import { exists } from "https://deno.land/std@0.205.0/fs/exists.ts";
import { hotUrlRegistrys, registryKeys, registrys } from "./constant.ts";

async function getConfigPath(local?: boolean) {
  const rc = ".npmrc";

  if (local === undefined) {
    if (await exists(rc, { isFile: true })) {
      return rc;
    }
    return getHomeDirRc();
  }

  return local ? rc : getHomeDirRc();

  function getHomeDirRc() {
    return `${homedir().replaceAll("\\", "/")}/${rc}`;
  }
}

export function getConfigRegistry(configText: string) {
  const [url = ""] = registryReg.exec(configText) || [];

  const hotUrlRegistry = hotUrlRegistrys[url];

  if (hotUrlRegistry) {
    return hotUrlRegistry;
  }

  return registryKeys.find((k) => registrys[k] === url);
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
