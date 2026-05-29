<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { DetailSection } from '@/components/DetailSection'
import { DetailTabs, type DetailTabOption } from '@/components/DetailTabs'

const route = useRoute()

const detailId = computed(() => route.params.id as string | undefined)

const activeTab = ref<string>('vehicle')

const detailTabs: DetailTabOption[] = [
  { label: '车辆信息', value: 'vehicle' },
  { label: '车务时间线', value: 'timeline' },
  { label: '关联附件', value: 'attachment' },
  { label: '变更日志', value: 'log' }
]

const activeTabTitle = computed(() =>
  activeTab.value === 'vehicle'
    ? '车务信息'
    : detailTabs.find((tab) => tab.value === activeTab.value)?.label || ''
)
</script>

<template>
  <div class="detail-page">
    <DetailSection :title="activeTabTitle">
      <template #title-top>
        <DetailTabs v-model="activeTab" :options="detailTabs" />
      </template>

      <div class="detail-field">
        <span class="detail-field__label">车牌号：</span>
        <span class="detail-field__value"></span>
      </div>
      <div class="detail-field">
        <span class="detail-field__label">车架号：</span>
        <span class="detail-field__value">{{ detailId || '' }}</span>
      </div>
      <div class="detail-field">
        <span class="detail-field__label">配置款：</span>
        <span class="detail-field__value"></span>
      </div>
      <div class="detail-field">
        <span class="detail-field__label">申请单位：</span>
        <span class="detail-field__value">XX销售公司</span>
      </div>
    </DetailSection>

    <DetailSection title="处置结果">
      <div class="detail-field">
        <span class="detail-field__label">处置日期：</span>
        <span class="detail-field__value"></span>
      </div>
      <div class="detail-field">
        <span class="detail-field__label">处置金额：</span>
        <span class="detail-field__value"></span>
      </div>
      <div class="detail-field detail-field--full">
        <span class="detail-field__label">处置说明：</span>
        <span class="detail-field__value"></span>
      </div>
      <div class="detail-field detail-field--full">
        <span class="detail-field__label">处置文件：</span>
        <span class="detail-field__value"></span>
      </div>
    </DetailSection>
  </div>
</template>

<style lang="scss" scoped>
.detail-page {
  min-height: calc(100vh - var(--top-tool-height) - var(--tags-view-height) - 24px);
}
</style>
