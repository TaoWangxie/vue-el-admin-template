import type { FormItemRule } from 'element-plus'
import type { CSSProperties } from 'vue'

export type EditTableMode = 'edit' | 'view'

export type EditTableColumnType = 'text' | 'input' | 'textarea' | 'inputNumber' | 'select' | 'slot'

export interface EditTableOption {
  label?: string
  value?: any
  disabled?: boolean
  [key: string]: any
}

export interface EditTableOptionProps {
  label?: string
  value?: string
  disabled?: string
}

export interface EditTableColumn {
  field?: string
  prop?: string
  label?: string
  editType?: EditTableColumnType
  colType?: EditTableColumnType
  hidden?: boolean
  required?: boolean
  rules?: FormItemRule | FormItemRule[]
  componentProps?: Recordable
  col?: Recordable
  options?: EditTableOption[] | ((params: EditTableSlotScope) => EditTableOption[])
  list?: string
  optionProps?: EditTableOptionProps
  optionMap?: {
    key?: string
    label?: string
    value?: string
    disabled?: string
  }
  placeholder?: string
  editable?: boolean | ((params: EditTableSlotScope) => boolean)
  disabled?: boolean | ((params: EditTableSlotScope) => boolean)
  width?: string | number
  minWidth?: string | number
  fixed?: boolean | 'left' | 'right'
  align?: 'left' | 'center' | 'right'
  headerAlign?: 'left' | 'center' | 'right'
  showOverflowTooltip?: boolean
  formatter?: (row: Recordable, column: EditTableColumn, value: any, index: number) => any
  className?: string
  labelClassName?: string
  style?: CSSProperties
  [key: string]: any
}

export interface EditTableSlotScope {
  row: Recordable
  column: EditTableColumn
  $index: number
}

export interface EditTableChangePayload {
  value: any
  row: Recordable
  column: EditTableColumn
  rowIndex: number
  option?: EditTableOption | EditTableOption[]
}

export interface EditTableValidateError {
  rowIndex: number
  field: string
  message?: string
}

export interface EditTableValidateOptions {
  requiredData?: boolean
  skipValidate?: boolean
  mustData?: boolean
  noValid?: boolean
}

export interface EditTableValidateResult<T = Recordable> {
  valid: boolean
  data: T[]
  fields: EditTableValidateError[]
}
