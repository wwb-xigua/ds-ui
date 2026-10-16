# SModal 弹窗

命令式弹窗。支持确认/取消双按钮、loading 态、拖拽移动。

## 基础用法

`SModal` 需要一个实例挂载在模板里（通常放在页面根部），通过 `useModal` 在任意位置触发。

<script setup>
import { useModal } from 'ds-ui';

const [register, modal] = useModal();

function showConfirm() {
  modal.setProps({
    title: '确认删除',
    content: '删除后不可恢复，确定继续吗？',
  });
  modal.openModal();
}

function showAsync() {
  modal.setProps({
    title: '提交中',
    content: '正在保存，请稍候…',
    showAction: false,
    maskClosable: false,
  });
  modal.openModal();

  setTimeout(() => {
    modal.setProps({ showAction: true });
    modal.closeModal();
  }, 1500);
}
</script>

```vue
<template>
  <s-modal
    ref="modalRef"
    @register="register"
    @on-positive-click="handleConfirm"
    @on-close="handleClose"
  />
</template>

<script setup>
  import { useModal } from 'ds-ui';

  const [register, modal] = useModal();

  function handleDelete(row) {
    modal.setProps({
      title: '确认删除',
      content: `确定删除「${row.name}」吗？`,
    });
    modal.openModal();
  }

  function handleConfirm() {
    // 拿到内容后调用接口，成功则关闭
    modal.closeModal();
  }
</script>
```

<div class="ds-demo">
  <n-space>
    <n-button type="primary" @click="showConfirm">确认弹窗</n-button>
    <n-button @click="showAsync">无按钮弹窗</n-button>
  </n-space>
</div>

<s-modal @register="register" @on-positive-click="modal.closeModal()" />

::: tip弹窗实例本身要写在模板里。`useModal` 返回的第二个参数在 `register` 执行前是空的，所以在 `onMounted` 之后调用才是安全的。:::

## 用 ref 直接调用

不想用 `useModal` 也可以直接拿组件 ref：

```vue
<s-modal ref="modalRef" />
```

```js
modalRef.value.openModal();
modalRef.value.setProps({ title: '标题' });
```

## Props

在 Naive UI `NModal` 全部属性的基础上增加了这些：

| 属性            | 类型                                | 默认值      | 说明               |
| --------------- | ----------------------------------- | ----------- | ------------------ |
| `title`         | `string`                            | `''`        | 标题               |
| `titleSuffix`   | `string`                            | `''`        | 标题后缀           |
| `content`       | `string`                            | —           | 内容               |
| `width`         | `number`                            | `450`       | 宽度               |
| `subBtnText`    | `string`                            | `'确定'`    | 确定按钮文案       |
| `cancelBtnText` | `string`                            | `'取消'`    | 取消按钮文案       |
| `showAction`    | `boolean`                           | `true`      | 是否显示底部按钮组 |
| `maskClosable`  | `boolean`                           | `false`     | 点遮罩是否关闭     |
| `iconType`      | `'primary' \| 'warning' \| 'error'` | `'primary'` | 图标类型           |
| `isDraggable`   | `boolean`                           | `true`      | 是否可拖拽移动     |

::: warning `isDraggable` 依赖微前端运行时提供的 `window.microApp.getData().startDrag`。在普通 SPA 里该 API 不存在，弹窗仍会正常打开，只是无法拖动 —— 不会有报错。:::

## Events

| 事件                | 参数           | 说明                       |
| ------------------- | -------------- | -------------------------- |
| `register`          | `ModalMethods` | 挂载时触发                 |
| `on-positive-click` | —              | 点击确定                   |
| `on-negative-click` | —              | 点击取消                   |
| `on-close`          | —              | 关闭（取消、遮罩、右上角） |
| `on-after-leave`    | —              | 关闭动画结束               |
| `on-mask-click`     | —              | 点击遮罩                   |

## Slots

| 插槽      | 说明       |
| --------- | ---------- |
| `header`  | 自定义头部 |
| `footer`  | 自定义底部 |
| `default` | 自定义内容 |
| `icon`    | 自定义图标 |

## 实例方法

| 方法            | 参数                  | 说明                 |
| --------------- | --------------------- | -------------------- |
| `setProps`      | `Partial<ModalProps>` | 运行时合并属性       |
| `openModal`     | —                     | 打开                 |
| `closeModal`    | —                     | 关闭                 |
| `setSubLoading` | `boolean`             | 切换确定按钮 loading |

## 配合 loading

异步操作期间锁定弹窗，避免重复提交：

```js
async function handleConfirm() {
  modal.setSubLoading(true);
  try {
    await api.save();
    message.success('保存成功');
    modal.closeModal();
  } catch (e) {
    message.error(e.message);
  } finally {
    modal.setSubLoading(false);
  }
}
```
