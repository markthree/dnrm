import { getConfig } from "./src/config.ts";
import {
  printListRegistrysWithNetworkDelay,
  printRegistry,
} from "./src/registrys.ts";

// Avoid using await at the top level to support lower versions of node
// 避免顶层使用 await 以支持更低版本的 node
async function runMain() {
  const { args } = Deno;
  // Simple usage should be executed early and avoid time-consuming parameter parsing and module loading
  // 简单的使用应该提前执行，并避免耗时的参数解析和模块加载
  if (args.length === 0) {
    const { configRegistry } = await getConfig();
    printRegistry(configRegistry);
    Deno.exit(0);
  }

  if (args[0] === "test") {
    const { configRegistry } = await getConfig();
    await printListRegistrysWithNetworkDelay(configRegistry);
    Deno.exit(0);
  }

  // Complex usage and parameter parsing, post and dynamic import for better performance
  // 复杂的使用场景和参数解析，应该后置并按需导入以提高性能
  const { action } = await import("./src/cli.ts");
  await action();
}

if (import.meta.main) {
  runMain();
}
