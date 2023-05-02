import { which as _which } from "https://deno.land/x/which@0.3.0/mod.ts";

import { useThermalFn } from "./kv.ts";

const which = useThermalFn((command: string) => _which(command));

let textDecoder: TextDecoder;

export async function execa(command: string, args: string[] = []) {
  const commandPath = await which(command);
  if (!commandPath) {
    throw new Deno.errors.NotFound(`${command} commandPath is notFound!`);
  }
  const p = new Deno.Command(commandPath, {
    args,
  });

  const { stdout, stderr, success } = await p.output();

  if (!textDecoder) {
    textDecoder = new TextDecoder();
  }

  if (!success) {
    throw new Error(textDecoder.decode(stderr));
  }

  return textDecoder.decode(stdout);
}

export const execaWithThermal = useThermalFn(execa);
