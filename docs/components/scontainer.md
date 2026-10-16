# SContainer 容器

响应式页面容器。统一页边距和最大宽度，让不同页面的内容区对齐。

## 基础用法

<script setup>
const width = 1200;
</script>

```vue
<template>
  <s-container :width="1200"> 页面内容 </s-container>
</template>
```

<div class="ds-demo" style="background: repeating-linear-gradient(45deg, #f7f9fa 0 10px, #eef2f4 10px 20px);">
  <s-container>
    窄屏时容器自动收窄并保留边距，宽屏时限制最大宽度居中。
  </s-container>
</div>

## Props

| 属性         | 类型               | 默认值  | 说明                         |
| ------------ | ------------------ | ------- | ---------------------------- |
| `width`      | `number \| string` | `1200`  | 最大宽度，传 `'auto'` 不限制 |
| `padding`    | `number \| string` | `16`    | 左右边距                     |
| `fullHeight` | `boolean`          | `false` | 撑满视口高度                 |

## Slots

| 插槽      | 说明     |
| --------- | -------- |
| `default` | 内容     |
| `header`  | 顶部区域 |
| `footer`  | 底部区域 |

## 典型用法

配合 `SCard` 和 `STable` 使用：

```vue
<template>
  <s-container>
    <n-card title="查询条件">
      <s-form :schemas="searchSchemas" @submitForm="handleSearch" />
    </n-card>

    <n-card title="数据列表" style="margin-top: 16px">
      <s-table ref="tableRef" />
    </n-card>
  </s-container>
</template>
```
