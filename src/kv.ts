import type { AnyFunction } from "https://deno.land/x/mtype@v0.2.9/mod.ts";

let kv: Deno.Kv;
export function useThermalFn<T extends AnyFunction>(
  fn: T,
  prefix = "dnrm",
) {
  const fnKey = fn.toString();
  return async function invoke(
    ...rest: Parameters<T>
  ): Promise<ReturnType<T>> {
    if (!kv) {
      kv = await Deno.openKv();
    }
    const keys = [fnKey, ...rest].flat();

    if (prefix) {
      keys.unshift(prefix);
    }

    const { value } = await kv.get(keys);

    if (value) {
      return value as ReturnType<T>;
    }

    const newValue = await fn.apply(null, rest);
    kv.set(keys, newValue);

    return newValue;
  };
}
