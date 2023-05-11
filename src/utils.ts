function noop() {}

export function createDelay(s: number, flag: unknown = null) {
  let resolved = false;
  let resolve: (value?: unknown) => void = noop;

  const delay = new Promise((_resolve) => {
    const timeout = setTimeout(() => {
      _resolve(flag);
      resolved = true;
    }, s * 1000);
    resolve = (newFlag: unknown = flag) => {
      if (!resolved) {
        clearTimeout(timeout);
        _resolve(newFlag);
      }
    };
  });

  return {
    delay,
    resolve,
  };
}
