# SDrawer 抽屉

从边缘滑出的面板。API 和 `SModal` 几乎一致，适合放详情表单或长内容。

## 基础用法

<script setup>
import { useDrawer } from '@coldboy/ds-ui';

const [register, drawer] = useDrawer();

function openRight() {
  drawer.setProps({
    title: '用户详情',
    placement: 'right',
    width: 480,
    content: '这里是抽屉的内容区域，可以放详情表单或长文本。',
  });
  drawer.openDrawer();
}

function openTop() {
  drawer.setProps({
    title: '顶部通知',
    placement: 'top',
    height: 200,
    content: '顶部抽屉适合放通知、提示条。',
  });
  drawer.openDrawer();
}
</script>

```vue
<template>
  <s-drawer @register="register" @on-positive-click="drawer.closeDrawer()" />
</template>

<script setup>
  import { useDrawer } from '@coldboy/ds-ui';

  const [register, drawer] = useDrawer();

  function showDetail(row) {
    drawer.setProps({
      title: row.name,
      placement: 'right',
      width: 480,
    });
    drawer.openDrawer();
  }
</script>
```

<div class="ds-demo">
  <n-space>
    <n-button type="primary" @click="openRight">右侧抽屉</n-button>
    <n-button @click="openTop">顶部抽屉</n-button>
  </n-space>
</div>

<s-drawer @register="register" @on-positive-click="drawer.closeDrawer()" />

## 抽屉里放表单

这是抽屉最常见的用法 —— 点列表某行，右侧滑出编辑表单：

```vue
<template>
  <s-drawer @register="register">
    <s-form :schemas="schemas" />
  </s-drawer>
</template>
```

```js
const [register, drawer] = useDrawer();

function edit(row) {
  drawer.setProps({ title: '编辑' });
  drawer.openDrawer();
  formMethods.setFieldsValue(row); // 抽屉打开后填值
}
```

注意顺序：先 `openDrawer()` 再 `setFieldsValue()`，否则会拿到还没渲染出来的表单实例。

## Props

| 属性            | 类型                                     | 默认值    | 说明               |
| --------------- | ---------------------------------------- | --------- | ------------------ |
| `title`         | `string`                                 | `''`      | 标题               |
| `titleSuffix`   | `string`                                 | `''`      | 标题后缀           |
| `placement`     | `'top' \| 'right' \| 'bottom' \| 'left'` | `'right'` | 弹出方向           |
| `width`         | `number`                                 | —         | 宽度（左右方向）   |
| `height`        | `number`                                 | —         | 高度（上下方向）   |
| `subBtnText`    | `string`                                 | `'确定'`  | 确定按钮文案       |
| `cancelBtnText` | `string`                                 | `'取消'`  | 取消按钮文案       |
| `showAction`    | `boolean`                                | `true`    | 是否显示底部按钮组 |
| `maskClosable`  | `boolean`                                | `false`   | 点遮罩是否关闭     |

其余 Naive UI `NDrawer` 的属性（`trap-focus`、`block-scroll` 等）同样可用。

## Events

| 事件                | 参数            | 说明         |
| ------------------- | --------------- | ------------ |
| `register`          | `DrawerMethods` | 挂载时触发   |
| `on-positive-click` | —               | 点击确定     |
| `on-negative-click` | —               | 点击取消     |
| `on-close`          | —               | 关闭         |
| `on-after-leave`    | —               | 关闭动画结束 |
| `on-mask-click`     | —               | 点击遮罩     |

## Slots

| 插槽      | 说明       |
| --------- | ---------- |
| `header`  | 自定义头部 |
| `footer`  | 自定义底部 |
| `default` | 内容       |

## 实例方法

| 方法            | 参数                   | 说明                 |
| --------------- | ---------------------- | -------------------- |
| `setProps`      | `Partial<DrawerProps>` | 运行时合并属性       |
| `openDrawer`    | —                      | 打开                 |
| `closeDrawer`   | —                      | 关闭                 |
| `setSubLoading` | `boolean`              | 切换确定按钮 loading |
