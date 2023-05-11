import {
  brightGreen,
  brightRed,
  dim,
  gray,
  yellow,
} from "https://deno.land/std@0.186.0/fmt/colors.ts";

import { createDelay } from "./utils.ts";

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

export function listRegistrys(currentRegistry: string) {
  const list = registryKeys.map((k) => {
    const v = registrys[k];
    if (currentRegistry === k) {
      return `\n ${brightGreen(`${k} → ${v}`)}`;
    }
    return `\n ${k}${gray(` → ${v}`)}`;
  });

  return list.join("");
}

export async function listRegistrysWithNetworkDelay(
  currentRegistry: string,
  timeoutDlay = 2,
) {
  const TIMEOUT_ERROR = new Error("timeout");
  const list = await Promise.all(
    registryKeys.map(async (k, timeoutFlag) => {
      const v = registrys[k];
      let delayText: string;
      const { delay, resolve } = createDelay(timeoutDlay, timeoutFlag);
      const controller = new AbortController();
      try {
        const start = Date.now();
        const result = await Promise.race([
          delay,
          fetch(v, { signal: controller.signal }),
        ]);
        if (result === timeoutFlag) {
          throw TIMEOUT_ERROR;
        }
        const finalDelay = (Date.now() - start) / 1000;
        delayText = `${finalDelay.toFixed(2)}s`;
        delayText = finalDelay < 1
          ? brightGreen(delayText)
          : dim(yellow(delayText));
      } catch (_) {
        delayText = dim(brightRed(`> ${timeoutDlay}s`));
        controller.abort();
      } finally {
        resolve();
      }
      if (currentRegistry === k) {
        return `\n ${brightGreen(`${k} → ${v}`)} ${delayText}`;
      }
      return `\n ${k}${gray(` → ${v}`)} ${delayText}`;
    }),
  );

  return list.join("");
}
