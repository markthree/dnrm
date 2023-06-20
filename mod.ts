import { getConfig } from "./src/config.ts";
import { printRegistry } from "./src/registrys.ts";

if (import.meta.main) {
  if (Deno.args.length === 0) {
    const { configRegistry } = await getConfig();
    printRegistry(configRegistry);
  } else {
    // In most cases, we don't need to parse args, so we delay importing the module
    const { action } = await import("./src/cli.ts");
    await action();
  }
}
