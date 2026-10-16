# 快速上手

## STable：一张带筛选的表

`STable` 的核心是 `useSTable`。它接收一份配置，返回 `[register, methods]`：

```vue
<template>
  <s-table @register="register" />
</template>

<script setup lang="ts">
  import { useSTable } from 'ds-ui';

  const [register, methods] = useSTable({
    // 唯一的必填项之一：请求函数
    api: async (params) => {
      // params 里已经带好了分页、排序、列筛选
      const res = await fetch('/api/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      }).then((r) => r.json());

      // 返回结构由下面的 tableDataFiled / itemCountFiled 等字段决定
      return {
        records: res.list,
        total: res.total,
        current: res.current,
        size: res.size,
        pages: res.pages,
      };
    },

    // 列定义
    columns: [
      { title: '名称', key: 'name', filterType: 'text', width: 160 },
      { title: '状态', key: 'status', filterType: 'singleChoice', width: 120 },
      { title: '更新时间', key: 'updatedAt', filterType: 'datePicker', sorter: true },
    ],
  });
</script>
```

把 `register` 绑到组件的 `@register` 上，表格就接管了。之后你可以随时调用 `methods`：

```js
methods.loadData(); // 重新拉取（会重置到第一页）
methods.loadData(undefined, true); // 重置筛选和排序后再拉取
methods.refreshCurrentPage(); // 保持当前页和筛选条件刷新
methods.getTbFilterData(); // 拿到当前完整的查询参数
methods.getTableTotal(); // 总条数
```

## 返回结构的字段名可配置

接口返回的字段名不叫 `records`/`total` 也没关系：

```js
useSTable({
  api,
  columns,
  tableDataFiled: 'list', // 数据数组字段，默认 records
  itemCountFiled: 'count', // 总数字段，默认 total
  pageCountFiled: 'pageNum', // 总页数字段，默认 pages
  pageField: 'pageIndex', // 请求里的页码参数名，默认 current
  pageSizeField: 'pageSize', // 请求里的每页条数参数名，默认 size
});
```

## SForm：schema 生成表单

```vue
<template>
  <s-form @register="register" @submitForm="handleSubmit" />
</template>

<script setup lang="ts">
  import { useForm } from 'ds-ui';

  const [register, methods] = useForm({
    schemas: [
      {
        field: 'name',
        label: '名称',
        component: 'NInput',
        rules: { required: true, message: '请输入名称', trigger: ['blur', 'input'] },
      },
      {
        field: 'status',
        label: '状态',
        component: 'NSelect',
        componentProps: {
          options: [
            { label: '启用', value: 1 },
            { label: '停用', value: 0 },
          ],
        },
      },
      {
        field: 'remark',
        label: '备注',
        component: 'NInput',
        componentProps: { type: 'textarea' },
        span: 24, // 占满整行
      },
    ],
    showAdvancedButton: true, // 字段较多时显示展开/收起
    showResetButton: true,
  });

  async function handleSubmit(values) {
    await api.save(values);
    methods.resetFields();
  }
</script>
```

## SModal / SDrawer / SMessage

这三个是命令式的，适合在任何地方触发：

```js
import { useModal, useDrawer, useMessage } from 'ds-ui';

const modal = useModal();
const drawer = useDrawer();
const message = useMessage();

modal.open({
  title: '确认删除',
  content: '删除后不可恢复，确定继续吗？',
  onPositiveClick: async () => {
    await api.remove();
    message.success('已删除');
  },
});
```

更多用法见各组件文档。
