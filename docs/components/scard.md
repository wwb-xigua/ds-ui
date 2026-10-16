# SCard 卡片

带标题栏、可折叠的内容容器。内容区高度会随窗口自动适配。

## 基础用法

<script setup>
import { ref } from 'vue';

const loading = ref(false);
</script>

```vue
<script setup>
  import { ref } from 'vue';

  const loading = ref(false);
</script>

<template>
  <s-card title="用户信息" :loading="loading" border>
    <div style="min-height: 120px">卡片内容区域</div>
  </s-card>
</template>
```

<div class="ds-demo">
  <s-card title="用户信息" :loading="loading" border divide>
    <div style="min-height: 120px; padding: 4px 0">
      这是一张卡片。内容区会根据窗口高度自动适配，超出时内部滚动。
    </div>
    <template #prefixTitle>📋</template>
  </s-card>

  <n-space style="margin-top: 12px">
    <n-button size="small" @click="loading = !loading">切换 loading</n-button>
  </n-space>
</div>

## 可折叠

<div class="ds-demo">
  <s-card title="可折叠卡片" fold :default-fold="true" border>
    <div>折叠状态下这段内容不可见。点标题栏的箭头展开。</div>
  </s-card>
</div>

## Props

| 属性             | 类型                             | 默认值    | 说明             |
| ---------------- | -------------------------------- | --------- | ---------------- |
| `title`          | `string`                         | —         | 标题             |
| `fold`           | `boolean`                        | `false`   | 是否可折叠       |
| `defaultFold`    | `boolean`                        | `false`   | 初始是否折叠     |
| `border`         | `boolean`                        | `false`   | 显示边框         |
| `divide`         | `boolean`                        | `false`   | 标题栏下方分割线 |
| `loading`        | `boolean`                        | `false`   | 显示 loading     |
| `shadow`         | `'always' \| 'hover' \| 'never'` | `'hover'` | 阴影             |
| `contentPadding` | `string`                         | —         | 内容区内边距     |

## Slots

| 插槽          | 说明           |
| ------------- | -------------- |
| `prefixTitle` | 标题前         |
| `suffixTitle` | 标题后         |
| `default`     | 内容           |
| `header`      | 自定义整个头部 |
| `footer`      | 底部区域       |

## 用 ref 控制折叠

```vue
<s-card ref="cardRef" title="标题" fold />
```

```js
cardRef.value.foldToggle();
cardRef.value.handleReset();
```
