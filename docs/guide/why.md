# 介绍

`ds-ui` 是一套面向**中后台数据密集型界面**的 Vue 3 组件库，基于 [Naive UI](https://www.naiveui.com) 构建。

它不试图做通用组件库（按钮、输入框这些 Naive UI 已经有了），而是补上中后台项目里真正重复、真正难写的那部分：**筛选表格、表单编排、弹窗与抽屉的命令式调用**。

## 它解决什么问题

做过中后台的人大概都熟悉这个循环：

1. 需求来了，要一个可筛选、可排序、可分页的列表
2. 筛选条件的拼接逻辑写了 300 行
3. 翻页的时候筛选状态丢了，或者重置了又不对
4. 下一个页面来了，再写一遍

`ds-ui` 把这 300 行收进组件里。你描述列，它负责筛选面板、状态维护和请求参数的组装。

## 核心设计

### 命令式而非声明式

大部分 UI 库让你在模板里绑一堆 prop。`ds-ui` 更偏向脚本驱动：

```vue
<template>
  <s-table @register="register" />
</template>

<script setup>
  const [register, methods] = useSTable({ api, columns });
  // 之后随时：methods.loadData() / methods.refreshCurrentPage() / methods.getTbFilterData()
</script>
```

组件在 `setup` 阶段把自己的方法交给你，你保存引用就行。这样刷新、翻页、重置筛选这些动作可以在任意位置触发，不必层层透传事件。

### schema 驱动的表单

表单用一份字段描述生成，布局、校验、栅格全部自动推导：

```js
const [register] = useForm({
  schemas: [
    { field: 'name', label: '名称', component: 'NInput', rules: { required: true } },
    { field: 'status', label: '状态', component: 'NSelect', componentProps: { options } },
  ],
});
```

### 底座可替换

Naive UI 是**外部依赖**而不是打包进产物。这意味着：

- 你的 `NConfigProvider` 主题、暗色模式、语言包能正常作用到 `ds-ui` 的组件上
- 你可以自由控制 Naive UI 的版本，不用被组件库锁死
- 产物里不会出现第二份 Naive UI

## 适用场景

- 管理后台、运营平台、数据看板
- 需要大量列表筛选和表单的项目

## 不适用场景

- 官网、营销页这类以视觉设计为主的场景
- 移动端优先的项目（栅格和密度是按桌面端中后台调的）
- 已经深度绑定 Ant Design / Element Plus 的存量项目

## 当前状态

处于 `0.1.x`，API 仍可能调整。欢迎提 issue 讨论 —— 尤其是如果你在实际项目里用它踩到了什么坑，那正是这个项目最需要的信息。
