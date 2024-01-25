import {
  brightGreen,
  brightRed,
  gray,
  yellow,
} from "https://deno.land/std@0.205.0/fmt/colors.ts";

import { line, registryKeys, registrys, SECOND } from "./constant.ts";

export function listRegistrys(
  configRegistry: string,
  format?: (v: string, isSelected?: boolean) => string,
) {
  const hasFormat = typeof format === "function";

  let result = "";

  for (const k of registryKeys) {
    result += line + selector(k);
  }

  return result + line;

  function selector(k: string) {
    const v = registrys[k];
    const isSelected = configRegistry === k;
    const text = isSelected
      ? `${brightGreen(`${k} → ${v}`)}`
      : `${k}${gray(` → ${v}`)}`;
    return hasFormat ? format(text, isSelected) : text;
  }
}

export async function getRegistrysNetworkDelay(ms = 2 * SECOND) {
  // test is a low frequency event, so delay the import of the module
  const { deadline } = await import(
    "https://deno.land/std@0.204.0/async/deadline.ts"
  );

  return Promise.all(registryKeys.map(getDelay));

  async function getDelay(k: string) {
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
  }
}

export function printListRegistrys(registry: string, global = false) {
  if (global) {
    console.log(
      listRegistrys(registry, (text, isSelected) => {
        return isSelected ? `${text} ${gray("(global)")}` : text;
      }),
    );
    return;
  }
  console.log(listRegistrys(registry));
}

export async function printListRegistrysWithNetworkDelay(
  registry: string,
  ms = 2000,
) {
  const delays = await getRegistrysNetworkDelay(ms);
  const timeoutText = ` ${brightRed(`> ${ms / SECOND}s`)}`;
  console.log(listRegistrys(registry, format));

  function format(text: string) {
    const delay = delays.shift()! / SECOND;
    if (delay === Infinity) {
      return text + timeoutText;
    }
    const delayText = `${delay.toFixed(2)}s`;
    return text + ` ${delay < 1 ? brightGreen(delayText) : yellow(delayText)}`;
  }
}

export function printRegistry(registry: string) {
  console.log(
    `${line}${brightGreen(`${registry} -> ${registrys[registry]}`)}${line}`,
  );
}
