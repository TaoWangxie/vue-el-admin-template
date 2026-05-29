<script setup lang="tsx">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElIcon, ElInput, ElOption, ElSelect, ElUpload } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { DetailSection } from '@/components/DetailSection'
import { Form, type FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { useTagsView } from '@/hooks/web/useTagsView'

interface CreateFormValues {
  name?: string
  brand?: string
  series?: string
  brandSeries?: string
  status?: string
  city?: string
  address?: string
  location?: string
  remark?: string
  uploadFile?: string
  uploadImage?: string
}

const router = useRouter()
const { closeCurrent } = useTagsView()

const statusOptions = [
  { label: '启用', value: 'enabled' },
  { label: '禁用', value: 'disabled' },
  { label: '待处理', value: 'pending' }
]

const cityOptions = [
  { label: '北京', value: 'beijing' },
  { label: '上海', value: 'shanghai' },
  { label: '广州', value: 'guangzhou' },
  { label: '深圳', value: 'shenzhen' }
]

const brandOptions = [
  { label: '奥迪', value: 'audi' },
  { label: '宝马', value: 'bmw' },
  { label: '奔驰', value: 'benz' }
]

const seriesOptionsMap: Record<string, Array<{ label: string; value: string }>> = {
  audi: [
    { label: 'A4L', value: 'a4l' },
    { label: 'Q5L', value: 'q5l' }
  ],
  bmw: [
    { label: '3系', value: 'series-3' },
    { label: 'X3', value: 'x3' }
  ],
  benz: [
    { label: 'C级', value: 'c-class' },
    { label: 'GLC', value: 'glc' }
  ]
}

const sectionFormColProps = {
  span: 8
}

const doubleFormColProps = {
  span: 8
}

const fullFormColProps = {
  span: 24
}

const basicFormSchema = reactive<FormSchema[]>([
  {
    field: 'name',
    label: '项目名称',
    component: 'Input',
    colProps: sectionFormColProps,
    formItemProps: {
      rules: [{ required: true, message: '请输入项目名称', trigger: 'blur' }]
    },
    componentProps: {
      placeholder: '请输入项目名称'
    }
  },
  {
    field: 'brandSeries',
    label: '品牌/车系',
    component: 'Input',
    colProps: doubleFormColProps,
    formItemProps: {
      rules: [{ required: true, message: '请选择车辆品牌和车系', trigger: 'change' }],
      slots: {
        default: (formModel: CreateFormValues) => {
          const syncBrandSeriesValue = () => {
            formModel.brandSeries =
              formModel.brand && formModel.series ? `${formModel.brand}/${formModel.series}` : ''
          }

          return (
            <div class="brand-series-field">
              <ElSelect
                modelValue={formModel.brand}
                clearable
                placeholder="请选择车辆品牌"
                {...{
                  'onUpdate:modelValue': (value: string) => {
                    formModel.brand = value
                  }
                }}
                onChange={() => {
                  formModel.series = ''
                  syncBrandSeriesValue()
                }}
              >
                {brandOptions.map((item) => (
                  <ElOption key={item.value} label={item.label} value={item.value} />
                ))}
              </ElSelect>
              <ElSelect
                modelValue={formModel.series}
                clearable
                disabled={!formModel.brand}
                placeholder="请选择车辆车系"
                {...{
                  'onUpdate:modelValue': (value: string) => {
                    formModel.series = value
                  }
                }}
                onChange={syncBrandSeriesValue}
              >
                {(formModel.brand ? seriesOptionsMap[formModel.brand] || [] : []).map((item) => (
                  <ElOption key={item.value} label={item.label} value={item.value} />
                ))}
              </ElSelect>
            </div>
          )
        }
      }
    }
  },
  {
    field: 'status',
    label: '状态',
    component: 'Select',
    colProps: sectionFormColProps,
    formItemProps: {
      rules: [{ required: true, message: '请选择状态', trigger: 'change' }]
    },
    componentProps: {
      placeholder: '请选择状态',
      options: statusOptions
    }
  },
  {
    field: 'location',
    label: '地点选择',
    component: 'Input',
    colProps: doubleFormColProps,
    formItemProps: {
      rules: [{ required: true, message: '请选择城市并输入详细地址', trigger: 'change' }],
      slots: {
        default: (formModel: CreateFormValues) => {
          const syncLocationValue = () => {
            formModel.location =
              formModel.city && formModel.address ? `${formModel.city}/${formModel.address}` : ''
          }

          return (
            <div class="location-field">
              <ElSelect
                modelValue={formModel.city}
                clearable
                placeholder="请选择城市"
                {...{
                  'onUpdate:modelValue': (value: string) => {
                    formModel.city = value
                    syncLocationValue()
                  }
                }}
                onChange={syncLocationValue}
              >
                {cityOptions.map((item) => (
                  <ElOption key={item.value} label={item.label} value={item.value} />
                ))}
              </ElSelect>
              <ElInput
                modelValue={formModel.address}
                clearable
                placeholder="请输入详细地址"
                {...{
                  'onUpdate:modelValue': (value: string) => {
                    formModel.address = value
                    syncLocationValue()
                  }
                }}
                onChange={syncLocationValue}
              />
            </div>
          )
        }
      }
    }
  },
  {
    field: 'remark',
    label: '备注',
    component: 'Input',
    colProps: fullFormColProps,
    componentProps: {
      type: 'textarea',
      rows: 3,
      placeholder: '请输入备注'
    }
  },
  {
    field: 'uploadFile',
    label: '上传文件',
    component: 'Input',
    colProps: fullFormColProps,
    formItemProps: {
      slots: {
        default: () => (
          <ElUpload action="#" autoUpload={false} limit={1}>
            {{
              trigger: () => (
                <button class="upload-file-trigger" type="button">
                  <ElIcon size={22}>
                    <UploadFilled />
                  </ElIcon>
                  <span>选择文件</span>
                </button>
              ),
              tip: () => <div class="el-upload__tip">支持上传业务附件，单个文件不超过 10MB</div>
            }}
          </ElUpload>
        )
      }
    }
  },
  {
    field: 'uploadImage',
    label: '上传图片',
    component: 'Input',
    colProps: fullFormColProps,
    formItemProps: {
      slots: {
        default: () => (
          <ElUpload action="#" autoUpload={false} limit={1} listType="picture-card">
            {{
              default: () => <span class="text-24px leading-none">+</span>,
              tip: () => <div class="el-upload__tip">支持上传图片，建议使用 JPG、PNG 格式</div>
            }}
          </ElUpload>
        )
      }
    }
  }
])

const { formRegister: basicFormRegister, formMethods: basicFormMethods } = useForm()

const closePage = () => {
  closeCurrent(undefined, () => {
    router.push('/demo/index')
  })
}

const submitPage = async () => {
  const basicForm = await basicFormMethods.getElFormExpose()
  const isBasicValid = await basicForm?.validate().catch(() => false)

  if (!isBasicValid) return

  const submitValues = (await basicFormMethods.getFormData()) as CreateFormValues

  void submitValues
  closePage()
}
</script>

<template>
  <div class="create-page">
    <DetailSection title="基本信息">
      <div class="detail-field--full">
        <Form
          :schema="basicFormSchema"
          label-width="90px"
          :is-col="true"
          @register="basicFormRegister"
        />
      </div>
    </DetailSection>

    <div class="create-page__footer">
      <BaseButton @click="closePage">取消</BaseButton>
      <BaseButton type="primary" @click="submitPage">提交</BaseButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.create-page {
  min-height: calc(100vh - var(--top-tool-height) - var(--tags-view-height) - 24px);

  &__footer {
    display: flex;
    padding: 12px 0;
    justify-content: center;
    gap: 12px;
  }
}

:deep(.upload-file-trigger) {
  display: inline-flex;
  height: 34px;
  padding: 0 12px;
  appearance: none;
  color: var(--el-color-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  background: #f5f7fb;
  border: none;
  border-radius: 4px;
  align-items: center;
  gap: 6px;

  &:hover {
    background: #eef4ff;
  }
}

:deep(.brand-series-field),
:deep(.location-field) {
  display: flex;
  width: 100%;
  gap: 12px;

  .el-select,
  .el-input {
    flex: 1;
  }
}
</style>
