---
layout: home

hero:
  name: ds-ui
  text: 面向中后台的 Vue 3 组件库
  tagline: 基于 Naive UI 构建。表格筛选、表单编排、弹窗抽屉，开箱即用。
  image:
    src: /logo.svg
    alt: ds-ui
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 组件总览
      link: /components/stable
    - theme: alt
      text: GitHub
      link: https://github.com/wwb-xigua/ds-ui

features:
  - title: 表格即开即用
    details: 列级筛选、排序、服务端分页、自定义列面板都内置好了。你只需要提供一个返回数据的函数，剩下的分页参数拼接和筛选条件组装由组件完成。
  - title: schema 驱动的表单
    details: 用一份字段描述生成响应式栅格表单，支持校验、展开收起、回车提交。所有内置的 Naive UI 组件都可以通过 component 直接引用。
  - title: 命令式 API
    details: 每个组件都通过 @register 暴露实例方法，表格、弹窗、抽屉都可以在脚本里驱动，不必和模板较劲。
  - title: 完整类型
    details: 全量 TypeScript 编写，props、方法、事件类型全部导出。消费方不需要 as any。
  - title: 主题随宿主走
    details: Naive UI 作为外部依赖而非打包进产物，因此 NConfigProvider 的主题、暗色模式和语言包都能正常穿透到 ds-ui 的组件里。
  - title: 可摇树
    details: '包声明了 sideEffects false，按需引入只打包你真正用到的组件，未使用的不会进入产物。'
---

<div class="ds-home-preview">

## 一张表，就这么多

```vue
<script setup>
  import { useSTable } from 'ds-ui';

  const [register] = useSTable({
    api: async (params) => {
      // params 已自动带上分页、排序、列筛选
      return {
        records: [{ id: 1, name: '示例数据' }],
        total: 1,
        current: 1,
        size: 10,
        pages: 1,
      };
    },
    columns: [
      { title: '名称', key: 'name', filterType: 'text' },
      { title: '状态', key: 'status', filterType: 'singleChoice' },
      { title: '创建时间', key: 'createdAt', filterType: 'datePicker' },
    ],
  });
</script>

<template>
  <s-table @register="register" />
</template>
```

</div>

<style scoped>
.ds-home-preview {
  max-width: 1152px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}
</style>
