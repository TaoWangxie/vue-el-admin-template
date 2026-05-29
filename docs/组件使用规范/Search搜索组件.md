# Search 搜索组件文档

> 组件位置：`src/components/Search`
> 参考文档：https://element-plus-admin-doc.cn/components/search.html

`Search` 是基于 `Form` 封装的查询表单组件，内部自动渲染查询、重置、展开收起按钮。业务列表页的筛选区优先使用 `Search + useSearch`。

## 基础用法

```vue
<script setup lang="ts">
import { reactive } from 'vue'
import { Search } from '@/components/Search'
import type { FormSchema } from '@/components/Form'

const schema = reactive<FormSchema[]>([
  {
    field: 'keyword',
    label: '关键词',
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

const onSearch = (params: Recordable) => {
  console.log('search:', params)
}

const onReset = (params: Recordable) => {
  console.log('reset:', params)
}
</script>

<template>
  <Search :schema="schema" @search="onSearch" @reset="onReset" />
</template>
```

## 推荐用法：useSearch

需要动态设置查询项和值时，使用 `useSearch`。

```vue
<script setup lang="ts">
import { reactive } from 'vue'
import { Search } from '@/components/Search'
import { useSearch } from '@/hooks/web/useSearch'
import type { FormSchema } from '@/components/Form'

const { searchRegister, searchMethods } = useSearch()

const schema = reactive<FormSchema[]>([
  { field: 'name', label: '名称', component: 'Input' }
])

const setDefault = async () => {
  await searchMethods.setValues({ name: '默认名称' })
}
</script>

<template>
  <Search :schema="schema" @register="searchRegister" @search="console.log" />
  <BaseButton @click="setDefault">设置默认值</BaseButton>
</template>
```

## Search 常用属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `schema` | 查询表单配置，类型同 `FormSchema[]` | `[]` |
| `isCol` | 是否启用栅格布局 | `false` |
| `labelWidth` | label 宽度 | `'auto'` |
| `layout` | 历史兼容配置；按钮固定在表单下方单独一行展示 | `'inline'` |
| `buttonPosition` | 按钮单独一行时的对齐方式 | `'left'` |
| `showSearch` | 是否显示查询按钮 | `true` |
| `showReset` | 是否显示重置按钮 | `true` |
| `showExpand` | 是否显示展开收起按钮 | `false` |
| `expandField` | 收起时从哪个字段开始隐藏 | `''` |
| `columnCount` | 固定每行展示几列；设置后优先于响应式列配置 | `0` |
| `autoResponsive` | `isCol=true` 时是否自动设置搜索项响应式栅格 | `true` |
| `responsiveColProps` | 搜索项默认响应式栅格配置 | `{ xs: 24, sm: 12, md: 12, lg: 6, xl: 6 }` |
| `inline` | 是否使用 `ElForm` inline 模式 | `true` |
| `removeNoValueItem` | 查询/重置时是否过滤空值字段 | `true` |
| `model` | 外部查询数据 | `{}` |
| `searchLoading` | 查询按钮 loading | `false` |
| `resetLoading` | 重置按钮 loading | `false` |

## Schema 写法

`Search` 的 `schema` 与 `Form` 完全一致，常用配置包括：

```ts
{
  field: 'createTime',
  label: '创建时间',
  component: 'DatePicker',
  componentProps: {
    type: 'daterange',
    valueFormat: 'YYYY-MM-DD'
  }
}
```

查询、重置、展开收起按钮固定渲染在表单下方，始终单独占一行；通过 `buttonPosition` 控制左、中、右对齐。

## 操作按钮插槽

列表页的新增、导出等操作按钮放到 `action` 插槽中，插槽内容会紧跟在查询、重置按钮后面。

```vue
<Search :schema="schema" @search="onSearch" @reset="onReset">
  <template #action>
    <BaseButton type="primary" @click="openCreatePage">新增</BaseButton>
  </template>
</Search>
```

## 搜索项列数

启用栅格布局时，`Search` 默认会自动设置响应式列宽：

```vue
<Search :schema="schema" :is-col="true" />
```

默认断点规则：

```ts
{
  xs: 24,
  sm: 12,
  md: 12,
  lg: 6,
  xl: 6
}
```

即小屏一行 1 个，中屏一行 2 个，大屏一行 4 个。

如果业务页面需要固定每行展示数量，使用 `columnCount`：

```vue
<Search :schema="schema" :is-col="true" :column-count="4" />
```

`columnCount` 会换算为 `span = 24 / columnCount`，例如：

```vue
<Search :schema="schema" :is-col="true" :column-count="2" />
<Search :schema="schema" :is-col="true" :column-count="3" />
<Search :schema="schema" :is-col="true" :column-count="4" />
```

如果某个页面需要自定义响应式断点：

```vue
<Search
  :schema="schema"
  :is-col="true"
  :responsive-col-props="{ xs: 24, sm: 24, md: 8, lg: 6, xl: 6 }"
/>
```

如果需要完全手动控制每个搜索项的 `colProps`，关闭自动响应式：

```vue
<Search :schema="schema" :is-col="true" :auto-responsive="false" />
```

## 展开收起

配置 `showExpand` 和 `expandField` 后，收起时会从 `expandField` 对应字段开始隐藏。

```vue
<Search
  :schema="schema"
  show-expand
  expand-field="createTime"
  @search="onSearch"
/>
```

## 事件

| 事件 | 说明 | 回调参数 |
| --- | --- | --- |
| `search` | 点击查询且校验通过后触发 | 过滤后的表单数据 |
| `reset` | 点击重置后触发 | 过滤后的表单数据 |
| `register` | 注册组件实例，配合 `useSearch` 使用 | `SearchExpose` |
| `validate` | 内部 Form 校验事件 | `(prop, isValid, message)` |

默认会过滤空值字段；如接口需要保留空字段，设置 `:remove-no-value-item="false"`。

## useSearch 常用方法

| 方法 | 说明 |
| --- | --- |
| `setValues(data)` | 设置查询表单值 |
| `setProps(props)` | 动态设置 Search 属性 |
| `setSchema(list)` | 动态修改查询项配置 |
| `addSchema(schema, index?)` | 新增查询项 |
| `delSchema(field)` | 删除查询项 |
| `getFormData()` | 获取当前查询数据 |

示例：

```ts
await searchMethods.setSchema([
  {
    field: 'status',
    path: 'componentProps.options',
    value: [
      { label: '启用', value: 1 },
      { label: '禁用', value: 0 }
    ]
  }
])
```

## 和 Table 联动

```vue
<script setup lang="ts">
const queryParams = ref({})

const onSearch = (params: Recordable) => {
  queryParams.value = params
  tableState.currentPage.value = 1
  tableMethods.getList()
}

const onReset = (params: Recordable) => {
  queryParams.value = params
  tableState.currentPage.value = 1
  tableMethods.getList()
}
</script>

<template>
  <Search :schema="searchSchema" @search="onSearch" @reset="onReset">
    <template #action>
      <BaseButton type="primary" @click="openCreatePage">新增</BaseButton>
    </template>
  </Search>
  <Table :columns="columns" :data="tableState.dataList.value" />
</template>
```

## 使用约束

1. 查询区优先使用 `Search`，不要手写重复的查询按钮逻辑。
2. `schema` 配置规则遵循 `Form` 组件规范。
3. 查询接口参数默认会过滤空值字段。
4. 需要动态修改查询项时，使用 `useSearch`。
5. 搜索后通常需要把表格页码重置为第一页。
6. 列表页操作按钮优先放到 `Search` 的 `action` 插槽中，紧跟查询、重置按钮展示。
7. 修改 Search 的 props、事件、暴露方法、默认行为后，必须精炼同步本文档，并确保本文档不超过 500 行。
