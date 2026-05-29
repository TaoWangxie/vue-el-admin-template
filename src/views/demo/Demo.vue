<script setup lang="tsx">
import { computed, reactive, ref, unref } from 'vue'
import { ElButton, ElMessage, ElMessageBox, ElTag } from 'element-plus'
import { useRouter } from 'vue-router'
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/Search'
import { Table, type TableColumn } from '@/components/Table'
import { useTable } from '@/hooks/web/useTable'
import type { FormSchema } from '@/components/Form'

type DemoStatus = 'enabled' | 'disabled' | 'pending'

interface DemoRecord {
  id: number
  name: string
  owner: string
  status: DemoStatus
  amount: number
  createTime: string
}

interface DemoQuery {
  keyword?: string
  owner?: string
  status?: DemoStatus
  createTime?: string[]
}

const statusOptions = [
  { label: '启用', value: 'enabled' },
  { label: '禁用', value: 'disabled' },
  { label: '待处理', value: 'pending' }
]

const statusMap: Record<DemoStatus, { label: string; type: 'success' | 'danger' | 'warning' }> = {
  enabled: { label: '启用', type: 'success' },
  disabled: { label: '禁用', type: 'danger' },
  pending: { label: '待处理', type: 'warning' }
}

const allData: DemoRecord[] = [
  {
    id: 10001,
    name: '企业门户搭建',
    owner: '张三',
    status: 'enabled',
    amount: 12800,
    createTime: '2026-05-01'
  },
  {
    id: 10002,
    name: '审批流程配置',
    owner: '李四',
    status: 'pending',
    amount: 8600,
    createTime: '2026-05-03'
  }
]

const queryParams = ref<DemoQuery>({})

const router = useRouter()

const searchSchema = reactive<FormSchema[]>([
  {
    field: 'keyword',
    label: '关键词',
    component: 'Input',
    componentProps: {
      placeholder: '请输入项目名称'
    }
  },
  {
    field: 'owner',
    label: '负责人',
    component: 'Input',
    componentProps: {
      placeholder: '请输入负责人'
    }
  },
  {
    field: 'status',
    label: '状态',
    component: 'Select',
    componentProps: {
      placeholder: '全部状态',
      clearable: true,
      options: statusOptions
    }
  },
  {
    field: 'createTime',
    label: '创建时间',
    component: 'DatePicker',
    componentProps: {
      type: 'daterange',
      valueFormat: 'YYYY-MM-DD',
      startPlaceholder: '开始日期',
      endPlaceholder: '结束日期'
    }
  }
])

const columns = reactive<TableColumn[]>([
  { field: 'index', label: '序号', type: 'index', width: 70 },
  { field: 'name', label: '项目名称', minWidth: 160 },
  { field: 'owner', label: '负责人', width: 110 },
  {
    field: 'status',
    label: '状态',
    width: 100,
    slots: {
      default: ({ row }) => {
        const status = statusMap[row.status as DemoStatus]
        return <ElTag type={status.type}>{status.label}</ElTag>
      }
    }
  },
  {
    field: 'amount',
    label: '金额',
    width: 120,
    align: 'right',
    formatter: (_row, _column, value: number) => `¥${value.toLocaleString()}`
  },
  { field: 'createTime', label: '创建时间', width: 140 },
  {
    field: 'action',
    label: '操作',
    width: 190,
    fixed: 'right',
    slots: {
      default: ({ row }) => (
        <div class="flex items-center gap-8px">
          <ElButton type="primary" link onClick={() => openDetailPage(row as DemoRecord)}>
            详情
          </ElButton>
          <ElButton type="primary" link onClick={() => openCreatePage(row as DemoRecord)}>
            编辑
          </ElButton>
          <ElButton type="danger" link onClick={() => deleteRecord(row as DemoRecord)}>
            删除
          </ElButton>
        </div>
      )
    }
  }
])

const filteredData = computed(() => {
  const { keyword, owner, status, createTime } = unref(queryParams)
  return allData.filter((item) => {
    const matchKeyword = keyword ? item.name.includes(keyword) : true
    const matchOwner = owner ? item.owner.includes(owner) : true
    const matchStatus = status ? item.status === status : true
    const matchCreateTime =
      createTime?.length === 2
        ? item.createTime >= createTime[0] && item.createTime <= createTime[1]
        : true

    return matchKeyword && matchOwner && matchStatus && matchCreateTime
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

const searchList = (params: DemoQuery) => {
  queryParams.value = params
  tableState.currentPage.value = 1
  reloadTable()
}

const resetList = (params: DemoQuery) => {
  queryParams.value = params
  tableState.currentPage.value = 1
  reloadTable()
}

const openCreatePage = (row?: DemoRecord) => {
  if (!router.hasRoute('DemoCreate')) {
    router.addRoute('Demo', {
      path: 'create',
      name: 'DemoCreate',
      component: () => import('@/views/demo/Create.vue'),
      meta: {
        title: '新建处置明细',
        hidden: true,
        canTo: true,
        followRoute: '/demo/index',
        activeMenu: '/demo/index'
      }
    })
  }
  router.push({
    path: '/demo/create',
    query: row ? { id: row.id } : undefined
  })
}

const openDetailPage = (row: DemoRecord) => {
  if (!router.hasRoute('DemoDetail')) {
    router.addRoute('Demo', {
      path: 'detail/:id?',
      name: 'DemoDetail',
      component: () => import('@/views/demo/Detail.vue'),
      meta: {
        title: '处置明细详情',
        hidden: true,
        canTo: true,
        followRoute: '/demo/index',
        activeMenu: '/demo/index'
      }
    })
  }
  router.push(`/demo/detail/${row.id}`)
}

const deleteRecord = async (row: DemoRecord) => {
  try {
    await ElMessageBox.confirm(`确认删除“${row.name}”吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }

  const deleteIndex = allData.findIndex((item) => item.id === row.id)

  if (deleteIndex > -1) {
    allData.splice(deleteIndex, 1)
    ElMessage.success('删除成功')
    reloadTable()
  }
}
</script>

<template>
  <ContentWrap class="mb-12px">
    <Search
      :schema="searchSchema"
      :is-col="true"
      :column-count="4"
      label-width="80px"
      @search="searchList"
      @reset="resetList"
    />
  </ContentWrap>

  <ContentWrap>
    <div class="mb-12px flex items-center justify-between">
      <div class="flex items-center gap-8px">
        <BaseButton type="primary" @click="openCreatePage()">新增</BaseButton>
      </div>
    </div>

    <Table
      v-model:current-page="tableState.currentPage.value"
      v-model:page-size="tableState.pageSize.value"
      row-key="id"
      :columns="columns"
      :data="tableState.dataList.value"
      :loading="tableState.loading.value"
      :pagination="{ total: tableState.total.value }"
      show-action
      stripe
      @register="tableRegister"
      @refresh="reloadTable"
    />
  </ContentWrap>
</template>
