# SMessage 消息

轻量的全局提示。适合操作反馈、加载态、错误提示。

## 基础用法

`useMessage` 不需要挂载任何组件，调用即用。

<script setup>
import { useMessage } from '@coldboy/ds-ui';

const message = useMessage();
</script>

```js
import { useMessage } from '@coldboy/ds-ui';

const message = useMessage();

message.success('保存成功');
message.error('操作失败');
message.warning('库存不足');
message.info('正在处理…');
```

<div class="ds-demo">
  <n-space>
    <n-button type="primary" @click="message.success('保存成功')">success</n-button>
    <n-button type="info" @click="message.info('这是一条提示')">info</n-button>
    <n-button type="warning" @click="message.warning('库存不足')">warning</n-button>
    <n-button type="error" @click="message.error('网络异常')">error</n-button>
    <n-button @click="message.loading('加载中…')">loading</n-button>
  </n-space>
</div>

## 配合异步操作

最常见的用法是包住一个异步请求：

```js
async function save() {
  const close = message.loading('保存中…', { duration: 0 }); // duration: 0 = 不自动关闭
  try {
    await api.save();
    close();
    message.success('保存成功');
  } catch (e) {
    close();
    message.error(e.message || '保存失败');
  }
}
```

`message.loading()` 的返回值是个函数，调用它可以提前关掉这条消息。

## 方法

| 方法         | 参数                  | 说明                 |
| ------------ | --------------------- | -------------------- |
| `success`    | `(content, options?)` | 成功提示             |
| `info`       | `(content, options?)` | 普通提示             |
| `warning`    | `(content, options?)` | 警告                 |
| `error`      | `(content, options?)` | 错误                 |
| `loading`    | `(content, options?)` | 加载中，返回关闭函数 |
| `create`     | `(content, options?)` | 自定义               |
| `destroyAll` | —                     | 关闭全部消息         |

## Options

底层是 Naive UI 的 `useMessage`，所以参数直接沿用：

| 参数               | 类型      | 说明                       |
| ------------------ | --------- | -------------------------- |
| `duration`         | `number`  | 毫秒，`0` 表示不自动关闭   |
| `keepAliveOnHover` | `boolean` | 悬停时不消失（默认已开启） |
| `closable`         | `boolean` | 显示关闭按钮               |
| `placement`        | `string`  | 位置，默认顶部             |

## 在组件里使用

在 `<script setup>` 里调用是可以的：

```vue
<script setup>
  import { useMessage } from '@coldboy/ds-ui';

  const message = useMessage();

  async function handleSave() {
    await api.save();
    message.success('已保存');
  }
</script>
```

如果想在模板里直接用，用 `<script>` 里的 `setup()` 或者把方法挂到实例上会更麻烦 —— 推荐就用 `<script setup>`。

::: warning不要在模块顶层（`<script setup>` 之外）调用 `useMessage()`。Naive UI 的消息组件需要在应用挂载之后才能安全创建。:::
