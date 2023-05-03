import { gray, green } from "https://deno.land/std@0.170.0/fmt/colors.ts";
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
  yarn: "https://registry.yarnpkg.com/",
  github: "https://npm.pkg.github.com/",
  taobao: "https://registry.npmmirror.com/",
  npmMirror: "https://skimdb.npmjs.com/registry/",
  tencent: "https://mirrors.cloud.tencent.com/npm/",
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

export function listRegistrys(currentRegistry: string) {
  const list = Object.entries(registrys).map(([k, v]) => {
    if (currentRegistry === k || currentRegistry === v) {
      return `\n ${green(`${k} → ${v}`)}`;
    }
    return `\n ${k}${gray(` → ${v}`)}`;
  });

  return list.join("");
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

async function prepare(local?: boolean) {
  const configPath = await getNpmUserConfigPath(local);
  await ensureFile(configPath);
  const currentRegistry = await getCurrentRegistry(configPath);
  return { configPath, currentRegistry };
}

if (import.meta.main) {
  const optionalRegistryKeys = Object.keys(registrys);
  const optionalRegistrys = new EnumType(optionalRegistryKeys);

  const use = new Command()
    .description(`使用新源`)
    .usage(`[${optionalRegistryKeys.join("|")}]`)
    .type("optionalRegistrys", optionalRegistrys)
    .arguments("<newRegistry>:optionalRegistrys]").option(
      "-l, --local",
      `设置 ${CONFIG_NAME} 在本地`,
    ).action(
      async ({ local }, newRegistry) => {
        const {
          configPath,
          currentRegistry,
        } = await prepare(local);

        if (!newRegistry || newRegistry === currentRegistry) {
          console.log(listRegistrys(currentRegistry));
          return;
        }

        const configText = await Deno.readTextFile(configPath);
        const registryValue = `registry=${registrys[newRegistry as string]}`;
        let newConfigText: string;
        if (!currentRegistry) {
          newConfigText = configText + registryValue;
        } else {
          newConfigText = configText.replace(/registry=.*/, registryValue);
        }

        await Deno.writeTextFile(configPath, newConfigText);

        console.log(listRegistrys(newRegistry as string));
      },
    );

  const ls = new Command().description("列出所有源").action(async () => {
    const { currentRegistry } = await prepare();
    console.log(listRegistrys(currentRegistry));
  });

  await new Command()
    .usage("[ls|use]")
    .name("dnrm")
    .version("0.2.0")
    .description("类似 nrm，但是速度超级无敌快")
    .action(async () => {
      const { currentRegistry } = await prepare();
      console.log(
        `\n ${green(`${currentRegistry} -> ${registrys[currentRegistry]}`)}`,
      );
    })
    .command("ls", ls)
    .command("use", use)
    .parse(Deno.args);
}
