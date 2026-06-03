<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import type { EChartsOption } from 'echarts'
import { ElSelect, ElOption } from 'element-plus'
import { ArrowDown, ArrowUp, Calendar, Van } from '@element-plus/icons-vue'
import echarts from '@/plugins/echarts'
import overviewVehicleIcon from '@/assets/svgs/dashboard/overview_vehicle.svg?url'
import overviewDocumentIcon from '@/assets/svgs/dashboard/overview_document.svg?url'
import pendingConfirmIcon from '@/assets/svgs/dashboard/pending_confirm.svg?url'
import pendingDispatchIcon from '@/assets/svgs/dashboard/pending_dispatch.svg?url'
import pendingSignIcon from '@/assets/svgs/dashboard/pending_sign.svg?url'

interface LeaseUnitOption {
  label: string
  value: string
}

interface OverviewMetric {
  label: string
  value: string
  suffix?: string
  extra?: string
  trend: string
  trendType: 'up' | 'down'
  icon: 'vehicle' | 'document'
}

interface PendingStep {
  label: string
  count: number
  icon: 'document' | 'location' | 'edit' | 'vehicle' | 'return'
  warning?: string
}

interface ReminderItem {
  label: string
  count: number
}

interface DashboardData {
  metrics: OverviewMetric[]
  pendingSteps: PendingStep[]
  reminders: ReminderItem[]
  purchaseVehicleCount: number
  disposalVehicleCount: number
  trend: {
    income: number[]
    cost: number[]
    profit: number[]
  }
  vehicleStatus: Array<{ name: string; value: number }>
  costStructure: Array<{ name: string; value: number }>
  customerRanking: Array<{ name: string; value: number }>
}

type ChartKey = 'trend' | 'vehicleStatus' | 'costStructure' | 'customerRanking'
type DashboardChart = ReturnType<typeof echarts.init>
type MetricAnimationMap = Record<string, string>

const leaseUnitOptions: LeaseUnitOption[] = [
  { label: '全部租赁单位', value: 'all' },
  { label: '华北租赁单位', value: 'north' },
  { label: '华东租赁单位', value: 'east' },
  { label: '华南租赁单位', value: 'south' }
]

const monthLabels = [
  '1月',
  '2月',
  '3月',
  '4月',
  '5月',
  '6月',
  '7月',
  '8月',
  '9月',
  '10月',
  '11月',
  '12月'
]

const dashboardDataMap: Record<string, DashboardData> = {
  all: {
    metrics: [
      {
        label: '车辆总数',
        value: '124',
        suffix: '辆',
        trend: '0.1%',
        trendType: 'down',
        icon: 'vehicle'
      },
      {
        label: '出租率',
        value: '95.2',
        suffix: '%',
        trend: '+2.1%',
        trendType: 'up',
        icon: 'document'
      },
      {
        label: '当月收入',
        value: '122,000',
        extra: '日均 4,350',
        trend: '+2.1%',
        trendType: 'up',
        icon: 'document'
      },
      {
        label: '当月成本',
        value: '4',
        suffix: '单',
        trend: '0.1%',
        trendType: 'down',
        icon: 'document'
      }
    ],
    pendingSteps: [
      { label: '待确认需求', count: 3, icon: 'document' },
      { label: '待派车', count: 3, icon: 'location', warning: '缺口30辆' },
      { label: '待签约', count: 5, icon: 'edit' },
      { label: '待交车', count: 5, icon: 'vehicle' },
      { label: '待还车', count: 5, icon: 'return', warning: '30天内到期' }
    ],
    reminders: [
      { label: '年检提醒', count: 5 },
      { label: '定期保养提醒', count: 5 },
      { label: '交强险提醒', count: 5 },
      { label: '商业险提醒', count: 5 }
    ],
    purchaseVehicleCount: 12,
    disposalVehicleCount: 24,
    trend: {
      income: [130, 175, 205, 208, 195, 173, 151, 168, 206, 211, 212, 223],
      cost: [112, 136, 143, 137, 128, 126, 133, 135, 116, 113, 135, 176],
      profit: [80, 83, 87, 93, 103, 107, 101, 86, 70, 64, 94, 132]
    },
    vehicleStatus: [
      { name: '待租赁', value: 36 },
      { name: '已预占', value: 28 },
      { name: '租赁中', value: 24 },
      { name: '待处理', value: 24 },
      { name: '已处置', value: 12 }
    ],
    costStructure: [
      { name: '折旧', value: 32 },
      { name: '保险费', value: 20 },
      { name: '维修保险费', value: 19 },
      { name: '加油费', value: 16 },
      { name: '充电费', value: 8 },
      { name: 'ETC费用', value: 9 },
      { name: '其他费用', value: 14 }
    ],
    customerRanking: [
      { name: 'XXXXXX企业', value: 100 },
      { name: 'XX企业', value: 60 },
      { name: 'XX企业', value: 50 },
      { name: 'XX企业', value: 50 },
      { name: 'XXXXXX企业', value: 50 }
    ]
  },
  north: {
    metrics: [
      {
        label: '车辆总数',
        value: '46',
        suffix: '辆',
        trend: '0.3%',
        trendType: 'down',
        icon: 'vehicle'
      },
      {
        label: '出租率',
        value: '93.8',
        suffix: '%',
        trend: '+1.6%',
        trendType: 'up',
        icon: 'document'
      },
      {
        label: '当月收入',
        value: '43,600',
        extra: '日均 1,520',
        trend: '+1.9%',
        trendType: 'up',
        icon: 'document'
      },
      {
        label: '当月成本',
        value: '2',
        suffix: '单',
        trend: '0.2%',
        trendType: 'down',
        icon: 'document'
      }
    ],
    pendingSteps: [
      { label: '待确认需求', count: 1, icon: 'document' },
      { label: '待派车', count: 2, icon: 'location', warning: '缺口8辆' },
      { label: '待签约', count: 2, icon: 'edit' },
      { label: '待交车', count: 1, icon: 'vehicle' },
      { label: '待还车', count: 2, icon: 'return', warning: '30天内到期' }
    ],
    reminders: [
      { label: '年检提醒', count: 2 },
      { label: '定期保养提醒', count: 1 },
      { label: '交强险提醒', count: 2 },
      { label: '商业险提醒', count: 1 }
    ],
    purchaseVehicleCount: 4,
    disposalVehicleCount: 8,
    trend: {
      income: [46, 58, 72, 75, 70, 64, 55, 60, 76, 82, 80, 88],
      cost: [38, 46, 51, 49, 45, 44, 47, 48, 42, 39, 50, 66],
      profit: [24, 26, 29, 33, 37, 39, 34, 29, 24, 22, 33, 48]
    },
    vehicleStatus: [
      { name: '待租赁', value: 14 },
      { name: '已预占', value: 9 },
      { name: '租赁中', value: 10 },
      { name: '待处理', value: 7 },
      { name: '已处置', value: 6 }
    ],
    costStructure: [
      { name: '折旧', value: 12 },
      { name: '保险费', value: 8 },
      { name: '维修保险费', value: 6 },
      { name: '加油费', value: 5 },
      { name: '充电费', value: 3 },
      { name: 'ETC费用', value: 4 },
      { name: '其他费用', value: 5 }
    ],
    customerRanking: [
      { name: '北方能源企业', value: 42 },
      { name: '冀北物流', value: 31 },
      { name: '京津商贸', value: 28 },
      { name: '北区建设', value: 24 },
      { name: '燕山服务', value: 22 }
    ]
  },
  east: {
    metrics: [
      {
        label: '车辆总数',
        value: '38',
        suffix: '辆',
        trend: '0.2%',
        trendType: 'down',
        icon: 'vehicle'
      },
      {
        label: '出租率',
        value: '96.1',
        suffix: '%',
        trend: '+2.4%',
        trendType: 'up',
        icon: 'document'
      },
      {
        label: '当月收入',
        value: '39,800',
        extra: '日均 1,360',
        trend: '+2.5%',
        trendType: 'up',
        icon: 'document'
      },
      {
        label: '当月成本',
        value: '1',
        suffix: '单',
        trend: '0.1%',
        trendType: 'down',
        icon: 'document'
      }
    ],
    pendingSteps: [
      { label: '待确认需求', count: 1, icon: 'document' },
      { label: '待派车', count: 1, icon: 'location', warning: '缺口12辆' },
      { label: '待签约', count: 2, icon: 'edit' },
      { label: '待交车', count: 3, icon: 'vehicle' },
      { label: '待还车', count: 2, icon: 'return', warning: '30天内到期' }
    ],
    reminders: [
      { label: '年检提醒', count: 1 },
      { label: '定期保养提醒', count: 2 },
      { label: '交强险提醒', count: 1 },
      { label: '商业险提醒', count: 2 }
    ],
    purchaseVehicleCount: 5,
    disposalVehicleCount: 7,
    trend: {
      income: [38, 55, 68, 66, 63, 58, 52, 59, 71, 74, 76, 84],
      cost: [34, 43, 48, 46, 42, 41, 45, 44, 40, 38, 47, 63],
      profit: [21, 24, 27, 30, 33, 35, 31, 27, 22, 20, 29, 44]
    },
    vehicleStatus: [
      { name: '待租赁', value: 10 },
      { name: '已预占', value: 8 },
      { name: '租赁中', value: 9 },
      { name: '待处理', value: 7 },
      { name: '已处置', value: 4 }
    ],
    costStructure: [
      { name: '折旧', value: 10 },
      { name: '保险费', value: 7 },
      { name: '维修保险费', value: 7 },
      { name: '加油费', value: 4 },
      { name: '充电费', value: 4 },
      { name: 'ETC费用', value: 2 },
      { name: '其他费用', value: 6 }
    ],
    customerRanking: [
      { name: '东方贸易', value: 38 },
      { name: '海港供应链', value: 32 },
      { name: '浦江制造', value: 25 },
      { name: '苏南科技', value: 23 },
      { name: '杭湾服务', value: 20 }
    ]
  },
  south: {
    metrics: [
      {
        label: '车辆总数',
        value: '40',
        suffix: '辆',
        trend: '0.1%',
        trendType: 'down',
        icon: 'vehicle'
      },
      {
        label: '出租率',
        value: '95.9',
        suffix: '%',
        trend: '+2.0%',
        trendType: 'up',
        icon: 'document'
      },
      {
        label: '当月收入',
        value: '38,600',
        extra: '日均 1,470',
        trend: '+2.0%',
        trendType: 'up',
        icon: 'document'
      },
      {
        label: '当月成本',
        value: '1',
        suffix: '单',
        trend: '0.1%',
        trendType: 'down',
        icon: 'document'
      }
    ],
    pendingSteps: [
      { label: '待确认需求', count: 1, icon: 'document' },
      { label: '待派车', count: 0, icon: 'location', warning: '缺口10辆' },
      { label: '待签约', count: 1, icon: 'edit' },
      { label: '待交车', count: 1, icon: 'vehicle' },
      { label: '待还车', count: 1, icon: 'return', warning: '30天内到期' }
    ],
    reminders: [
      { label: '年检提醒', count: 2 },
      { label: '定期保养提醒', count: 2 },
      { label: '交强险提醒', count: 2 },
      { label: '商业险提醒', count: 2 }
    ],
    purchaseVehicleCount: 3,
    disposalVehicleCount: 9,
    trend: {
      income: [36, 52, 65, 67, 62, 56, 48, 54, 69, 72, 76, 80],
      cost: [32, 41, 44, 42, 40, 38, 41, 43, 38, 36, 45, 58],
      profit: [18, 22, 25, 28, 31, 33, 29, 25, 20, 18, 28, 40]
    },
    vehicleStatus: [
      { name: '待租赁', value: 12 },
      { name: '已预占', value: 11 },
      { name: '租赁中', value: 5 },
      { name: '待处理', value: 10 },
      { name: '已处置', value: 2 }
    ],
    costStructure: [
      { name: '折旧', value: 10 },
      { name: '保险费', value: 5 },
      { name: '维修保险费', value: 6 },
      { name: '加油费', value: 7 },
      { name: '充电费', value: 1 },
      { name: 'ETC费用', value: 3 },
      { name: '其他费用', value: 8 }
    ],
    customerRanking: [
      { name: '南方城配', value: 36 },
      { name: '湾区物流', value: 31 },
      { name: '岭南工程', value: 26 },
      { name: '珠江商旅', value: 24 },
      { name: '海湾物业', value: 18 }
    ]
  }
}

const chartColors = ['#0b8df5', '#7658d8', '#14bfd8', '#44d75f', '#1158d5', '#ffd643', '#10d4a4']
const selectedLeaseUnit = ref('all')
const selectedStatisticsRange = ref('day')
const trendChartRef = ref<HTMLDivElement>()
const vehicleStatusChartRef = ref<HTMLDivElement>()
const costStructureChartRef = ref<HTMLDivElement>()
const customerRankingChartRef = ref<HTMLDivElement>()
const chartInstances = shallowRef<Partial<Record<ChartKey, DashboardChart>>>({})
const animatedMetricValues = ref<MetricAnimationMap>({})
let metricAnimationFrame: number | undefined

const currentDashboardData = computed(() => dashboardDataMap[selectedLeaseUnit.value])
const metricCards = computed(() => currentDashboardData.value.metrics)
const pendingSteps = computed(() => currentDashboardData.value.pendingSteps)
const reminders = computed(() => currentDashboardData.value.reminders)

const pendingSvgIconMap: Partial<Record<PendingStep['icon'], string>> = {
  document: pendingConfirmIcon,
  location: pendingDispatchIcon,
  edit: pendingSignIcon
}

const pendingFallbackIconMap = {
  vehicle: Van,
  return: Calendar
}

const getPendingIconUrl = (icon: PendingStep['icon']) => {
  return pendingSvgIconMap[icon]
}

const getPendingFallbackIcon = (icon: PendingStep['icon']) => {
  return pendingFallbackIconMap[icon as keyof typeof pendingFallbackIconMap]
}

const getMetricIconUrl = (icon: OverviewMetric['icon']) => {
  return icon === 'vehicle' ? overviewVehicleIcon : overviewDocumentIcon
}

const getMetricNumericValue = (value: string) => {
  return Number(value.replace(/,/g, '')) || 0
}

const getMetricDecimalPlaces = (value: string) => {
  return value.includes('.') ? value.split('.')[1].length : 0
}

const formatMetricValue = (value: number, decimalPlaces: number, useThousands: boolean) => {
  const fixedValue = decimalPlaces > 0 ? value.toFixed(decimalPlaces) : Math.round(value).toString()

  if (!useThousands) {
    return fixedValue
  }

  const [integerPart, decimalPart] = fixedValue.split('.')
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger
}

const runMetricAnimation = () => {
  if (metricAnimationFrame) {
    window.cancelAnimationFrame(metricAnimationFrame)
  }

  const animationDuration = 900
  const animationStart = performance.now()
  const animationMetrics = metricCards.value.map((item) => ({
    label: item.label,
    target: getMetricNumericValue(item.value),
    decimalPlaces: getMetricDecimalPlaces(item.value),
    useThousands: item.value.includes(',')
  }))

  const updateFrame = (currentTime: number) => {
    const progress = Math.min((currentTime - animationStart) / animationDuration, 1)
    const easedProgress = 1 - Math.pow(1 - progress, 3)

    animatedMetricValues.value = animationMetrics.reduce<MetricAnimationMap>((result, item) => {
      result[item.label] = formatMetricValue(
        item.target * easedProgress,
        item.decimalPlaces,
        item.useThousands
      )
      return result
    }, {})

    if (progress < 1) {
      metricAnimationFrame = window.requestAnimationFrame(updateFrame)
    }
  }

  metricAnimationFrame = window.requestAnimationFrame(updateFrame)
}

const createTrendOption = (): EChartsOption => {
  const { trend } = currentDashboardData.value

  return {
    color: ['#087dff', '#00c9d7', '#ffd364'],
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#e5e9f2',
      textStyle: {
        color: '#2f3542'
      }
    },
    legend: {
      top: 16,
      left: 'center',
      itemWidth: 9,
      itemHeight: 9,
      icon: 'circle',
      textStyle: {
        color: '#3c4658',
        fontSize: 12
      }
    },
    grid: {
      left: 19,
      right: 22,
      top: 68,
      bottom: 0,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: monthLabels,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#e8edf5' } },
      axisLabel: { color: '#8a94a3', margin: 4 }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 250,
      interval: 50,
      splitLine: {
        lineStyle: {
          color: '#edf1f7',
          type: 'dashed'
        }
      },
      axisLabel: { color: '#8a94a3' }
    },
    series: [
      {
        name: '收入',
        type: 'line',
        smooth: true,
        data: trend.income,
        lineStyle: { width: 2 },
        symbol: 'none',
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(8,125,255,0.16)' },
              { offset: 1, color: 'rgba(8,125,255,0.02)' }
            ]
          }
        }
      },
      {
        name: '成本',
        type: 'line',
        smooth: true,
        data: trend.cost,
        lineStyle: { width: 2 },
        symbol: 'none',
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0,201,215,0.16)' },
              { offset: 1, color: 'rgba(0,201,215,0.02)' }
            ]
          }
        }
      },
      {
        name: '利润',
        type: 'line',
        smooth: true,
        data: trend.profit,
        lineStyle: {
          width: 2,
          color: '#ffd364'
        },
        symbol: 'none',
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(255,211,100,0.12)' },
              { offset: 1, color: 'rgba(255,235,52,0)' }
            ]
          }
        }
      }
    ]
  }
}

const createRingOption = (data: Array<{ name: string; value: number }>): EChartsOption => ({
  color: chartColors,
  tooltip: {
    trigger: 'item'
  },
  legend: {
    orient: 'vertical',
    right: 0,
    top: 'center',
    itemWidth: 8,
    itemHeight: 8,
    icon: 'circle',
    textStyle: {
      color: '#5e6675',
      fontSize: 12
    }
  },
  series: [
    {
      type: 'pie',
      radius: ['56%', '76%'],
      center: ['34%', '56%'],
      avoidLabelOverlap: true,
      label: { show: false },
      labelLine: { show: false },
      data
    }
  ]
})

const createCustomerRankingOption = (): EChartsOption => {
  const rankingData = currentDashboardData.value.customerRanking

  return {
    grid: {
      left: 92,
      right: 18,
      top: 18,
      bottom: 0,
      containLabel: false
    },
    xAxis: {
      type: 'value',
      max: Math.max(...rankingData.map((item) => item.value), 1),
      show: false
    },
    yAxis: {
      type: 'category',
      inverse: true,
      data: rankingData.map((item) => item.name),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#4f596b',
        fontSize: 12,
        overflow: 'truncate',
        width: 78
      }
    },
    series: [
      {
        type: 'bar',
        data: rankingData.map(() => Math.max(...rankingData.map((item) => item.value), 1)),
        barWidth: 14,
        silent: true,
        z: 1,
        itemStyle: {
          color: '#f0f2f5',
          borderRadius: [8, 8, 8, 8]
        }
      },
      {
        type: 'bar',
        data: rankingData.map((item) => item.value),
        barWidth: 14,
        barGap: '-100%',
        z: 2,
        itemStyle: {
          color: '#087dff',
          borderRadius: [8, 8, 8, 8]
        },
        label: {
          show: true,
          position: 'insideRight',
          color: '#fff',
          fontSize: 11,
          formatter: '{c}万'
        }
      }
    ]
  }
}

const initCharts = () => {
  chartInstances.value = {
    trend: trendChartRef.value ? echarts.init(trendChartRef.value) : undefined,
    vehicleStatus: vehicleStatusChartRef.value
      ? echarts.init(vehicleStatusChartRef.value)
      : undefined,
    costStructure: costStructureChartRef.value
      ? echarts.init(costStructureChartRef.value)
      : undefined,
    customerRanking: customerRankingChartRef.value
      ? echarts.init(customerRankingChartRef.value)
      : undefined
  }
  updateCharts()
}

const updateCharts = () => {
  chartInstances.value.trend?.setOption(createTrendOption(), true)
  chartInstances.value.vehicleStatus?.setOption(
    createRingOption(currentDashboardData.value.vehicleStatus),
    true
  )
  chartInstances.value.costStructure?.setOption(
    createRingOption(currentDashboardData.value.costStructure),
    true
  )
  chartInstances.value.customerRanking?.setOption(createCustomerRankingOption(), true)
}

const resizeCharts = () => {
  Object.values(chartInstances.value).forEach((chart) => chart?.resize())
}

watch(selectedLeaseUnit, () => {
  runMetricAnimation()
  updateCharts()
  void nextTick(resizeCharts)
})

onMounted(() => {
  runMetricAnimation()
  initCharts()
  window.addEventListener('resize', resizeCharts)
})

onBeforeUnmount(() => {
  if (metricAnimationFrame) {
    window.cancelAnimationFrame(metricAnimationFrame)
  }
  window.removeEventListener('resize', resizeCharts)
  Object.values(chartInstances.value).forEach((chart) => chart?.dispose())
})
</script>

<template>
  <div class="business-dashboard">
    <section class="dashboard-panel dashboard-overview">
      <div class="dashboard-header">
        <h3 class="panel-title">经营概览</h3>
        <div class="dashboard-filters">
          <div class="lease-filter">
            <span>租赁单位</span>
            <ElSelect v-model="selectedLeaseUnit" placeholder="请选择租赁单位">
              <ElOption
                v-for="item in leaseUnitOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </div>
          <div class="range-filter">
            <span>统计区间</span>
            <button
              v-for="item in [
                { label: '按日', value: 'day' },
                { label: '按月', value: 'month' },
                { label: '按单', value: 'order' },
                { label: '按年', value: 'year' },
                { label: '自定义', value: 'custom' }
              ]"
              :key="item.value"
              :class="{ 'is-active': selectedStatisticsRange === item.value }"
              type="button"
              @click="selectedStatisticsRange = item.value"
            >
              {{ item.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="metric-grid">
        <article v-for="item in metricCards" :key="item.label" class="metric-card">
          <div class="metric-icon">
            <img :src="getMetricIconUrl(item.icon)" alt="" />
          </div>
          <div class="metric-content">
            <span class="metric-label">{{ item.label }}</span>
            <strong
              >{{ animatedMetricValues[item.label] || item.value
              }}<em v-if="item.suffix">{{ item.suffix }}</em></strong
            >
            <span class="metric-footer">
              <span v-if="item.extra">{{ item.extra }}</span>
              <span v-else>较上月</span>
              <span :class="['metric-trend', `is-${item.trendType}`]">
                {{ item.trend }}
                <component :is="item.trendType === 'up' ? ArrowUp : ArrowDown" />
              </span>
            </span>
          </div>
        </article>
      </div>
    </section>

    <section class="dashboard-main">
      <div class="dashboard-left">
        <section class="dashboard-panel pending-panel">
          <h3 class="panel-title">租赁待办</h3>
          <div class="pending-steps">
            <article v-for="(item, index) in pendingSteps" :key="item.label" class="pending-step">
              <span v-if="index > 0" class="pending-line"></span>
              <span :class="['pending-icon', { 'is-fallback': !getPendingIconUrl(item.icon) }]">
                <img
                  v-if="getPendingIconUrl(item.icon)"
                  :src="getPendingIconUrl(item.icon)"
                  alt=""
                />
                <component :is="getPendingFallbackIcon(item.icon)" v-else />
              </span>
              <span class="pending-label">{{ item.label }}</span>
              <strong>{{ item.count }}<em>辆</em></strong>
              <span v-if="item.warning" class="pending-warning">{{ item.warning }}</span>
            </article>
          </div>
        </section>

        <section class="dashboard-panel reminder-panel">
          <h3 class="panel-title">车务提醒</h3>
          <div class="reminder-grid">
            <article v-for="item in reminders" :key="item.label" class="reminder-card">
              <span>{{ item.label }}</span>
              <strong>{{ item.count }}</strong>
            </article>
          </div>
        </section>
      </div>

      <section class="dashboard-panel trend-panel">
        <h3 class="panel-title">收入成本利润趋势</h3>
        <div ref="trendChartRef" class="trend-chart"></div>
      </section>
    </section>

    <section class="dashboard-bottom">
      <section class="dashboard-panel chart-card">
        <h3 class="panel-title">车态分布</h3>
        <div ref="vehicleStatusChartRef" class="ring-chart"></div>
      </section>

      <section class="dashboard-panel chart-card">
        <h3 class="panel-title">成本结构</h3>
        <div ref="costStructureChartRef" class="ring-chart"></div>
      </section>

      <section class="dashboard-panel ranking-card">
        <h3 class="panel-title">客户收入排行</h3>
        <div ref="customerRankingChartRef" class="ranking-chart"></div>
      </section>

      <section class="dashboard-panel purchase-panel">
        <h3 class="panel-title">采购与处置</h3>
        <div class="purchase-list">
          <article>
            <span>购置车辆</span>
            <strong>{{ currentDashboardData.purchaseVehicleCount }}<em>辆</em></strong>
          </article>
          <article>
            <span>处置车辆</span>
            <strong>{{ currentDashboardData.disposalVehicleCount }}<em>辆</em></strong>
          </article>
        </div>
      </section>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.business-dashboard {
  min-height: 100%;
  padding: 6px;
  color: var(--el-text-color-primary);
  background: #f5f7fb;
}

.dashboard-panel {
  background: var(--el-bg-color);
  border-radius: 6px;
}

.dashboard-overview {
  padding: 16px 20px 20px;
}

.dashboard-header,
.dashboard-filters,
.lease-filter,
.range-filter,
.metric-card,
.metric-footer,
.pending-step,
.reminder-card,
.purchase-list article {
  display: flex;
  align-items: center;
}

.dashboard-header {
  justify-content: space-between;
  height: 28px;
  margin-bottom: 16px;
}

.panel-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  line-height: 22px;
  color: #1f2733;
}

.dashboard-filters {
  gap: 20px;
  font-size: 13px;
  color: #2f3542;
}

.lease-filter {
  gap: 8px;
  line-height: 28px;

  :deep(.el-select) {
    width: 160px;
  }

  :deep(.el-input__wrapper) {
    min-height: 28px;
    padding: 0 10px;
    border-radius: 4px;
  }

  :deep(.el-select__placeholder),
  :deep(.el-input__inner) {
    font-size: 12px;
  }
}

.range-filter {
  gap: 9px;
  line-height: 28px;

  button {
    padding: 0;
    color: #9098a8;
    cursor: pointer;
    background: transparent;
    border: 0;

    &.is-active {
      color: var(--el-color-primary);
      font-weight: 700;
    }
  }
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
}

.metric-card {
  height: 100px;
  padding: 0 20px;
  background: #f5f7fa;
  border-radius: 4px;
}

.metric-icon,
.pending-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.metric-icon {
  width: 54px;
  height: 54px;
  margin-right: 16px;
  flex: 0 0 54px;

  img {
    width: 54px;
    height: 54px;
  }
}

.metric-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.metric-label {
  margin-bottom: 4px;
  color: #606266;
  font-size: 16px;
  line-height: 22px;
}

.metric-content strong {
  color: #292e38;
  font-size: 26px;
  line-height: 1.2;
}

.metric-content em {
  margin-left: 1px;
  font-size: 18px;
  font-style: normal;
}

.metric-footer {
  gap: 8px;
  margin-top: 4px;
  color: #7f8794;
  font-size: 12px;
}

.metric-trend {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-weight: 700;

  svg {
    width: 12px;
    height: 12px;
  }

  &.is-up {
    color: #ff0019;
  }

  &.is-down {
    color: #00bd73;
  }
}

.dashboard-main {
  display: grid;
  grid-template-columns: minmax(410px, 43%) minmax(0, 1fr);
  gap: 12px;
  margin-top: 12px;
}

.dashboard-left {
  display: grid;
  grid-template-rows: 1fr 0.82fr;
  gap: 12px;
}

.pending-panel,
.reminder-panel,
.trend-panel,
.chart-card,
.ranking-card,
.purchase-panel {
  padding: 18px 20px;
}

.trend-panel,
.chart-card,
.ranking-card {
  display: flex;
  flex-direction: column;
}

.pending-steps {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  margin-top: 16px;
}

.pending-step {
  position: relative;
  flex-direction: column;
  min-height: 94px;
  color: #222936;
}

.pending-line {
  position: absolute;
  top: 20px;
  right: 50%;
  width: 100%;
  height: 4px;
  background: #e8edf3;
}

.pending-icon {
  position: relative;
  z-index: 1;
  width: 40px;
  height: 40px;

  img {
    width: 40px;
    height: 40px;
  }

  &.is-fallback {
    color: #fff;
    font-size: 20px;
    background: var(--el-color-primary);
    border-radius: 50%;
  }
}

.pending-label {
  margin-top: 10px;
  color: #1f2733;
  font-size: 12px;
  line-height: 17px;
}

.pending-step strong {
  margin-top: 6px;
  color: var(--el-color-primary);
  font-size: 14px;
  line-height: 18px;
}

.pending-step em {
  margin-left: 4px;
  color: #8b93a1;
  font-size: 11px;
  font-style: normal;
  font-weight: 400;
}

.pending-warning {
  height: 18px;
  margin-top: 4px;
  padding: 0;
  color: #ff8a00;
  font-size: 12px;
  line-height: 18px;
}

.reminder-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 28px;
}

.reminder-card {
  align-items: flex-start;
  justify-content: flex-start;
  height: 92px;
  padding: 18px 12px 0;
  flex-direction: column;
  background: #f5f7fa;
  border-radius: 6px;
}

.reminder-card span {
  color: #606266;
  font-size: 14px;
}

.reminder-card strong {
  margin-top: 12px;
  color: #292e38;
  font-size: 24px;
  line-height: 28px;
}

.trend-chart {
  height: 314px;
  margin: -8px -6px -20px;
}

.dashboard-bottom {
  display: grid;
  grid-template-columns: 1.04fr 1.04fr 1.08fr 0.96fr;
  gap: 12px;
  margin-top: 12px;
}

.ring-chart {
  height: 218px;
  margin: -10px -10px -14px;
}

.ranking-card,
.purchase-panel {
  min-height: 246px;
}

.ranking-chart {
  height: 218px;
  margin: -10px -8px -14px;
}

.purchase-list {
  display: grid;
  gap: 18px;
  margin-top: 24px;
}

.purchase-list article {
  justify-content: space-between;
  height: 80px;
  padding: 0 22px;
  background: #f5f7fa;
  border-radius: 6px;
}

.purchase-list span {
  color: #606b7d;
  font-size: 14px;
}

.purchase-list strong {
  color: #292e38;
  font-size: 24px;
}

.purchase-list em {
  margin-left: 2px;
  color: #292e38;
  font-size: 14px;
  font-style: normal;
}

@media (max-width: 1280px) {
  .dashboard-header,
  .dashboard-filters {
    align-items: flex-start;
    flex-direction: column;
  }

  .dashboard-filters {
    gap: 12px;
  }

  .metric-grid,
  .dashboard-bottom {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-main {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .metric-grid,
  .dashboard-bottom,
  .reminder-grid,
  .pending-steps {
    grid-template-columns: 1fr;
  }

  .metric-card {
    padding: 0 24px;
  }

  .pending-line {
    display: none;
  }

  .range-filter {
    flex-wrap: wrap;
  }
}
</style>
