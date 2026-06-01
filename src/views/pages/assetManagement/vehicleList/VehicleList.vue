<script setup lang="tsx">
import { computed, reactive, ref, unref } from 'vue'
import { ElButton, ElMessage, ElTag } from 'element-plus'
import { useRouter } from 'vue-router'
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/Search'
import { Table, type TableColumn } from '@/components/Table'
import { useSearch } from '@/hooks/web/useSearch'
import { useTable } from '@/hooks/web/useTable'
import type { FormSchema } from '@/components/Form'

type VehicleStatus = 'waiting-rent' | 'rented' | 'pending-disposal' | 'disposed' | 'expired'

interface VehicleRecord {
  id: number
  plateNo: string
  vin: string
  brand: string
  series: string
  model: string
  status: VehicleStatus
  leaseCompany: string
  orderNo: string
  demandNo: string
  belongCompany: string
  assetCode: string
  serviceStatus?: 'maintenance' | 'warranty'
}

interface VehicleQuery {
  plateNo?: string
  vin?: string
  assetCode?: string
  brand?: string
  series?: string
  model?: string
  status?: VehicleStatus
  leaseCompany?: string
}

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
  { label: '已处置', value: 'disposed' },
  { label: '已逾期', value: 'expired' }
]

const leaseCompanyOptions = [
  { label: '华北租赁单位', value: 'north' },
  { label: '华东租赁单位', value: 'east' },
  { label: '华南租赁单位', value: 'south' }
]

const statusMap: Record<VehicleStatus, string> = {
  'waiting-rent': '待租赁',
  rented: '租赁中',
  'pending-disposal': '待处置',
  disposed: '已处置',
  expired: '已逾期'
}

const serviceStatusMap = {
  maintenance: '维修中',
  warranty: '保养中'
}

const allData: VehicleRecord[] = [
  {
    id: 1,
    plateNo: '京A12345',
    vin: 'LFV3A28K1A300001',
    brand: 'audi',
    series: 'a4l',
    model: 'comfort',
    status: 'waiting-rent',
    leaseCompany: 'north',
    orderNo: 'DD20260601001',
    demandNo: 'XQ20260601001',
    belongCompany: '资产管理公司',
    assetCode: 'ZC-00001',
    serviceStatus: 'warranty'
  },
  {
    id: 2,
    plateNo: '京A12346',
    vin: 'WBA3A5101DF000002',
    brand: 'bmw',
    series: 'series-3',
    model: 'luxury',
    status: 'disposed',
    leaseCompany: 'east',
    orderNo: 'DD20260601002',
    demandNo: 'XQ20260601002',
    belongCompany: '资产管理公司',
    assetCode: 'ZC-00002',
    serviceStatus: 'maintenance'
  },
  {
    id: 3,
    plateNo: '京A12347',
    vin: 'LE4ZG4JB3FL000003',
    brand: 'benz',
    series: 'glc',
    model: 'flagship',
    status: 'rented',
    leaseCompany: 'south',
    orderNo: 'DD20260601003',
    demandNo: 'XQ20260601003',
    belongCompany: '资产管理公司',
    assetCode: 'ZC-00003'
  },
  {
    id: 4,
    plateNo: '京A12348',
    vin: 'LFV3A28K1A300004',
    brand: 'audi',
    series: 'q5l',
    model: 'luxury',
    status: 'pending-disposal',
    leaseCompany: 'north',
    orderNo: 'DD20260601004',
    demandNo: 'XQ20260601004',
    belongCompany: '资产管理公司',
    assetCode: 'ZC-00004'
  },
  {
    id: 5,
    plateNo: '京A12349',
    vin: 'WBA3A5101DF000005',
    brand: 'bmw',
    series: 'x3',
    model: 'comfort',
    status: 'expired',
    leaseCompany: 'east',
    orderNo: 'DD20260601005',
    demandNo: 'XQ20260601005',
    belongCompany: '资产管理公司',
    assetCode: 'ZC-00005'
  }
]

const queryParams = ref<VehicleQuery>({})

const router = useRouter()

const { searchRegister, searchMethods } = useSearch()

const updateSeriesOptions = async (brand?: string) => {
  await searchMethods.setValues({ series: undefined })
  await searchMethods.setSchema([
    {
      field: 'series',
      path: 'componentProps.options',
      value: brand ? seriesOptionsMap[brand] || [] : []
    },
    {
      field: 'series',
      path: 'componentProps.disabled',
      value: !brand
    }
  ])
}

const searchSchema = reactive<FormSchema[]>([
  {
    field: 'plateNo',
    label: '车牌号',
    component: 'Input',
    componentProps: {
      placeholder: '请输入车牌号'
    }
  },
  {
    field: 'vin',
    label: '车架号',
    component: 'Input',
    componentProps: {
      placeholder: '请输入车架号'
    }
  },
  {
    field: 'assetCode',
    label: '固定资产编码',
    component: 'Input',
    componentProps: {
      placeholder: '请输入固定资产编码'
    }
  },
  {
    field: 'brand',
    label: '品牌',
    component: 'Select',
    componentProps: {
      placeholder: '请选择品牌',
      options: brandOptions,
      on: {
        change: (value?: string) => {
          void updateSeriesOptions(value)
        },
        clear: () => {
          void updateSeriesOptions()
        }
      }
    }
  },
  {
    field: 'series',
    label: '车系',
    component: 'Select',
    componentProps: {
      placeholder: '请选择车系',
      disabled: true,
      options: []
    }
  },
  {
    field: 'model',
    label: '配置款',
    component: 'Select',
    componentProps: {
      placeholder: '请选择配置款',
      options: modelOptions
    }
  },
  {
    field: 'status',
    label: '车辆状态',
    component: 'Select',
    componentProps: {
      placeholder: '请选择车辆状态',
      options: statusOptions
    }
  },
  {
    field: 'leaseCompany',
    label: '租赁单位',
    component: 'Select',
    componentProps: {
      placeholder: '请选择租赁单位',
      options: leaseCompanyOptions
    }
  }
])

const columns = reactive<TableColumn[]>([
  {
    field: 'plateNo',
    label: '车牌号',
    minWidth: 120,
    slots: {
      default: ({ row }) => (
        <ElButton type="primary" link>
          {row.plateNo}
        </ElButton>
      )
    }
  },
  { field: 'vin', label: '车架号', minWidth: 170 },
  {
    field: 'brandSeries',
    label: '品牌/车系',
    minWidth: 140,
    formatter: (row: VehicleRecord) => {
      const brand = brandOptions.find((item) => item.value === row.brand)?.label || row.brand
      const series =
        seriesOptionsMap[row.brand]?.find((item) => item.value === row.series)?.label || row.series
      return `${brand}/${series}`
    }
  },
  {
    field: 'model',
    label: '配置款',
    minWidth: 110,
    formatter: (_row, _column, value: string) =>
      modelOptions.find((item) => item.value === value)?.label || value
  },
  {
    field: 'status',
    label: '车辆状态',
    minWidth: 130,
    slots: {
      default: ({ row }) => (
        <div class="vehicle-status-cell">
          <span>{statusMap[row.status as VehicleStatus]}</span>
          {row.serviceStatus ? (
            <ElTag class="ml-6px" type="warning" effect="plain" round>
              {serviceStatusMap[row.serviceStatus as keyof typeof serviceStatusMap]}
            </ElTag>
          ) : null}
        </div>
      )
    }
  },
  {
    field: 'leaseCompany',
    label: '租赁单位',
    minWidth: 130,
    formatter: (_row, _column, value: string) =>
      leaseCompanyOptions.find((item) => item.value === value)?.label || value
  },
  { field: 'orderNo', label: '订单号', minWidth: 150 },
  { field: 'demandNo', label: '需求单号', minWidth: 150 },
  { field: 'belongCompany', label: '所属单位', minWidth: 140 },
  { field: 'assetCode', label: '固定资产编码', minWidth: 140 },
  {
    field: 'action',
    label: '操作',
    width: 90,
    fixed: 'right',
    slots: {
      default: ({ row }) => (
        <ElButton type="primary" link onClick={() => editVehicle(row as VehicleRecord)}>
          编辑
        </ElButton>
      )
    }
  }
])

const filteredData = computed(() => {
  const { plateNo, vin, assetCode, brand, series, model, status, leaseCompany } = unref(queryParams)

  return allData.filter((item) => {
    const matchPlateNo = plateNo ? item.plateNo.includes(plateNo) : true
    const matchVin = vin ? item.vin.includes(vin) : true
    const matchAssetCode = assetCode ? item.assetCode.includes(assetCode) : true
    const matchBrand = brand ? item.brand === brand : true
    const matchSeries = series ? item.series === series : true
    const matchModel = model ? item.model === model : true
    const matchStatus = status ? item.status === status : true
    const matchLeaseCompany = leaseCompany ? item.leaseCompany === leaseCompany : true

    return (
      matchPlateNo &&
      matchVin &&
      matchAssetCode &&
      matchBrand &&
      matchSeries &&
      matchModel &&
      matchStatus &&
      matchLeaseCompany
    )
  })
})

const { tableRegister, tableState, tableMethods } = useTable({
  immediate: true,
  fetchDataApi: async () => {
    const start = (tableState.currentPage.value - 1) * tableState.pageSize.value
    const end = start + tableState.pageSize.value
    const list = unref(filteredData).slice(start, end)

    return {
      list,
      total: unref(filteredData).length
    }
  }
})

const reloadTable = () => {
  tableMethods.getList()
}

const searchList = (params: VehicleQuery) => {
  queryParams.value = params
  tableState.currentPage.value = 1
  reloadTable()
}

const resetList = (params: VehicleQuery) => {
  queryParams.value = params
  tableState.currentPage.value = 1
  void updateSeriesOptions()
  reloadTable()
}

const createVehicle = () => {
  router.push('/asset/vehicle-create')
}

const importVehicle = () => {
  ElMessage.info('导入车辆')
}

const exportVehicle = () => {
  ElMessage.info('导出车辆')
}

const editVehicle = (row: VehicleRecord) => {
  router.push({
    path: '/asset/vehicle-create',
    query: {
      id: row.id
    }
  })
}
</script>

<template>
  <ContentWrap class="mb-12px">
    <Search
      :schema="searchSchema"
      :is-col="true"
      :column-count="3"
      label-width="100px"
      button-position="left"
      @register="searchRegister"
      @search="searchList"
      @reset="resetList"
    >
      <template #action>
        <BaseButton @click="createVehicle">新建</BaseButton>
        <BaseButton @click="importVehicle">导入</BaseButton>
        <BaseButton @click="exportVehicle">导出</BaseButton>
      </template>
    </Search>
  </ContentWrap>

  <ContentWrap>
    <Table
      v-model:current-page="tableState.currentPage.value"
      v-model:page-size="tableState.pageSize.value"
      row-key="id"
      :columns="columns"
      :data="tableState.dataList.value"
      :loading="tableState.loading.value"
      :pagination="{ total: tableState.total.value }"
      show-action
      @register="tableRegister"
      @refresh="reloadTable"
    />
  </ContentWrap>
</template>

<style lang="scss" scoped>
.vehicle-status-cell {
  display: inline-flex;
  align-items: center;
}
</style>
