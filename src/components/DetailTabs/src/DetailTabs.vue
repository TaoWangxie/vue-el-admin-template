<script setup lang="ts">
import type { PropType } from 'vue'
import type { DetailTabOption } from './types'

defineOptions({
  name: 'DetailTabs'
})

defineProps({
  options: {
    type: Array as PropType<DetailTabOption[]>,
    default: () => []
  }
})

const activeValue = defineModel<string>({ default: '' })
</script>

<template>
  <div class="detail-tabs">
    <button
      v-for="tab in options"
      :key="tab.value"
      class="detail-tabs__item"
      :class="{ 'is-active': activeValue === tab.value }"
      type="button"
      @click="activeValue = tab.value"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.detail-tabs {
  position: relative;
  display: flex;
  overflow-x: auto;

  &::after {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 0;
    height: 1px;
    content: '';
    background: var(--el-border-color-lighter);
  }

  &__item {
    position: relative;
    z-index: 1;
    min-width: 96px;
    height: 38px;
    padding: 0 18px;
    color: var(--el-text-color-regular);
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;
    background: #f5f7fb;
    border: 1px solid var(--el-border-color-lighter);
    border-bottom: 1px solid var(--el-border-color-lighter);
    border-radius: 6px 6px 0 0;

    & + & {
      margin-left: 8px;
    }

    &:hover {
      color: var(--el-color-primary);
    }

    &.is-active {
      color: var(--el-color-primary);
      background: var(--el-bg-color);
      border-color: var(--el-border-color-lighter);
      border-bottom-color: var(--el-bg-color);

      &::after {
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 2;
        height: 1px;
        content: '';
        background: var(--el-bg-color);
      }
    }
  }
}
</style>
