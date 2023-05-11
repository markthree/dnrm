import { brightGreen } from "https://deno.land/std@0.186.0/fmt/colors.ts";

import {
  listRegistrys,
  listRegistrysWithNetworkDelay,
  registrys,
} from "./registrys.ts";

const newLine = "\n";

export function printListRegistrys(registry: string) {
  console.log(listRegistrys(registry) + newLine);
}

export async function printListRegistrysWithNetworkDelay(
  registry: string,
) {
  console.log(await listRegistrysWithNetworkDelay(registry) + newLine);
}

export function printConfigRegistry(registry: string) {
  console.log(
    `${newLine} ${
      brightGreen(`${registry} -> ${registrys[registry]}`)
    } ${newLine}`,
  );
}
