# STable 数据表格

数据表格。内置列级筛选、排序、服务端分页和列显示控制。

`STable` 的设计前提是**列表数据来自后端**：你提供一个返回 Promise 的函数，组件负责维护分页、排序、筛选状态，并把拼好的查询参数传给你。

## 基础用法

<script setup>
import { useSTable } from '@coldboy/ds-ui';

const names = ['张伟', '李娜', '王芳', '刘洋', '陈静', '杨帆', '赵磊', '周敏'];
const depts = ['研发中心', '产品部', '运营部', '市场部'];
const statuses = ['启用', '停用'];

function makeData(n) {
  return Array.from({ length: n }).map((_, i) => ({
    id: i + 1,
    name: names[i % names.length],
    dept: depts[i % depts.length],
    status: statuses[i % 2],
    score: ((i * 37) % 100) + 1,
    date: `2026-0${(i % 9) + 1}-1${i % 10}`,
  }));
}

// 模拟一个后端接口：接收组件拼好的参数，返回分页后的数据
const [register, methods] = useSTable({
  api: async (params) => {
    const all = makeData(53);
    const page = params.current || 1;
    const size = params.size || 10;
    const start = (page - 1) * size;

    let list = all;
    // 演示用：在“服务端”按筛选条件过滤
    for (const f of params.filters || []) {
      if (f.isNull) list = list.filter((r) => r[f.field] == null);
      else if (f.type === 'text') list = list.filter((r) => String(r[f.field]).includes(f.data));
      else if (f.type === 'singleChoice') list = list.filter((r) => r[f.field] === f.data);
      else list = list.filter((r) => (f.data || []).includes(r[f.field]));
    }
    if (params.sorts?.length) {
      const { field, order } = params.sorts[0];
      list = [...list].sort((a, b) =>
        order === 'desc' ? b[field] - a[field] : a[field] - b[field],
      );
    }

    return {
      records: list.slice(start, start + size),
      total: list.length,
      current: page,
      size,
      pages: Math.max(1, Math.ceil(list.length / size)),
    };
  },
  columns: [
    { title: '姓名', key: 'name', width: 120, filterType: 'text', sorter: true },
    {
      title: '部门',
      key: 'dept',
      width: 140,
      filterType: 'singleChoice',
      sorter: true,
      filterOptionValues: depts,
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      filterType: 'multipleChoice',
      filterOptionValues: statuses,
    },
    { title: '分数', key: 'score', width: 100, filterType: 'number', sorter: true },
    { title: '入职日期', key: 'date', width: 140, filterType: 'datePicker', sorter: true },
  ],
  toolbarConfig: { refresh: true, custom: true, reset: true },
  // 文档内嵌场景必须显式给高度。STable 的自适应高度假设表格是页面主体内容，
  // 在文档流里按视口算出来的值会把内容压没。
  fixedHeight: 320,
});
</script>

```vue
<script setup>
  import { useSTable } from '@coldboy/ds-ui';

  const [register, methods] = useSTable({
    api: async (params) => {
      // params 已自动带上 current / size / sorts / filters
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      }).then((r) => r.json());

      return {
        records: res.list,
        total: res.total,
        current: res.current,
        size: res.size,
        pages: res.pages,
      };
    },
    columns: [
      { title: '姓名', key: 'name', width: 120, filterType: 'text', sorter: true },
      { title: '状态', key: 'status', width: 100, filterType: 'singleChoice' },
    ],
  });
</script>

<template>
  <s-table @register="register" />
</template>
```

<div class="ds-demo">
  <s-table @register="register" />
</div>

试试表头的筛选图标和排序箭头 —— 请求参数是组件自己拼的。

## 列筛选

给列加 `filterType` 即可启用对应的筛选面板。

<div class="ds-demo">
  <div style="margin-bottom: 12px; display: flex; gap: 8px;">
    <n-button size="small" @click="methods.refreshCurrentPage()">刷新当前页</n-button>
    <n-button size="small" @click="methods.loadData(undefined, true)">重置并刷新</n-button>
    <n-button size="small" @click="methods.loadData()">回到第一页</n-button>
    <n-tag size="small" type="info">总条数：{{ methods.getTableTotal() }}</n-tag>
  </div>
  <s-table :columns="[
      { title: '姓名', key: 'name', width: 120, filterType: 'text' },
      { title: '状态', key: 'status', width: 120, filterType: 'multipleChoice', filterOptionValues: ['启用','停用'] },
      { title: '分数', key: 'score', width: 120, filterType: 'number' },
    ]" :data="makeData(20)" :max-height="280" />
</div>

### filterType 取值

| 值                   | 面板     | 说明                          |
| -------------------- | -------- | ----------------------------- |
| `text`               | 文本输入 | 模糊匹配                      |
| `number`             | 数值输入 | 精确匹配                      |
| `singleChoice`       | 单选下拉 | 选项来自 `filterOptionValues` |
| `multipleChoice`     | 多选下拉 | 选项来自 `filterOptionValues` |
| `treeMultipleChoice` | 树形多选 | 用于层级数据                  |
| `datePicker`         | 日期范围 | 传数组 `[start, end]`         |

### 筛选查询参数长什么样

每次筛选变更，组件会往 `api` 传入：

```js
{
  current: 1,
  size: 10,
  sorts: [{ field: 'score', order: 'asc' }],
  filters: [
    { field: 'name', type: 'text', data: '张', isNull: false },
    { field: 'dept', type: 'singleChoice', data: '研发中心', isNull: false },
  ],
}
```

筛"空值"时 `isNull` 为 `true`，此时 `data` 的值是字符串 `'null'`，判断时用 `isNull` 为准。

## 自定义渲染

列的 `render` 优先级高于全局的 `renderCell`：

```js
{
  title: '状态',
  key: 'status',
  render: ({ status }) =>
    h(NTag, { type: status === '启用' ? 'success' : 'default', size: 'small' }, () => status),
}
```

表头需要自定义时用 `titleRender`，它只影响表头，不会污染 `title`：

```js
{
  title: '姓名',
  key: 'name',
  titleRender: (column) => h('span', { class: 'th-icon' }, [column.title, h(NInfoFilled)]),
}
```

也接受直接给字符串作为表头文本：

```js
{ title: '姓名', key: 'name', titleRender: '姓名 👤' }
```

传 `false` 则完全禁用自定义表头渲染。

## 表单联动

表格和表单常见的组合是把表单值一起带进查询：

```js
api: async (params) => {
  // params.form 里就是 setProps({ form: {...} }) 传入的对象
  const res = await fetch('/api/list', {
    method: 'POST',
    body: JSON.stringify(params),
  }).then((r) => r.json());
  return { records: res.list, total: res.total, pages: res.pages };
},
```

## Props

### 数据加载

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `api` | `(params) => Promise<any>` | — | 数据源，返回结构由下面几个字段名决定 |
| `autoLoad` | `boolean` | `true` | 挂载后自动请求一次 |
| `remote` | `boolean` | `true` | 远程分页（本地数据请传 `false`） |
| `tableDataFiled` | `string` | `'records'` | 返回体中数据数组的字段名 |
| `itemCountFiled` | `string` | `'total'` | 总条数字段名 |
| `pageCountFiled` | `string` | `'pages'` | 总页数字段名 |
| `pageField` | `string` | `'current'` | 请求参数里的页码字段名 |
| `pageSizeField` | `string` | `'size'` | 请求参数里的每页条数字段名 |

### 展示

| 属性             | 类型                    | 默认值   | 说明                   |
| ---------------- | ----------------------- | -------- | ---------------------- |
| `columns`        | `STableColumn[] \| Ref` | —        | 列定义，见下文         |
| `data`           | `any[] \| Ref`          | —        | 本地数据源             |
| `showPagination` | `boolean`               | `true`   | 是否显示分页           |
| `striped`        | `boolean`               | `true`   | 斑马纹                 |
| `bordered`       | `boolean`               | `false`  | 边框                   |
| `bottomBordered` | `boolean`               | `false`  | 底部边框               |
| `singleColumn`   | `boolean`               | `false`  | 不显示行分割线         |
| `tbPadding`      | `number`                | —        | 单元格内边距（px）     |
| `renderCell`     | `(value, row) => VNode` | 显示 `-` | 全局单元格渲染         |
| `notNull`        | `boolean`               | `false`  | 筛选面板隐藏"空值"选项 |

### 高度

| 属性                            | 类型     | 默认值 | 说明                   |
| ------------------------------- | -------- | ------ | ---------------------- |
| `maxHeight`                     | `number` | —      | 最大高度，超出滚动     |
| `fixedHeight`                   | `number` | —      | 固定高度               |
| `dynamicMinLines`               | `number` | `3`    | 自适应高度时的最小行数 |
| `dynamicCustomHeightDifference` | `number` | `0`    | 底部预留距离微调       |

都不传时按视口自动计算。嵌在可滚动容器里用 `layoutShiftRefs` 传入容器 ref。

### 工具栏

| 属性                    | 类型      | 默认值  | 说明                               |
| ----------------------- | --------- | ------- | ---------------------------------- |
| `toolbarConfig.refresh` | `boolean` | `false` | 显示刷新按钮（不重置筛选）         |
| `toolbarConfig.reset`   | `boolean` | `false` | 显示重置按钮（重置列、筛选、排序） |
| `toolbarConfig.custom`  | `boolean` | `false` | 显示列显示控制面板                 |
| `toolbarConfig.iconMap` | `object`  | —       | 替换工具栏图标                     |

### STableColumn

| 属性                 | 类型                          | 说明                                    |
| -------------------- | ----------------------------- | --------------------------------------- |
| `title`              | `string \| VNodeChild`        | 表头文本                                |
| `key`                | `string \| number`            | 列标识，也是查询参数的 `field`          |
| `width`              | `number`                      | 列宽，参与 `autoScrollX` 计算           |
| `fixed`              | `'left' \| 'right'`           | 固定列                                  |
| `filterType`         | `string`                      | 见上文                                  |
| `filterOptionValues` | `any[]`                       | 下拉类筛选的选项                        |
| `sorter`             | `boolean \| function`         | 是否可排序                              |
| `render`             | `function`                    | 单元格渲染                              |
| `titleRender`        | `string \| function \| false` | 表头渲染                                |
| `hidden`             | `boolean`                     | 初始隐藏（配合 `toolbarConfig.custom`） |
| `show`               | `boolean`                     | 运行时由列面板控制                      |
| `children`           | `STableColumn[]`              | 子列，支持嵌套                          |

## Events

| 事件       | 参数              | 说明                         |
| ---------- | ----------------- | ---------------------------- |
| `register` | `TableActionType` | 组件挂载时触发，交出实例方法 |

## Slots

| 插槽            | 说明             |
| --------------- | ---------------- |
| `operate`       | 工具栏左侧操作区 |
| `prefixToolbar` | 工具栏前插槽     |
| `suffixToolbar` | 工具栏后插槽     |

```vue
<s-table @register="register">
  <template #operate>
    <n-button type="primary" size="small">新建</n-button>
  </template>
</s-table>
```

## 实例方法

`register` 回调的第二个参数，或组件的 `ref`：

| 方法 | 参数 | 返回 | 说明 |
| --- | --- | --- | --- |
| `setProps` | `Partial<TableProps>` | `Promise<void>` | 运行时合并属性 |
| `loadData` | `(params?, reset?)` | `Promise<void>` | 拉取数据。`reset=true` 会先清空筛选和排序 |
| `refreshCurrentPage` | — | `Promise<void>` | 保持当前页和筛选条件刷新 |
| `getTbFilterData` | — | `object` | 当前完整查询参数（含 `form` 和 `filters`） |
| `getTbFilterDataWithoutFormAndFilters` | — | `object` | 查询参数，去掉 `form` 和 `filters` |
| `getTableTotal` | — | `number` | 总条数 |

## useTable 的区别

早期还有一个 `useTable` 钩子，功能与 `useSTable` 重叠。它已被 `STable` 取代，新代码请用 `useSTable`。`useTable` 会在下一个 minor 版本移除。
