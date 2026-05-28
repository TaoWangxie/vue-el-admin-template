# Dialog 弹窗组件文档

> 组件位置：`src/components/Dialog`
> 参考文档：https://element-plus-admin-doc.cn/components/dialog.html

`Dialog` 是基于 `Element Plus ElDialog` 封装的弹窗组件，内置居中展示、可拖拽、禁止点击遮罩关闭、头部关闭按钮、全屏切换和内容滚动区域。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Dialog } from '@/components/Dialog'

const visible = ref(false)
</script>

<template>
  <BaseButton type="primary" @click="visible = true">打开弹窗</BaseButton>

  <Dialog v-model="visible" title="新增数据" max-height="500px">
    <div>弹窗内容</div>

    <template #footer>
      <BaseButton @click="visible = false">取消</BaseButton>
      <BaseButton type="primary" @click="visible = false">确定</BaseButton>
    </template>
  </Dialog>
</template>
```

## Dialog 常用属性

除下表外，支持透传 `ElDialog` 属性，如 `width`、`before-close`、`close-on-press-escape`、`append-to-body` 等。

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `modelValue` / `v-model` | 是否显示弹窗 | `false` |
| `title` | 弹窗标题 | `'Dialog'` |
| `fullscreen` | 是否显示全屏切换按钮 | `true` |
| `maxHeight` | 非全屏时内容区最大高度 | `'400px'` |

组件内部固定配置：

| 配置 | 值 |
| --- | --- |
| `destroy-on-close` | `true` |
| `lock-scroll` | `true` |
| `draggable` | `true` |
| `top` | `'0'` |
| `close-on-click-modal` | `false` |
| `show-close` | `false`，使用自定义头部关闭按钮 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 弹窗主体内容，内部包裹 `ElScrollbar` |
| `title` | 自定义标题内容 |
| `footer` | 底部操作区 |

自定义标题：

```vue
<Dialog v-model="visible">
  <template #title>
    <span>用户详情</span>
  </template>

  <div>内容</div>
</Dialog>
```

## 表单弹窗示例

```vue
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Dialog } from '@/components/Dialog'
import { Form, type FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'

const visible = ref(false)
const { formRegister, formMethods } = useForm()

const schema = reactive<FormSchema[]>([
  {
    field: 'name',
    label: '名称',
    component: 'Input',
    formItemProps: {
      rules: [{ required: true, message: '请输入名称', trigger: 'blur' }]
    }
  }
])

const submit = async () => {
  const elForm = await formMethods.getElFormExpose()
  await elForm?.validate()
  const data = await formMethods.getFormData()
  console.log(data)
  visible.value = false
}
</script>

<template>
  <Dialog v-model="visible" title="编辑" width="600px">
    <Form :schema="schema" @register="formRegister" />

    <template #footer>
      <BaseButton @click="visible = false">取消</BaseButton>
      <BaseButton type="primary" @click="submit">保存</BaseButton>
    </template>
  </Dialog>
</template>
```

## 使用约束

1. 弹窗统一使用 `Dialog`，不要直接重复封装 `ElDialog`。
2. 弹窗内容过长时，设置合适的 `max-height`，内容区会自动滚动。
3. 需要底部按钮时使用 `footer` 插槽。
4. 表单弹窗建议配合 `Form + useForm`。
5. 弹窗关闭会销毁内部内容，关闭后再打开会重新挂载。
