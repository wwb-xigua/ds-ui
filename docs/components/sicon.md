# SIcon 图标

内置图标集。用于 `STable` 工具栏和需要统一风格的场景。

## 基础用法

<script setup>
const names = ['column-configuration', 'down', 'up', 'info', 'refresh', 'reset', 'left-fix', 'left-fix-active', 'right-fix', 'right-fix-active', 'move-no-color'];
</script>

```vue
<template>
  <s-icon icon="refresh" :size="20" />
</template>
```

<div class="ds-demo">
  <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
    <div v-for="name in names" :key="name" style="text-align: center;">
      <s-icon :icon="name" :size="22" />
      <div style="font-size: 11px; color: #999; margin-top: 4px">{{ name }}</div>
    </div>
  </div>
</div>

## Props

| 属性    | 类型     | 默认值 | 说明                 |
| ------- | -------- | ------ | -------------------- |
| `icon`  | `string` | —      | 图标名，不区分大小写 |
| `size`  | `number` | —      | 尺寸（px）           |
| `color` | `string` | —      | 颜色                 |

## 内置图标

| 名称                             | 用途            |
| -------------------------------- | --------------- |
| `column-configuration`           | 列设置          |
| `refresh`                        | 刷新            |
| `reset`                          | 重置            |
| `down` / `up`                    | 展开 / 收起箭头 |
| `info`                           | 信息提示        |
| `left-fix` / `left-fix-active`   | 左固定列        |
| `right-fix` / `right-fix-active` | 右固定列        |
| `move-no-color`                  | 拖拽            |

传了不存在的名字会在控制台输出警告，不会报错。

## 在 STable 里换图标

```js
useSTable({
  api,
  columns,
  toolbarConfig: {
    refresh: true,
    custom: true,
    iconMap: {
      refresh: myRefreshIcon,
      iconColor: '#109594',
    },
  },
});
```

`iconMap` 里的值是 `import` 之后的图片 URL：

```js
import myRefreshIcon from './assets/my-refresh.svg?url';
```

## 用外部图标库

不想用内置图标时，直接用 Naive UI 的 `NIcon`：

```vue
<n-icon size="20" color="#109594">
  <Refresh />
</n-icon>
```

```js
import { Refresh } from '@vicons/ionicons5';
```
