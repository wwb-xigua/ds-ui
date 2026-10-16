# 主题定制

## 为什么 ds-ui 的组件能跟随主题

因为 Naive UI 是**外部依赖**，不在产物里。

这一点很关键。多数组件库会把底座 UI 打包进自己的产物里，于是应用的根节点上会出现**两份 Naive UI 实例**。Naive UI 的主题是通过 `provide` / `inject` 传递的，两份实例的注入 key 不同，主题就传不进去 —— 你会发现自己的 `n-config-provider` 对第三方组件完全无效。

`ds-ui` 把 `naive-ui` 标记为 external，构建产物里只保留 `import { ... } from "naive-ui"`。运行时解析到的是**你项目里的那一份**，所以只有一个实例，主题自然通畅。

你可以自行验证产物：

```bash
npm run build
grep 'from "naive-ui"' dist/ds-ui.js    # 有这行说明是外部引用
grep 'seemly' dist/ds-ui.js             # 没有输出说明没有内联
```

仓库里也有 `npm run verify:build`，CI 会在依赖被重新内联时直接失败。

## 切换暗色模式

```vue
<script setup>
  import { ref } from 'vue';
  import { darkTheme, zhCN, dateZhCN } from 'naive-ui';

  const dark = ref(false);
</script>

<template>
  <n-config-provider :theme="dark ? darkTheme : null" :locale="zhCN" :date-locale="dateZhCN">
    <n-global-style />
    <button @click="dark = !dark">切换主题</button>

    <s-table :columns="columns" :data="data" />
  </n-config-provider>
</template>
```

`STable` 里的分页器、下拉框、日期选择器都会跟随切换。

## 全局主题

Naive UI 的 `themeOverrides` 同样有效：

```ts
import type { GlobalThemeOverrides } from 'naive-ui';

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#109594',
    primaryColorHover: '#0d7f7e',
    primaryColorPressed: '#0a6a69',
    borderRadius: '6px',
  },
  DataTable: {
    thFontWeight: '600',
    thColor: '#f5f7fa',
  },
};
```

## 自定义图标

`SIcon` 内部的图标和 `STable` 工具栏图标都可以换掉：

```js
useSTable({
  api,
  columns,
  toolbarConfig: {
    refresh: true,
    custom: true,
    iconMap: {
      refresh: myRefreshIcon, // 传入 import 后的图片 URL
      reset: myResetIcon,
      iconColor: '#109594',
    },
  },
});
```

## 单元格样式

`STable` 的 `tbPadding` 用来统一调整单元格内边距：

```vue
<s-table :tb-padding="12" ... />
```

等价于设置 Naive UI 的 `--n-td-padding` / `--n-th-padding` CSS 变量。
