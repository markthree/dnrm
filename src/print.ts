import { brightGreen } from "https://deno.land/std@0.186.0/fmt/colors.ts";

import {
  listRegistrys,
  listRegistrysWithNetworkDelay,
  registrys,
} from "./registrys.ts";

const newLine = "\n";

export function printListRegistrys(currentRegistry: string) {
  console.log(listRegistrys(currentRegistry) + newLine);
}

export async function printListRegistrysWithNetworkDelay(
  currentRegistry: string,
) {
  console.log(await listRegistrysWithNetworkDelay(currentRegistry) + newLine);
}

export function printCurrentRegistry(currentRegistry: string) {
  console.log(
    `${newLine} ${
      brightGreen(`${currentRegistry} -> ${registrys[currentRegistry]}`)
    } ${newLine}`,
  );
}
