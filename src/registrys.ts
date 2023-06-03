import {
  brightGreen,
  brightRed,
  deadline,
  gray,
  joinToString,
  type JoinToStringOptions,
  SECOND,
  yellow,
} from "./deps.ts";

export interface Registrys {
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

export const registryKeys = Object.keys(registrys);

export const listJoinToStringOptions: JoinToStringOptions = {
  suffix: "\n",
  prefix: "\n ",
  separator: "\n ",
};

function bypass<T extends any>(t: T) {
  return t;
}
export function listRegistrys(
  configRegistry: string,
  format: (v: string) => string = bypass,
) {
  return joinToString(registryKeys, (k) => {
    const v = registrys[k];
    if (configRegistry === k) {
      return format(`${brightGreen(`${k} → ${v}`)}`);
    }
    return format(`${k}${gray(` → ${v}`)}`);
  }, listJoinToStringOptions);
}

export function getRegistrysNetworkDelay(
  ms = 2000,
) {
  return Promise.all(
    registryKeys.map(async (k) => {
      const url = registrys[k];
      const controller = new AbortController();
      try {
        const start = Date.now();
        const request = fetch(url, { signal: controller.signal });
        await deadline(request, ms);
        return Date.now() - start;
      } catch (_) {
        controller.abort();
      }
      return Infinity;
    }),
  );
}

export function printListRegistrys(registry: string) {
  console.log(listRegistrys(registry));
}

export async function printListRegistrysWithNetworkDelay(
  registry: string,
  ms = 2000,
) {
  const delays = await getRegistrysNetworkDelay(ms);
  function format(text: string) {
    const delay = delays.shift()! / SECOND;
    if (delay === Infinity) {
      return text + ` ${brightRed(`> ${ms / SECOND}s`)}`;
    }
    const delayText = `${delay.toFixed(2)}s`;
    return text + ` ${delay < 1 ? brightGreen(delayText) : yellow(delayText)}`;
  }
  console.log(listRegistrys(registry, format));
}

export function printRegistry(registry: string) {
  console.log(
    `\n ${brightGreen(`${registry} -> ${registrys[registry]}`)} \n`,
  );
}
