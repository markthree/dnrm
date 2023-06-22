<div align="center">
    <img width="100%" height="100%" src="./snapshot.gif" />
    <h1>dnrm</h1>
    <p><a href="https://deno.com/runtime" target="_blank">deno</a> 实现的 nrm，每次切换源都在 100ms 内，速度超级快</p>
</div>

<br />

## README 🦉

简体中文 | [English](./README_EN.md)

<br />

## Bench

[npm 镜像源工具速度对比](https://graphy.app/view/1cf14605-7fd1-4a85-bed8-90e2a7e204ae?caption=true)

<br />

## Usage

### install

#### 1. 模块安装

```shell
deno install --allow-read --allow-write --allow-env --allow-net -rfn dnrm https://deno.land/x/dnrm/mod.ts
```

如果你装了 [node](https://nodejs.org)，却没有安装过
[deno](https://deno.com/runtime) 👇

```shell
npx deno-npx install --allow-read --allow-write --allow-env --allow-net -rfn dnrm https://deno.land/x/dnrm/mod.ts
```

在一些不想装 [deno](https://deno.com/runtime) 的临时场景下 👇

```shell
# 注意: 这种使用方式仍然很慢，因为加载 deno 垫片需要时间
npm i deno-nrm -g
```

#### 2. 本地安装

1. 下载该项目到本地

2. 在项目根目录下执行命令

```shell
deno task install
```

### cli

```shell
# 查看当前源
dnrm

# 切换 taobao 源
dnrm use taobao

# 查看所有源
dnrm ls

# 测试所有源
dnrm test

# 设置源在本地
dnrm use taobao --local

# 查看帮助
dnrm -h

# 查看版本号
dnrm -V
```

<br />

## 优化原理

1. 热路径查询
2. `deno` 的冷启动比 `node` 更快
3. 自动区分使用场景，按需解析参数，按需加载低频模块，按需设置配置文件
4. 针对 `registry`
   配置使用正则快速获取和替换配置，不使用任何耗时的解析器，不需要序列化和反序列化
5. 直接针对配置文件进行配置替换，而不是调用子进程执行
   `npm config set registry=...`，因为 `npm` 内部分支太多，这是卡的主要原因

<br />

## License

Made with [markthree](https://github.com/markthree)

Published under [MIT License](./LICENSE).
