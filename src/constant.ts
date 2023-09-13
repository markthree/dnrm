export { SECOND } from "https://deno.land/std@0.201.0/datetime/constants.ts";

export const registryReg = /(?<=registry=).*/;

interface Registrys {
  [k: string]: string;
}

/**
 * Hot path for quick search
 * 热路径以便快速查询
 */
export const hotUrlRegistrys: Record<
  string,
  string
> = {
  "https://registry.npmjs.org/": "npm",
  "https://registry.npmmirror.com/": "taobao",
};

export const registrys: Registrys = {
  npm: "https://registry.npmjs.org/",
  yarn: "https://registry.yarnpkg.com/",
  github: "https://npm.pkg.github.com/",
  taobao: "https://registry.npmmirror.com/",
  npmMirror: "https://skimdb.npmjs.com/registry/",
  tencent: "https://mirrors.cloud.tencent.com/npm/",
};

export const registryKeys = Object.keys(registrys);

export const line = "\n";
