# 按需引入

`ds-ui` 的 `package.json` 声明了 `"sideEffects": false`，打包工具可以安全地摇掉没有用到的组件。

## 推荐：直接导入

```vue
<script setup>
  import { STable, SForm } from 'ds-ui';
</script>

<template>
  <s-table ... />
  <s-form ... />
</template>
```

这是最简单的方式，也最容易摇树。

## 按需全局注册

需要在模板里到处用、又不想每个文件都 import 时：

```ts
import { createApp } from 'vue';
import * as DsUI from 'ds-ui';
import { create } from 'ds-ui';

const app = createApp(App);

app.use(
  create({
    components: [DsUI.STable, DsUI.SForm, DsUI.SModal],
  }),
);

app.mount('#app');
```

只有列出来的组件会被注册和打包。

## 默认预设

```ts
import DsUI, { defaultComponents } from 'ds-ui';

app.use(DsUI); // 注册全部 8 个组件
console.log(defaultComponents); // ['STable', 'SForm', ...]
```

::: warning **注意**：这会失去摇树能力。如果项目对产物体积敏感，请用上面的按需方式。:::

想扩展默认预设，把默认列表当成起点：

```ts
import { create, defaultComponents, STable } from 'ds-ui';

app.use(
  create({
    components: [...defaultComponents, MyComponent],
  }),
);
```

## 组件名前缀

默认前缀是 `S`。需要改成别的：

```ts
create({ components: [...], componentPrefix: 'Ds' });
```

## 验证摇树是否生效

打包后检查产物里有没有你没用的组件：

```bash
# 产物里不应该出现 Message 组件的图标资源
ls node_modules/.vite/ 2>/dev/null
grep -c 's-message' dist/assets/*.js
```

更直接的办法是看打包产物的体积对比 —— 引入全部组件和只引入 `STable` 的差距通常在 100KB 量级（未压缩）。
