# Table 表格组件文档

> 组件位置：`src/components/Table`
> 参考文档：https://element-plus-admin-doc.cn/components/table.html

`Table` 是基于 `Element Plus ElTable` 封装的配置化表格组件，通过 `columns` 数组生成表格列。业务列表页优先使用 `Table + useTable`。

## 基础用法

```vue
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Table, type TableColumn } from '@/components/Table'

const columns = reactive<TableColumn[]>([
  { field: 'id', label: 'ID', width: 80 },
  { field: 'name', label: '名称' },
  { field: 'status', label: '状态' }
])

const data = ref([
  { id: 1, name: '测试数据', status: '启用' }
])
</script>

<template>
  <Table :columns="columns" :data="data" />
</template>
```

## 推荐用法：useTable

需要请求列表、分页、刷新、动态改列时，使用 `useTable`。

```vue
<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { Table, type TableColumn } from '@/components/Table'
import { useTable } from '@/hooks/web/useTable'

const columns = reactive<TableColumn[]>([
  { field: 'selection', type: 'selection' },
  { field: 'index', label: '序号', type: 'index' },
  { field: 'name', label: '名称' },
  { field: 'createTime', label: '创建时间', width: 180 }
])

const { tableRegister, tableState, tableMethods } = useTable({
  immediate: false,
  fetchDataApi: async () => {
    const res = await getListApi({
      page: tableState.currentPage.value,
      pageSize: tableState.pageSize.value
    })
    return {
      list: res.data.list,
      total: res.data.total
    }
  }
})

const refresh = () => {
  tableMethods.refresh()
}

onMounted(() => {
  tableMethods.getList()
})
</script>

<template>
  <Table
    v-model:current-page="tableState.currentPage.value"
    v-model:page-size="tableState.pageSize.value"
    :columns="columns"
    :data="tableState.dataList.value"
    :loading="tableState.loading.value"
    :pagination="{ total: tableState.total.value }"
    show-action
    @register="tableRegister"
    @refresh="refresh"
  />
</template>
```

## Table 常用属性

除下表外，支持透传 `ElTable` 属性，如 `row-key`、`stripe`、`border`、`height`、`max-height`、`highlight-current-row` 等。

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `columns` | 表格列配置 | `[]` |
| `data` | 表格数据 | `[]` |
| `loading` | 加载状态 | `false` |
| `pagination` | 分页配置；不传则不显示分页 | `undefined` |
| `currentPage` | 当前页 | `1` |
| `pageSize` | 每页条数 | `10` |
| `showAction` | 是否显示表格工具栏 | `false` |
| `border` | 是否显示纵向边框 | `false` |
| `showOverflowTooltip` | 全局超出隐藏提示 | `true` |
| `reserveIndex` | 分页时序号是否叠加 | `false` |
| `reserveSelection` | 数据更新后保留选中项，需配置 `row-key` | `false` |
| `align` | 默认列对齐方式 | `'left'` |
| `headerAlign` | 默认表头对齐方式 | `'left'` |
| `headerCellStyle` | 表头单元格样式；默认有浅色背景和较深文字色，可传入覆盖 | `{ backgroundColor: 'var(--el-fill-color-light)', color: 'var(--el-text-color-primary)' }` |
| `imagePreview` | 自动图片预览字段数组 | `[]` |
| `videoPreview` | 自动视频预览字段数组 | `[]` |
| `customContent` | 是否自定义卡片内容 | `false` |

默认分页使用 Element Plus 的背景色样式，整体居右展示，`total` 位于分页内容最左侧；如需取消背景色，可传入 `:pagination="{ total, background: false }"`。

## Column 常用配置

| 属性 | 说明 |
| --- | --- |
| `field` | 字段名；普通列会作为 `prop` |
| `label` | 列标题 |
| `type` | 特殊列类型，如 `index`、`selection`、`expand` |
| `width` / `minWidth` | 列宽 |
| `fixed` | 固定列 |
| `hidden` | 隐藏列 |
| `children` | 多级表头 |
| `formatter` | 格式化显示内容 |
| `slots.default` | 自定义单元格 |
| `slots.header` | 自定义表头 |
| `showOverflowTooltip` | 单列超出隐藏提示 |
| `align` / `headerAlign` | 单列对齐方式 |

## 自定义列内容

复杂单元格建议使用 `lang="tsx"`。

```tsx
const columns = reactive<TableColumn[]>([
  {
    field: 'status',
    label: '状态',
    slots: {
      default: ({ row }) => {
        return (
          <ElTag type={row.status === 1 ? 'success' : 'danger'}>
            {row.status === 1 ? '启用' : '禁用'}
          </ElTag>
        )
      }
    }
  }
])
```

简单格式化可用 `formatter`：

```ts
{
  field: 'amount',
  label: '金额',
  formatter: (_row, _column, value) => `¥${value}`
}
```

## 多级表头

```ts
const columns = reactive<TableColumn[]>([
  {
    field: 'baseInfo',
    label: '基础信息',
    children: [
      { field: 'name', label: '名称' },
      { field: 'phone', label: '手机号' }
    ]
  }
])
```

## 图片和视频预览

配置 `imagePreview` 或 `videoPreview` 后，对应字段会自动渲染预览内容。

```vue
<Table
  :columns="columns"
  :data="data"
  :image-preview="['avatar']"
  :video-preview="['videoUrl']"
/>
```

## useTable 常用方法

| 方法 | 说明 |
| --- | --- |
| `getList()` | 请求列表数据 |
| `refresh()` | 重新请求列表 |
| `setProps(props)` | 动态设置 Table 属性 |
| `setColumn(list)` | 动态修改列配置 |
| `addColumn(column, index?)` | 新增列 |
| `delColumn(field)` | 删除列 |
| `getElTableExpose()` | 获取内部 `ElTable` 实例 |
| `delList(idsLength)` | 删除后自动处理分页并刷新 |

示例：

```ts
await tableMethods.setColumn([
  {
    field: 'name',
    path: 'hidden',
    value: true
  }
])

const elTable = await tableMethods.getElTableExpose()
elTable?.clearSelection()
```

## 使用约束

1. 列表页优先使用 `Table + useTable`。
2. `pagination` 不传时不显示分页；需要分页时至少传入 `{ total }`。
3. 需要跨页保留勾选时，配置 `row-key` 和 `reserveSelection`。
4. 复杂单元格用 `slots.default`，简单文本转换用 `formatter`。
5. 需要调用 `ElTable` 原生方法时，通过 `tableMethods.getElTableExpose()` 获取实例。
6. 默认不显示纵向边框；确需边框表格时显式传 `border`。
7. 表头默认使用 `var(--el-fill-color-light)` 作为背景色、`var(--el-text-color-primary)` 作为文字色；特殊页面可通过 `header-cell-style` 覆盖。
