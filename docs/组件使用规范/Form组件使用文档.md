# Form 组件使用文档

> 组件位置：`src/components/Form`
> 参考文档：https://element-plus-admin-doc.cn/components/form.html

`Form` 是基于 `Element Plus ElForm` 封装的配置化表单组件，通过 `schema` 数组生成表单项。业务表单优先使用 `schema + useForm`。

## 基础用法

```vue
<script setup lang="ts">
import { reactive } from 'vue'
import { Form, type FormSchema } from '@/components/Form'

const schema = reactive<FormSchema[]>([
  {
    field: 'username',
    label: '用户名',
    component: 'Input'
  },
  {
    field: 'status',
    label: '状态',
    component: 'Select',
    componentProps: {
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 }
      ]
    }
  }
])
</script>

<template>
  <Form :schema="schema" label-width="100px" />
</template>
```

## 推荐用法：useForm

需要获取表单值、动态改配置或调用校验时，使用 `useForm`。

```vue
<script setup lang="ts">
import { reactive } from 'vue'
import { Form, type FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'

const { formRegister, formMethods } = useForm()

const schema = reactive<FormSchema[]>([
  {
    field: 'name',
    label: '姓名',
    component: 'Input',
    formItemProps: {
      rules: [{ required: true, message: '请输入姓名', trigger: 'blur' }]
    }
  }
])

const submit = async () => {
  const elForm = await formMethods.getElFormExpose()
  await elForm?.validate()

  const data = await formMethods.getFormData()
  console.log(data)
}
</script>

<template>
  <Form :schema="schema" @register="formRegister" />
  <BaseButton type="primary" @click="submit">提交</BaseButton>
</template>
```

## Form 常用属性

除下表外，支持透传 `ElForm` 属性，如 `rules`、`inline`、`disabled`、`size`、`label-position` 等。

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `schema` | 表单结构配置 | `[]` |
| `isCol` | 是否启用栅格布局 | `true` |
| `model` | 外部表单数据 | `{}` |
| `autoSetPlaceholder` | 自动设置 placeholder | `true` |
| `isCustom` | 是否完全自定义内容 | `false` |
| `labelWidth` | label 宽度 | `'auto'` |

## Schema 常用配置

| 属性 | 说明 |
| --- | --- |
| `field` | 字段名，支持 `user.name` 这种嵌套路径 |
| `label` | 表单项标题 |
| `component` | 渲染组件名称 |
| `value` | 初始值 |
| `componentProps` | 子组件属性、事件、插槽 |
| `formItemProps` | `ElFormItem` 属性、校验规则、插槽 |
| `colProps` | `ElCol` 栅格配置 |
| `hidden` | 隐藏 UI，值仍保留 |
| `remove` | 移除表单项，同时删除值 |
| `optionApi` | 异步加载选项 |

## 支持的 component

常用组件：

```ts
Input
InputPassword
InputNumber
Select
SelectV2
TreeSelect
Cascader
RadioGroup
RadioButton
CheckboxGroup
CheckboxButton
Switch
DatePicker
TimePicker
TimeSelect
Upload
Editor
Divider
```

完整映射见：`src/components/Form/src/helper/componentMap.ts`。

## componentProps 写法

`componentProps` 会透传给具体组件，并默认附加 `clearable: true`。

```ts
{
  field: 'role',
  label: '角色',
  component: 'Select',
  componentProps: {
    clearable: false,
    options: [
      { label: '管理员', value: 'admin' },
      { label: '普通用户', value: 'user' }
    ],
    on: {
      change: (value) => {
        console.log(value)
      }
    }
  }
}
```

选项字段不是 `label/value` 时，用 `props` 配置别名：

```ts
componentProps: {
  props: {
    label: 'name',
    value: 'id',
    key: 'id'
  },
  options: [
    { id: 1, name: '管理员' },
    { id: 2, name: '操作员' }
  ]
}
```

## formItemProps 写法

```ts
{
  field: 'phone',
  label: '手机号',
  component: 'Input',
  formItemProps: {
    rules: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1\d{10}$/, message: '手机号格式不正确', trigger: 'blur' }
    ]
  }
}
```

## useForm 常用方法

| 方法 | 说明 |
| --- | --- |
| `setValues(data)` | 设置表单值 |
| `setProps(props)` | 动态设置 Form 属性 |
| `setSchema(list)` | 动态修改 schema |
| `addSchema(schema, index?)` | 新增表单项 |
| `delSchema(field)` | 删除表单项 |
| `getFormData()` | 获取表单数据 |
| `getElFormExpose()` | 获取内部 `ElForm` 实例 |
| `getComponentExpose(field)` | 获取字段对应的子组件实例 |
| `getFormItemExpose(field)` | 获取字段对应的 `ElFormItem` 实例 |

示例：

```ts
await formMethods.setValues({ name: '张三' })

await formMethods.setSchema([
  {
    field: 'name',
    path: 'componentProps.disabled',
    value: true
  }
])

const elForm = await formMethods.getElFormExpose()
await elForm?.validate()
```

## 远程选项

`optionApi` 返回的数据会自动写入 `componentProps.options`；`TreeSelect` 会写入 `componentProps.data`。

```ts
{
  field: 'deptId',
  label: '部门',
  component: 'TreeSelect',
  optionApi: async () => {
    const res = await getDeptTreeApi()
    return res.data
  },
  componentProps: {
    nodeKey: 'id',
    props: {
      label: 'name',
      children: 'children'
    }
  }
}
```

## 使用约束

1. 新增业务表单优先使用 `schema + useForm`。
2. 校验规则优先写在 `formItemProps.rules`。
3. 事件统一写在 `componentProps.on`。
4. 复杂插槽建议使用 `lang="tsx"`。
5. 调用 `validate/resetFields/clearValidate` 时，通过 `formMethods.getElFormExpose()` 获取内部 `ElForm`。
6. `hidden` 只隐藏不删值，`remove` 会移除字段和值。
