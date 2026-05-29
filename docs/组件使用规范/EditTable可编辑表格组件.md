# EditTable 可编辑表格组件

> 组件位置：`src/components/EditTable`

`EditTable` 用于“表格行内编辑 + 行级校验”的业务场景。组件内部使用 `ElForm + ElTable`，通过列配置渲染输入框、数字输入框、选择框或自定义插槽。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { EditTable, type EditTableColumn } from '@/components/EditTable'

interface RowData {
  name?: string
  amount?: number
  status?: string
}

const tableRef = ref<InstanceType<typeof EditTable>>()

const data = ref<RowData[]>([
  { name: '', amount: 1, status: 'enabled' }
])

const columns: EditTableColumn[] = [
  {
    field: 'name',
    label: '名称',
    editType: 'input',
    required: true
  },
  {
    field: 'amount',
    label: '数量',
    editType: 'inputNumber',
    required: true,
    componentProps: {
      min: 1,
      controlsPosition: 'right'
    }
  },
  {
    field: 'status',
    label: '状态',
    editType: 'select',
    required: true,
    options: [
      { label: '启用', value: 'enabled' },
      { label: '禁用', value: 'disabled' }
    ]
  }
]

const submit = async () => {
  const result = await tableRef.value?.validate({ requiredData: true })

  if (!result?.valid) return

  console.log(result.data)
}
</script>

<template>
  <EditTable ref="tableRef" v-model:data="data" :columns="columns" />
  <BaseButton type="primary" @click="submit">提交</BaseButton>
</template>
```

## 自定义单元格

列配置为 `editType: 'slot'` 后，通过字段名作为插槽名渲染内容。自定义控件仍建议把值写回当前行。

```vue
<EditTable v-model:data="data" :columns="columns">
  <template #price="{ row }">
    <ElInput v-model="row.price" placeholder="请输入价格" />
  </template>
</EditTable>
```

```ts
const columns: EditTableColumn[] = [
  {
    field: 'price',
    label: '价格',
    editType: 'slot',
    required: true
  }
]
```

## 常用属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `data` | 表格数据，支持 `v-model:data` | `[]` |
| `columns` | 列配置 | `[]` |
| `rules` | 按字段配置的校验规则 | `{}` |
| `listTypeInfo` | 选择框选项字典 | `{}` |
| `mode` | `edit` 编辑模式，`view` 只读模式 | `edit` |
| `showIndex` | 是否显示序号列 | `true` |
| `showSelection` | 是否显示多选列 | `false` |
| `loading` | 表格加载状态 | `false` |
| `rowKey` | 行 key | `id` |

除上述属性外，组件会透传 `ElTable` 属性，例如 `height`、`max-height`、`row-class-name`。

## Column 常用配置

| 属性 | 说明 |
| --- | --- |
| `field` | 字段名 |
| `label` | 列标题 |
| `editType` | 编辑类型：`text`、`input`、`textarea`、`inputNumber`、`select`、`slot` |
| `required` | 是否必填；会在表头显示红色星号 |
| `rules` | 当前列校验规则，优先级高于 `rules[field]` |
| `componentProps` | 透传给输入控件 |
| `options` | `select` 的选项，也可以是函数 |
| `list` | 从 `listTypeInfo` 中读取选项的 key |
| `optionProps` | 选项字段别名 |
| `editable` | 是否可编辑，支持函数 |
| `disabled` | 是否禁用，支持函数 |
| `formatter` | 只读显示格式化 |

## 暴露方法

| 方法 | 说明 |
| --- | --- |
| `validate(options?)` | 校验表格，返回 `{ valid, data, fields }` |
| `clearValidate()` | 清空校验 |
| `getData()` | 获取当前表格数据 |
| `setData(data)` | 设置表格数据 |
| `addRow(row?, index?)` | 新增行 |
| `removeRow(index)` | 删除行 |

## 事件

| 事件 | 说明 |
| --- | --- |
| `change` | 单元格 change，返回结构化 payload |
| `input` | 输入框 input，返回结构化 payload |
| `blur` | 单元格 blur，返回结构化 payload |
| `focus` | 单元格 focus，返回结构化 payload |
| `selectionChange` | 多选变化 |

## 开发要点

1. 新代码统一使用 `field`、`editType`、`componentProps`。
2. 选择框选项优先直接配置 `options`；多个列复用同一组选项时使用 `listTypeInfo + list`。
3. 业务提交前统一调用 `validate({ requiredData: true })`，不要自行遍历行数据做重复校验。
