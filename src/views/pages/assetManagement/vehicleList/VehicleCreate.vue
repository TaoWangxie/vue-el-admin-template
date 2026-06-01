<script setup lang="tsx">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElIcon, ElOption, ElSelect, ElUpload } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { DetailSection } from '@/components/DetailSection'
import { DetailTabs, type DetailTabOption } from '@/components/DetailTabs'
import { FileUpload } from '@/components/FileUpload'
import { Form, type FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { useTagsView } from '@/hooks/web/useTagsView'

interface VehicleFormValues {
  drivingLicenseUrl?: string
  plateNo?: string
  vin?: string
  brand?: string
  series?: string
  brandSeries?: string
  model?: string
  purchaseDate?: string
  purchaseAmount?: string
  assetCode?: string
  registerDate?: string
  status?: string
  engineNo?: string
  powerType?: string
  fuelType?: string
  gearboxType?: string
  passengerCount?: string
  displacement?: string
  displacementUnit?: string
  bodyColor?: string
  remark?: string
  warrantyPeriod?: string
  oilCardType?: string
  oilCardNo?: string
  purchaseContractNo?: string
  vehicleRegistrationUrl?: string
  vehicleCertificateUrl?: string
  purchaseInvoiceUrl?: string
  otherAttachmentUrl?: string
}

const route = useRoute()
const router = useRouter()
const { closeCurrent } = useTagsView()

const vehicleId = computed(() => route.query.id as string | undefined)

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

const modelOptions = [
  { label: '舒适款', value: 'comfort' },
  { label: '豪华款', value: 'luxury' },
  { label: '旗舰款', value: 'flagship' }
]

const statusOptions = [
  { label: '待租赁', value: 'waiting-rent' },
  { label: '租赁中', value: 'rented' },
  { label: '待处置', value: 'pending-disposal' },
  { label: '已处置', value: 'disposed' }
]

const powerTypeOptions = [
  { label: '燃油', value: 'fuel' },
  { label: '纯电', value: 'electric' },
  { label: '混动', value: 'hybrid' }
]

const fuelTypeOptions = [
  { label: '汽油', value: 'gasoline' },
  { label: '柴油', value: 'diesel' }
]

const gearboxTypeOptions = [
  { label: '自动挡', value: 'automatic' },
  { label: '手动挡', value: 'manual' }
]

const displacementUnitOptions = [
  { label: 'L', value: 'l' },
  { label: 'T', value: 't' }
]

const bodyColorOptions = [
  { label: '黑色', value: 'black' },
  { label: '白色', value: 'white' },
  { label: '银色', value: 'silver' }
]

const oilCardTypeOptions = [
  { label: '中石化', value: 'sinopec' },
  { label: '中石油', value: 'petrochina' },
  { label: '企业油卡', value: 'company-card' }
]

const formColProps = {
  span: 12
}

const fullColProps = {
  span: 24
}

const activeTab = ref('spec')

const detailTabs: DetailTabOption[] = [
  { label: '规格参数', value: 'spec' },
  { label: '车务信息', value: 'service' },
  { label: '关联附件', value: 'attachment' }
]

const renderAttachmentUpload = (buttonText = '选择文件') => (
  <FileUpload buttonText={buttonText} tip="支持上传业务附件，单个文件不超过 10MB" />
)

const basicFormSchema = reactive<FormSchema[]>([
  {
    field: 'drivingLicenseUrl',
    label: '行驶证扫描件',
    component: 'Input',
    colProps: formColProps,
    formItemProps: {
      slots: {
        default: () => (
          <ElUpload action="" autoUpload={false} limit={1} listType="picture">
            {{
              trigger: () => (
                <button class="license-upload" type="button">
                  <span class="license-upload__icon">
                    <ElIcon size={36}>
                      <UploadFilled />
                    </ElIcon>
                  </span>
                  <span class="license-upload__title">上传行驶证</span>
                  <span class="license-upload__tip">文件支持jpg/png/jpeg格式，且不超过20MB</span>
                </button>
              )
            }}
          </ElUpload>
        )
      }
    }
  },
  {
    field: 'plateNo',
    label: '车牌号',
    component: 'Input',
    colProps: formColProps,
    formItemProps: {
      rules: [{ required: true, message: '请输入车牌号', trigger: 'blur' }]
    },
    componentProps: {
      placeholder: '请输入车牌号'
    }
  },
  {
    field: 'purchaseDate',
    label: '购置日期',
    component: 'DatePicker',
    colProps: formColProps,
    formItemProps: {
      rules: [{ required: true, message: '请选择购置日期', trigger: 'change' }]
    },
    componentProps: {
      type: 'date',
      valueFormat: 'YYYY-MM-DD',
      placeholder: '请选择购置日期'
    }
  },
  {
    field: 'vin',
    label: '车架号',
    component: 'Input',
    colProps: formColProps,
    formItemProps: {
      rules: [{ required: true, message: '请输入车架号', trigger: 'blur' }]
    },
    componentProps: {
      placeholder: '请输入车架号'
    }
  },
  {
    field: 'assetCode',
    label: '固定资产编码',
    component: 'Input',
    colProps: formColProps,
    formItemProps: {
      rules: [{ required: true, message: '请输入固定资产编码', trigger: 'blur' }]
    },
    componentProps: {
      placeholder: '请输入固定资产编码'
    }
  },
  {
    field: 'brandSeries',
    label: '品牌/车系',
    component: 'Input',
    colProps: formColProps,
    formItemProps: {
      rules: [{ required: true, message: '请选择车辆品牌和车系', trigger: 'change' }],
      slots: {
        default: (formModel: VehicleFormValues) => {
          const syncBrandSeriesValue = () => {
            formModel.brandSeries =
              formModel.brand && formModel.series ? `${formModel.brand}/${formModel.series}` : ''
          }

          return (
            <div class="vehicle-composite-field">
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
    label: '车辆状态',
    component: 'Select',
    colProps: formColProps,
    componentProps: {
      placeholder: '请选择车辆状态',
      options: statusOptions
    }
  },
  {
    field: 'model',
    label: '配置款',
    component: 'Select',
    colProps: formColProps,
    formItemProps: {
      rules: [{ required: true, message: '请选择车辆配置款', trigger: 'change' }]
    },
    componentProps: {
      placeholder: '请选择车辆配置款',
      options: modelOptions
    }
  },
  {
    field: 'purchaseAmount',
    label: '购置金额',
    component: 'Input',
    colProps: formColProps,
    formItemProps: {
      rules: [{ required: true, message: '请输入购置金额', trigger: 'blur' }]
    },
    componentProps: {
      placeholder: '请输入购置金额'
    }
  },
  {
    field: 'registerDate',
    label: '注册日期',
    component: 'DatePicker',
    colProps: formColProps,
    componentProps: {
      type: 'date',
      valueFormat: 'YYYY-MM-DD',
      placeholder: '请选择注册日期'
    }
  },
  {
    field: 'engineNo',
    label: '发动机号',
    component: 'Input',
    colProps: formColProps,
    componentProps: {
      placeholder: '请输入发动机号'
    }
  }
])

const specFormSchema = reactive<FormSchema[]>([
  {
    field: 'powerType',
    label: '动力类型',
    component: 'Select',
    colProps: formColProps,
    componentProps: {
      placeholder: '请选择动力类型',
      options: powerTypeOptions
    }
  },
  {
    field: 'gearboxType',
    label: '变速箱类型',
    component: 'Select',
    colProps: formColProps,
    componentProps: {
      placeholder: '请选择变速箱类型',
      options: gearboxTypeOptions
    }
  },
  {
    field: 'fuelType',
    label: '燃油类型',
    component: 'Select',
    colProps: formColProps,
    componentProps: {
      placeholder: '请选择燃油类型',
      options: fuelTypeOptions
    }
  },
  {
    field: 'displacement',
    label: '发动机排量',
    component: 'Input',
    colProps: formColProps,
    componentProps: {
      placeholder: '请输入发动机排量'
    }
  },
  {
    field: 'passengerCount',
    label: '核定载人数',
    component: 'Input',
    colProps: formColProps,
    componentProps: {
      placeholder: '请输入核定载人数'
    }
  },
  {
    field: 'displacementUnit',
    label: '排量单位',
    component: 'Select',
    colProps: formColProps,
    componentProps: {
      placeholder: '请选择发动机排量单位',
      options: displacementUnitOptions
    }
  },
  {
    field: 'bodyColor',
    label: '车身颜色',
    component: 'Select',
    colProps: formColProps,
    componentProps: {
      placeholder: '请选择车身颜色',
      options: bodyColorOptions
    }
  },
  {
    field: 'remark',
    label: '备注',
    component: 'Input',
    colProps: fullColProps,
    componentProps: {
      type: 'textarea',
      rows: 3,
      placeholder: '请输入备注'
    }
  }
])

const serviceFormSchema = reactive<FormSchema[]>([
  {
    field: 'warrantyPeriod',
    label: '保养周期',
    component: 'Input',
    colProps: formColProps,
    componentProps: {
      placeholder: '请输入保养周期',
      slots: {
        append: () => <span>月</span>
      }
    }
  },
  {
    field: 'oilCardType',
    label: '油卡类型',
    component: 'Select',
    colProps: formColProps,
    componentProps: {
      placeholder: '请选择油卡类型',
      options: oilCardTypeOptions
    }
  },
  {
    field: 'oilCardNo',
    label: '油卡卡号',
    component: 'Input',
    colProps: formColProps,
    componentProps: {
      placeholder: '请输入油卡卡号'
    }
  }
])

const attachmentFormSchema = reactive<FormSchema[]>([
  {
    field: 'purchaseContractNo',
    label: '购车合同',
    component: 'Input',
    colProps: formColProps,
    componentProps: {
      placeholder: '请输入购车合同号匹配合同'
    }
  },
  {
    field: 'vehicleRegistrationUrl',
    label: '车辆登记证',
    component: 'Input',
    colProps: formColProps,
    formItemProps: {
      slots: {
        default: () => renderAttachmentUpload()
      }
    }
  },
  {
    field: 'vehicleCertificateUrl',
    label: '车辆合格证',
    component: 'Input',
    colProps: formColProps,
    formItemProps: {
      slots: {
        default: () => renderAttachmentUpload()
      }
    }
  },
  {
    field: 'purchaseInvoiceUrl',
    label: '购车发票',
    component: 'Input',
    colProps: formColProps,
    formItemProps: {
      slots: {
        default: () => renderAttachmentUpload()
      }
    }
  },
  {
    field: 'otherAttachmentUrl',
    label: '其他附件',
    component: 'Input',
    colProps: formColProps,
    formItemProps: {
      slots: {
        default: () => renderAttachmentUpload()
      }
    }
  }
])

const { formRegister: basicFormRegister, formMethods: basicFormMethods } = useForm()
const { formRegister: specFormRegister, formMethods: specFormMethods } = useForm()
const { formRegister: serviceFormRegister, formMethods: serviceFormMethods } = useForm()
const { formRegister: attachmentFormRegister, formMethods: attachmentFormMethods } = useForm()

const closePage = () => {
  closeCurrent(undefined, () => {
    router.push('/asset/vehicle-list')
  })
}

const submitPage = async () => {
  const basicForm = await basicFormMethods.getElFormExpose()
  const specForm = await specFormMethods.getElFormExpose()
  const serviceForm = await serviceFormMethods.getElFormExpose()
  const attachmentForm = await attachmentFormMethods.getElFormExpose()
  const isBasicValid = await basicForm?.validate().catch(() => false)
  const isSpecValid = await specForm?.validate().catch(() => false)
  const isServiceValid = await serviceForm?.validate().catch(() => false)
  const isAttachmentValid = await attachmentForm?.validate().catch(() => false)

  if (!isBasicValid || !isSpecValid || !isServiceValid || !isAttachmentValid) return

  const basicValues = (await basicFormMethods.getFormData()) as VehicleFormValues
  const specValues = (await specFormMethods.getFormData()) as VehicleFormValues
  const serviceValues = (await serviceFormMethods.getFormData()) as VehicleFormValues
  const attachmentValues = (await attachmentFormMethods.getFormData()) as VehicleFormValues

  void {
    ...basicValues,
    ...specValues,
    ...serviceValues,
    ...attachmentValues,
    id: vehicleId.value
  }
  closePage()
}
</script>

<template>
  <div class="vehicle-create-page">
    <DetailSection title="基本信息">
      <div class="detail-field--full vehicle-create-page__form">
        <Form
          :schema="basicFormSchema"
          label-width="118px"
          :is-col="true"
          @register="basicFormRegister"
        />

        <DetailTabs v-model="activeTab" class="vehicle-create-page__tabs" :options="detailTabs" />

        <Form
          v-show="activeTab === 'spec'"
          :schema="specFormSchema"
          label-width="118px"
          :is-col="true"
          @register="specFormRegister"
        />
        <Form
          v-show="activeTab === 'service'"
          :schema="serviceFormSchema"
          label-width="118px"
          :is-col="true"
          @register="serviceFormRegister"
        />
        <Form
          v-show="activeTab === 'attachment'"
          :schema="attachmentFormSchema"
          label-width="118px"
          :is-col="true"
          @register="attachmentFormRegister"
        />
      </div>
    </DetailSection>

    <div class="vehicle-create-page__footer">
      <BaseButton @click="closePage">取消</BaseButton>
      <BaseButton type="primary" @click="submitPage">提交</BaseButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.vehicle-create-page {
  min-height: calc(100vh - var(--top-tool-height) - var(--tags-view-height) - 24px);

  &__tabs {
    margin: 18px 0;
  }

  &__footer {
    display: flex;
    padding: 12px 0;
    justify-content: center;
    gap: 12px;
  }
}

:deep(.license-upload) {
  display: flex;
  width: 100%;
  height: 138px;
  appearance: none;
  cursor: pointer;
  background: #f7f9fd;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: var(--el-color-primary);
  }
}

:deep(.license-upload__icon) {
  display: inline-flex;
  width: 56px;
  height: 56px;
  margin-bottom: 8px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-radius: 50%;
  align-items: center;
  justify-content: center;
}

:deep(.license-upload__title) {
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
}

:deep(.license-upload__tip) {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 20px;
}

:deep(.vehicle-composite-field) {
  display: flex;
  width: 100%;
  gap: 12px;

  .el-select {
    flex: 1;
  }
}
</style>
