# SForm 表单

schema 驱动的表单。用一份字段描述生成响应式栅格表单，自带校验、展开收起和提交重置。

## 基础用法

<script setup>
import { useForm } from 'ds-ui';

const statusOptions = [
  { label: '启用', value: 1 },
  { label: '停用', value: 0 },
];
const deptOptions = [
  { label: '研发中心', value: 'rd' },
  { label: '产品部', value: 'pm' },
  { label: '运营部', value: 'ops' },
];

const [register, formMethods] = useForm({
  schemas: [
    {
      field: 'name',
      label: '姓名',
      component: 'NInput',
      rules: { required: true, message: '请输入姓名', trigger: ['blur', 'input'] },
    },
    {
      field: 'dept',
      label: '部门',
      component: 'NSelect',
      componentProps: { options: deptOptions },
    },
    {
      field: 'status',
      label: '状态',
      component: 'NRadioGroup',
      componentProps: { options: statusOptions },
    },
    {
      field: 'age',
      label: '年龄',
      component: 'NInputNumber',
      componentProps: { min: 0, max: 150 },
    },
    {
      field: 'email',
      label: '邮箱',
      component: 'NInput',
      rules: { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'input'] },
    },
    {
      field: 'remark',
      label: '备注',
      component: 'NInput',
      componentProps: { type: 'textarea', placeholder: '选填' },
      giProps: { span: 24 },
      show: false,
    },
  ],
  showAdvancedButton: true,
  showResetButton: true,
  submitButtonText: '提交',
  resetButtonText: '重置',
});

const submitted = (values) => {
  window.alert('提交的数据：\n' + JSON.stringify(values, null, 2));
};
</script>

```vue
<script setup>
  import { useForm } from 'ds-ui';

  const [register, methods] = useForm({
    schemas: [
      {
        field: 'name',
        label: '姓名',
        component: 'NInput',
        rules: { required: true, message: '请输入姓名' },
      },
      { field: 'dept', label: '部门', component: 'NSelect', componentProps: { options } },
    ],
  });
</script>

<template>
  <s-form @register="register" @submitForm="handleSubmit" />
</template>
```

<div class="ds-demo">
  <s-form @register="register" @submitForm="submitted" />
</div>

试着留空姓名直接提交 —— 校验规则会拦住。

## 用 schema 控制显示

`hidden` 接受布尔值或函数，函数在每次渲染时求值：

```js
{
  field: 'reason',
  label: '驳回原因',
  component: 'NInput',
  hidden: ({ values }) => values.status !== 2, // 只有状态为「驳回」时显示
}
```

## Props

### 布局

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `schemas` | `FormSchema[]` | `[]` | 字段描述 |
| `layout` | `'horizontal' \| 'vertical' \| 'inline'` | `'horizontal'` | 表单布局 |
| `inline` | `boolean` | `false` | 行内布局（旧版等价写法） |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 控件尺寸 |
| `labelWidth` | `number \| string` | — | 标签宽度 |
| `labelPlacement` | `'left' \| 'top'` | `'left'` | 标签位置 |
| `showColon` | `boolean` | `true` | 标签后是否显示冒号 |
| `isFull` | `boolean` | `true` | 控件占满栅格 |
| `gridProps` | `GridProps` | — | 栅格配置，默认 1~6 列自适应 |
| `giProps` | `GridItemProps` | — | 栅格项默认配置 |

### 按钮

| 属性                    | 类型                   | 默认值   | 说明                        |
| ----------------------- | ---------------------- | -------- | --------------------------- |
| `showSubmitButton`      | `boolean`              | `true`   | 显示提交按钮                |
| `showResetButton`       | `boolean`              | `true`   | 显示重置按钮                |
| `showActionButtonGroup` | `boolean`              | `true`   | 显示按钮组                  |
| `showAdvancedButton`    | `boolean`              | `false`  | 字段超出一行时显示展开/收起 |
| `submitButtonText`      | `string`               | `'提交'` | 提交按钮文案                |
| `resetButtonText`       | `string`               | `'重置'` | 重置按钮文案                |
| `submitButtonOptions`   | `Partial<ButtonProps>` | —        | 提交按钮样式                |
| `resetButtonOptions`    | `Partial<ButtonProps>` | —        | 重置按钮样式                |
| `isEnterSubmit`         | `boolean`              | `false`  | 回车提交                    |
| `submitOnReset`         | `boolean`              | `false`  | 点击重置时也提交            |

### 其他

| 属性                   | 类型      | 默认值  | 说明         |
| ---------------------- | --------- | ------- | ------------ |
| `collapsed`            | `boolean` | —       | 初始是否折叠 |
| `collapsedRows`        | `number`  | —       | 折叠时的行数 |
| `requireMarkPlacement` | `string`  | —       | 必填星号位置 |
| `draggable`            | `boolean` | `false` | 拖拽排序     |

## FormSchema

| 属性             | 类型                  | 说明                          |
| ---------------- | --------------------- | ----------------------------- |
| `field`          | `string`              | 字段名，支持 `a.b.c` 嵌套路径 |
| `label`          | `string`              | 标签                          |
| `component`      | `string \| Component` | 组件名或组件本身              |
| `componentProps` | `object`              | 传给组件的属性                |
| `rules`          | `object \| object[]`  | 校验规则                      |
| `defaultValue`   | `any`                 | 默认值                        |
| `slot`           | `string`              | 使用具名插槽渲染              |
| `suffix`         | `string`              | 字段后置插槽名                |
| `hidden`         | `boolean \| function` | 是否隐藏                      |
| `labelMessage`   | `string`              | 标签旁的提示文案              |
| `isFull`         | `boolean`             | 占满整行                      |
| `giProps`        | `GridItemProps`       | 该字段的栅格配置              |

## Events

| 事件             | 参数                 | 说明                   |
| ---------------- | -------------------- | ---------------------- |
| `register`       | `FormActionType`     | 挂载时触发             |
| `submitForm`     | `values`             | 校验通过后提交         |
| `reset`          | `values`             | 点击重置               |
| `formDataUpdate` | `values`             | 表单值变化（深度监听） |
| `advanced`       | `collapsed: boolean` | 展开/收起切换          |

## Slots

| 插槽                            | 说明             |
| ------------------------------- | ---------------- |
| 字段同名插槽                    | 替换该字段的渲染 |
| `suffix` 字段同名插槽           | 字段后置内容     |
| `prefixFooter` / `suffixFooter` | 按钮组前后       |

## 实例方法

| 方法             | 参数                 | 返回            | 说明                 |
| ---------------- | -------------------- | --------------- | -------------------- |
| `setProps`       | `Partial<FormProps>` | `Promise<void>` | 合并属性             |
| `setSchema`      | `FormSchema[]`       | `Promise<void>` | 替换字段描述         |
| `setFieldsValue` | `Recordable`         | `void`          | 设置值，支持嵌套路径 |
| `getFieldsValue` | —                    | `Recordable`    | 读取全部值           |
| `resetFields`    | —                    | `Promise<void>` | 重置为默认值         |
| `validate`       | `keyList?`           | `Promise<any>`  | 手动触发校验         |
| `clearValidate`  | `name?`              | `Promise<void>` | 清除校验状态         |
| `setLoadingSub`  | `boolean`            | `void`          | 切换提交按钮 loading |
| `submitForm`     | —                    | `Promise<any>`  | 手动提交             |

## 常用 schema 片段

schema 容易变长，建议把常用配置抽出来复用：

```js
const searchSchemas = (deptOptions, statusOptions) => [
  { field: 'name', label: '姓名', component: 'NInput' },
  { field: 'dept', label: '部门', component: 'NSelect', componentProps: { options: deptOptions } },
  {
    field: 'status',
    label: '状态',
    component: 'NSelect',
    componentProps: { options: statusOptions },
  },
  { field: 'date', label: '日期', component: 'NDatePicker', componentProps: { type: 'daterange' } },
];
```
