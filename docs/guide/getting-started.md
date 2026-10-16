# 安装

## 环境要求

| 依赖               | 版本      |
| ------------------ | --------- |
| Vue                | `^3.4.0`  |
| Naive UI           | `^2.40.0` |
| Node（参与开发时） | `>= 18`   |

## 安装

::: code-group

```bash [npm]
npm install ds-ui naive-ui
```

```bash [pnpm]
pnpm add ds-ui naive-ui
```

```bash [yarn]
yarn add ds-ui naive-ui
```

:::

`vue` 是 peer 依赖，不会被安装。请确认你的项目已经在用 Vue 3.4 以上。

## 引入样式

`ds-ui` 的组件样式会被打包成一个单独的 css 文件，在应用入口引入一次即可：

```ts
// main.ts
import 'ds-ui/style.css';
```

如果你使用 Vite/Webpack 且没有显式引入，通常也不需要额外配置 —— 组件样式不依赖 JS 注入。

## 验证安装

新建一个最简单的用例：

```vue
<script setup>
  import { STable } from 'ds-ui';
</script>

<template>
  <s-table :columns="[{ title: '名称', key: 'name' }]" :data="[{ name: '你好' }]" />
</template>
```

能看到表格就说明装好了。
