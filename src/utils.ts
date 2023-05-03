function noop() {}

export function createDelay(s: number, flag: unknown = null) {
  let resolve: (value?: unknown) => void = noop;
  let resolved = false;

  const delay = new Promise((_resolve) => {
    resolve = (newFlag: unknown = flag) => {
      if (!resolved) {
        _resolve(newFlag);
      }
    };
    setTimeout(() => {
      _resolve(flag);
      resolved = true;
    }, s * 1000);
  });

  return {
    delay,
    resolve,
  };
}
