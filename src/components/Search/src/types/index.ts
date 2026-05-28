import { ColProps, FormSchema } from '@/components/Form'

export interface SearchProps {
  schema?: FormSchema[]
  isCol?: boolean
  labelWidth?: string | number
  layout?: 'inline' | 'bottom'
  buttonPosition?: 'left' | 'right' | 'center'
  showSearch?: boolean
  showReset?: boolean
  showExpand?: boolean
  expandField?: string
  columnCount?: number
  autoResponsive?: boolean
  responsiveColProps?: ColProps
  inline?: boolean
  removeNoValueItem?: boolean
  model?: Recordable
}
