import {
  brightGreen,
  brightRed,
  deadline,
  gray,
  joinToString,
  SECOND,
  yellow,
} from "./deps.ts";

export interface Registrys {
  [k: string]: string;
}

/**
 * Hot path for quick search
 */
export const hotUrlRegistrys: Record<
  string,
  string
> = {
  "https://registry.npmjs.org/": "npm",
  "https://registry.npmmirror.com/": "taobao",
};

export const registrys: Registrys = {
  npm: "https://registry.npmjs.org/",
  yarn: "https://registry.yarnpkg.com/",
  github: "https://npm.pkg.github.com/",
  taobao: "https://registry.npmmirror.com/",
  npmMirror: "https://skimdb.npmjs.com/registry/",
  tencent: "https://mirrors.cloud.tencent.com/npm/",
};

export const registryKeys = Object.keys(registrys);

export function listRegistrys(
  configRegistry: string,
  format?: (v: string) => string,
) {
  const line = "\n ";
  const hasFormat = typeof format === "function";

  return joinToString(registryKeys, selector, {
    suffix: line,
    prefix: line,
    separator: line,
  });

  function selector(k: string) {
    const v = registrys[k];
    const text = configRegistry === k
      ? `${brightGreen(`${k} → ${v}`)}`
      : `${k}${gray(` → ${v}`)}`;
    return hasFormat ? format(text) : text;
  }
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
  const timeoutText = ` ${brightRed(`> ${ms / SECOND}s`)}`;
  function format(text: string) {
    const delay = delays.shift()! / SECOND;
    if (delay === Infinity) {
      return text + timeoutText;
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
