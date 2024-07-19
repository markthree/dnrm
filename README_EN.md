<div align="center">
    <img width="100%" height="100%" src="./snapshot.gif" />
    <h1>dnrm</h1>
    <p><a href="https://deno.com/runtime" target="_blank">deno</a> implementation of nrm, each switch source within 100ms, super fast</p>
</div>

<br />

## README 🦉

[简体中文](./README.md) | English

<br />

## Bench

[Comparison of npm mirror source tools speed](https://graphy.app/view/1cf14605-7fd1-4a85-bed8-90e2a7e204ae?caption=true)

<br />

## Usage

### install

#### 1. Module Installation

```shell
deno install --allow-read --allow-sys --allow-write --allow-env --allow-net -rfn dnrm https://deno.land/x/dnrm/mod.ts
```

If you have [node](https://nodejs.org) installed but have not installed
[deno](https://deno.com/runtime) 👇

```shell
npx deno-npx install --allow-read --allow-write --allow-env --allow-net -rfn dnrm https://deno.land/x/dnrm/mod.ts
```

In some temporary scenarios where you don't want to install
[deno](https://deno.com/runtime) 👇

```shell
# Note: This usage is still slow because it takes time to load the deno shims
npm i deno-nrm -g
```

#### 2. Local Installation

1. Download the project locally

2. Execute the command in the project root directory

```shell
deno task install
```

### cli

```shell
# View current source
dnrm

# Switch taobao source
dnrm use taobao

# View all sources
dnrm ls

# Test all sources
dnrm test

# Set the source locally
dnrm use taobao --local

# View Help
dnrm -h

# View version
dnrm -V
```

<br />

## Optimization Principle

1. Hot Path Search
2. `deno` has a faster cold start than `node`.
3. Automatically distinguish usage scenarios, parse parameters on demand, load
   low-frequency modules on demand, and set profiles on demand
4. use regular configuration for `registry` configuration to quickly fetch and
   replace configuration without any time-consuming parser, no serialization and
   deserialization
5. replace the configuration directly against the configuration file instead of
   calling a child process to do `npm config set registry=...`, because `npm`
   has too many internal branches, which is the main reason for getting stuck

<br />

## License

Made with [markthree](https://github.com/markthree)

Published under [MIT License](./LICENSE).
