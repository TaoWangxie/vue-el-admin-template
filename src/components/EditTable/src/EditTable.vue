<script setup lang="ts">
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElOption,
  ElSelect,
  ElTable,
  ElTableColumn
} from 'element-plus'
import type { ComponentSize, FormInstance, FormItemRule, FormRules } from 'element-plus'
import { cloneDeep, get, omit, set } from 'lodash-es'
import { computed, reactive, ref, useAttrs, watch } from 'vue'
import type {
  EditTableChangePayload,
  EditTableColumn,
  EditTableColumnType,
  EditTableOption,
  EditTableSlotScope,
  EditTableValidateError,
  EditTableValidateOptions,
  EditTableValidateResult
} from './types'

defineOptions({
  name: 'EditTable',
  inheritAttrs: false
})

const props = withDefaults(
  defineProps<{
    data?: Recordable[]
    columns?: EditTableColumn[]
    rules?: FormRules
    listTypeInfo?: Record<string, EditTableOption[]>
    loading?: boolean
    mode?: 'edit' | 'view'
    type?: string
    showIndex?: boolean
    showSelection?: boolean
    checkType?: 'selection'
    hideConfig?: string[]
    rowKey?: string
    size?: ComponentSize
    stripe?: boolean
    border?: boolean
    height?: string | number
    maxHeight?: string | number
  }>(),
  {
    data: () => [],
    columns: () => [],
    rules: () => ({}),
    listTypeInfo: () => ({}),
    loading: false,
    mode: 'edit',
    type: '',
    showIndex: true,
    showSelection: false,
    checkType: 'selection',
    hideConfig: () => [],
    rowKey: 'id',
    size: 'default',
    stripe: false,
    border: false,
    height: undefined,
    maxHeight: undefined
  }
)

const emit = defineEmits<{
  'update:data': [value: Recordable[]]
  change: [payload: EditTableChangePayload]
  input: [payload: EditTableChangePayload]
  blur: [payload: EditTableChangePayload]
  focus: [payload: EditTableChangePayload]
  dataChange: [value: any, column: EditTableColumn, rowIndex: number, option?: any]
  dataInput: [value: any, column: EditTableColumn, rowIndex: number]
  dataBlur: [value: any, column: EditTableColumn, rowIndex: number]
  dataFocus: [value: any, column: EditTableColumn, rowIndex: number]
  selectionChange: [selection: Recordable[]]
}>()

const attrs = useAttrs()

const formRef = ref<FormInstance>()
const tableRef = ref<InstanceType<typeof ElTable>>()

const tableForm = reactive({
  data: [] as Recordable[]
})

const isViewMode = computed(() => props.mode === 'view' || props.type === 'view')

const visibleColumns = computed(() => props.columns.filter((column) => !column.hidden))

const showSelectionColumn = computed(
  () => props.showSelection && !props.hideConfig.includes('checkbox')
)

const showIndexColumn = computed(() => props.showIndex && !props.hideConfig.includes('serial'))

const tableBind = computed(() => ({
  rowKey: props.rowKey,
  stripe: props.stripe,
  border: props.border,
  height: props.height,
  maxHeight: props.maxHeight,
  size: props.size,
  ...attrs
}))

watch(
  () => props.data,
  (data) => {
    tableForm.data = cloneDeep(data || [])
  },
  {
    deep: true,
    immediate: true
  }
)

const emitData = () => {
  emit('update:data', cloneDeep(tableForm.data))
}

const getColumnField = (column: EditTableColumn) => column.field || column.prop || ''

const getColumnEditType = (column: EditTableColumn): EditTableColumnType =>
  column.editType || column.colType || 'text'

const getColumnComponentProps = (column: EditTableColumn) => ({
  ...(column.col || {}),
  ...(column.componentProps || {})
})

const getColumnProps = (column: EditTableColumn) => {
  const columnProps = omit(column, [
    'field',
    'prop',
    'editType',
    'colType',
    'componentProps',
    'col',
    'options',
    'list',
    'optionProps',
    'optionMap',
    'rules',
    'required',
    'editable',
    'disabled',
    'placeholder',
    'hidden'
  ])

  return {
    minWidth: 120,
    showOverflowTooltip: true,
    ...columnProps,
    prop: getColumnField(column)
  }
}

const getCellValue = (row: Recordable, column: EditTableColumn) => get(row, getColumnField(column))

const setCellValue = (row: Recordable, column: EditTableColumn, value: any) => {
  set(row, getColumnField(column), value)
  emitData()
}

const getOptionProps = (column: EditTableColumn) => ({
  label: column.optionProps?.label || column.optionMap?.label || column.optionMap?.key || 'label',
  value: column.optionProps?.value || column.optionMap?.value || 'value',
  disabled: column.optionProps?.disabled || column.optionMap?.disabled || 'disabled'
})

const getSelectOptions = (
  column: EditTableColumn,
  row: Recordable,
  rowIndex: number
): EditTableOption[] => {
  const options = column.options

  if (typeof options === 'function') {
    return options({ row, column, $index: rowIndex })
  }

  if (Array.isArray(options)) {
    return options
  }

  return props.listTypeInfo[column.list || getColumnField(column)] || []
}

const getSelectedOption = (
  value: any,
  column: EditTableColumn,
  row: Recordable,
  rowIndex: number
) => {
  const options = getSelectOptions(column, row, rowIndex)
  const valueKey = getOptionProps(column).value
  const componentProps = getColumnComponentProps(column)

  if (componentProps.multiple && Array.isArray(value)) {
    return options.filter((option) => value.includes(option[valueKey]))
  }

  return options.find((option) => option[valueKey] === value)
}

const getPlaceholder = (column: EditTableColumn) => {
  if (column.placeholder) return column.placeholder

  const label = column.label || ''
  const editType = getColumnEditType(column)

  if (['input', 'textarea', 'inputNumber'].includes(editType)) {
    return `请输入${label}`
  }

  if (editType === 'select') {
    return `请选择${label}`
  }

  return label
}

const getCellRules = (column: EditTableColumn): FormItemRule[] => {
  const field = getColumnField(column)
  const customRules = column.rules || props.rules[field]

  if (customRules) {
    return Array.isArray(customRules) ? customRules : [customRules]
  }

  if (!column.required) return []

  const trigger = getColumnEditType(column) === 'input' ? 'blur' : 'change'

  return [
    {
      required: true,
      message: getPlaceholder(column),
      trigger
    }
  ]
}

const getCellProp = (column: EditTableColumn, rowIndex: number) =>
  `data.${rowIndex}.${getColumnField(column)}`

const resolveBooleanConfig = (
  config: EditTableColumn['editable'] | EditTableColumn['disabled'],
  scope: EditTableSlotScope,
  defaultValue: boolean
) => {
  if (typeof config === 'function') return config(scope)
  if (typeof config === 'boolean') return config
  return defaultValue
}

const isCellEditable = (column: EditTableColumn, row: Recordable, rowIndex: number) => {
  if (isViewMode.value) return false
  if (getColumnEditType(column) === 'text') return false

  return resolveBooleanConfig(column.editable, { row, column, $index: rowIndex }, true)
}

const isCellDisabled = (column: EditTableColumn, row: Recordable, rowIndex: number) =>
  resolveBooleanConfig(column.disabled, { row, column, $index: rowIndex }, false)

const formatCellText = (row: Recordable, column: EditTableColumn, rowIndex: number) => {
  const value = getCellValue(row, column)

  if (column.formatter) {
    return column.formatter(row, column, value, rowIndex)
  }

  if (getColumnEditType(column) === 'select') {
    const selectedOption = getSelectedOption(value, column, row, rowIndex)
    const labelKey = getOptionProps(column).label

    if (Array.isArray(selectedOption)) {
      return selectedOption.map((option) => option[labelKey]).join('、')
    }

    return selectedOption?.[labelKey] ?? value ?? ''
  }

  return value ?? ''
}

const emitChange = (
  eventName: 'change' | 'input' | 'blur' | 'focus',
  value: any,
  column: EditTableColumn,
  row: Recordable,
  rowIndex: number
) => {
  const option =
    getColumnEditType(column) === 'select'
      ? getSelectedOption(value, column, row, rowIndex)
      : undefined

  const payload = {
    value,
    row,
    column,
    rowIndex,
    option
  }

  if (eventName === 'change') {
    emit('change', payload)
    emit('dataChange', value, column, rowIndex, option)
  }

  if (eventName === 'input') {
    emit('input', payload)
    emit('dataInput', value, column, rowIndex)
  }

  if (eventName === 'blur') {
    emit('blur', payload)
    emit('dataBlur', value, column, rowIndex)
  }

  if (eventName === 'focus') {
    emit('focus', payload)
    emit('dataFocus', value, column, rowIndex)
  }
}

const getHeaderCellClassName = (params: {
  row: Recordable
  column: Recordable
  rowIndex: number
  columnIndex: number
}) => {
  const field = params.column.property
  const currentColumn = props.columns.find((column) => getColumnField(column) === field)
  const classNames: string[] = []

  if (currentColumn?.required && !isViewMode.value) {
    classNames.push('edit-table__required-header')
  }

  const externalHeaderClassName = attrs.headerCellClassName || attrs['header-cell-class-name']

  if (typeof externalHeaderClassName === 'function') {
    classNames.push(externalHeaderClassName(params))
  } else if (typeof externalHeaderClassName === 'string') {
    classNames.push(externalHeaderClassName)
  }

  return classNames.filter(Boolean).join(' ')
}

const normalizeValidateFields = (fields?: Recordable): EditTableValidateError[] => {
  if (!fields) return []

  return Object.values(fields)
    .flat()
    .map((item: any) => {
      const [, rowIndex, field] = String(item.field || '').split('.')

      return {
        rowIndex: Number(rowIndex),
        field,
        message: item.message
      }
    })
}

const validate = async (
  options: EditTableValidateOptions = {}
): Promise<EditTableValidateResult> => {
  const requiredData = options.requiredData ?? options.mustData ?? false
  const skipValidate = options.skipValidate ?? options.noValid ?? false
  const data = cloneDeep(tableForm.data)

  if (requiredData && !data.length) {
    return {
      valid: false,
      data,
      fields: []
    }
  }

  if (!data.length || skipValidate) {
    return {
      valid: true,
      data,
      fields: []
    }
  }

  try {
    await formRef.value?.validate()

    return {
      valid: true,
      data,
      fields: []
    }
  } catch (fields) {
    return {
      valid: false,
      data,
      fields: normalizeValidateFields(fields as Recordable)
    }
  }
}

const confirmRule = async (options: EditTableValidateOptions = {}) => {
  if ((options.requiredData ?? options.mustData) && !tableForm.data.length) return false

  return validate({
    requiredData: options.requiredData ?? options.mustData,
    skipValidate: options.skipValidate ?? options.noValid
  })
}

const clearValidate = () => {
  formRef.value?.clearValidate()
}

const getData = () => cloneDeep(tableForm.data)

const setData = (data: Recordable[]) => {
  tableForm.data = cloneDeep(data)
  emitData()
}

const addRow = (row: Recordable = {}, index?: number) => {
  if (typeof index === 'number') {
    tableForm.data.splice(index, 0, row)
  } else {
    tableForm.data.push(row)
  }

  emitData()
}

const removeRow = (index: number) => {
  tableForm.data.splice(index, 1)
  emitData()
}

defineExpose({
  formRef,
  tableRef,
  validate,
  confirmRule,
  clearValidate,
  getData,
  setData,
  addRow,
  removeRow
})
</script>

<template>
  <div class="edit-table">
    <ElForm ref="formRef" class="edit-table__form" :model="tableForm">
      <ElTable
        ref="tableRef"
        v-bind="tableBind"
        v-loading="props.loading"
        :data="tableForm.data"
        :header-cell-class-name="getHeaderCellClassName"
        @selection-change="emit('selectionChange', $event)"
      >
        <ElTableColumn
          v-if="showSelectionColumn"
          :type="props.checkType"
          width="55"
          fixed="left"
          align="center"
        />
        <ElTableColumn
          v-if="showIndexColumn"
          type="index"
          width="55"
          fixed="left"
          align="center"
          label="序号"
        />

        <ElTableColumn
          v-for="column in visibleColumns"
          :key="getColumnField(column)"
          v-bind="getColumnProps(column)"
        >
          <template #default="scope">
            <ElFormItem
              v-if="isCellEditable(column, scope.row, scope.$index)"
              :prop="getCellProp(column, scope.$index)"
              :rules="getCellRules(column)"
            >
              <slot
                v-if="getColumnEditType(column) === 'slot'"
                :name="getColumnField(column)"
                :row="scope.row"
                :column="column"
                :row-index="scope.$index"
                :index="scope.$index"
                :scope="scope"
              ></slot>

              <ElInput
                v-else-if="['input', 'textarea'].includes(getColumnEditType(column))"
                :model-value="getCellValue(scope.row, column)"
                :type="getColumnEditType(column) === 'textarea' ? 'textarea' : undefined"
                :placeholder="getPlaceholder(column)"
                :disabled="isCellDisabled(column, scope.row, scope.$index)"
                v-bind="getColumnComponentProps(column)"
                @update:model-value="setCellValue(scope.row, column, $event)"
                @input="emitChange('input', $event, column, scope.row, scope.$index)"
                @change="emitChange('change', $event, column, scope.row, scope.$index)"
                @blur="
                  emitChange(
                    'blur',
                    getCellValue(scope.row, column),
                    column,
                    scope.row,
                    scope.$index
                  )
                "
                @focus="
                  emitChange(
                    'focus',
                    getCellValue(scope.row, column),
                    column,
                    scope.row,
                    scope.$index
                  )
                "
              />

              <ElInputNumber
                v-else-if="getColumnEditType(column) === 'inputNumber'"
                :model-value="getCellValue(scope.row, column)"
                class="edit-table__number"
                :placeholder="getPlaceholder(column)"
                :disabled="isCellDisabled(column, scope.row, scope.$index)"
                v-bind="getColumnComponentProps(column)"
                @update:model-value="setCellValue(scope.row, column, $event)"
                @change="emitChange('change', $event, column, scope.row, scope.$index)"
                @blur="
                  emitChange(
                    'blur',
                    getCellValue(scope.row, column),
                    column,
                    scope.row,
                    scope.$index
                  )
                "
                @focus="
                  emitChange(
                    'focus',
                    getCellValue(scope.row, column),
                    column,
                    scope.row,
                    scope.$index
                  )
                "
              />

              <ElSelect
                v-else-if="getColumnEditType(column) === 'select'"
                :model-value="getCellValue(scope.row, column)"
                class="edit-table__select"
                clearable
                filterable
                :placeholder="getPlaceholder(column)"
                :disabled="isCellDisabled(column, scope.row, scope.$index)"
                v-bind="getColumnComponentProps(column)"
                @update:model-value="setCellValue(scope.row, column, $event)"
                @change="emitChange('change', $event, column, scope.row, scope.$index)"
              >
                <ElOption
                  v-for="option in getSelectOptions(column, scope.row, scope.$index)"
                  :key="option[getOptionProps(column).value]"
                  :label="option[getOptionProps(column).label]"
                  :value="option[getOptionProps(column).value]"
                  :disabled="option[getOptionProps(column).disabled]"
                />
              </ElSelect>
            </ElFormItem>

            <span v-else>{{ formatCellText(scope.row, column, scope.$index) }}</span>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElForm>
  </div>
</template>

<style lang="scss" scoped>
.edit-table {
  width: 100%;
  overflow: hidden;
  background: var(--el-bg-color);

  &__form {
    width: 100%;
  }

  &__number,
  &__select {
    width: 100%;
  }
}

:deep(.el-form-item) {
  width: 100%;
  padding: 8px 0;
  margin-bottom: 0;
}

:deep(.el-form-item__content) {
  width: 100%;
}

:deep(.el-form-item__error) {
  top: calc(100% - 2px);
}

:deep(.edit-table__required-header .cell) {
  position: relative;
  padding-left: 14px;

  &::before {
    position: absolute;
    top: 50%;
    left: 4px;
    color: var(--el-color-danger);
    content: '*';
    transform: translateY(-50%);
  }
}
</style>
