<script setup lang="ts">
import { computed, unref } from 'vue'
import type { Component } from 'vue'
import { ElIcon } from 'element-plus'
import { propTypes } from '@/utils/propTypes'
import { useDesign } from '@/hooks/web/useDesign'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  Close,
  DArrowLeft,
  DArrowRight,
  DataLine,
  Expand,
  Fold,
  FullScreen,
  Lock,
  Minus,
  Moon,
  Operation,
  PriceTag,
  QuestionFilled,
  Rank,
  Refresh,
  RefreshRight,
  ScaleToOriginal,
  Search,
  Setting,
  Sort,
  Sunny,
  User,
  VideoPlay
} from '@element-plus/icons-vue'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('icon')

const props = defineProps({
  // icon name
  icon: propTypes.string,
  // icon color
  color: propTypes.string,
  // icon size
  size: propTypes.number.def(16),
  hoverColor: propTypes.string
})

const elementPlusIconMap: Recordable<Component> = {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  Close,
  DArrowLeft,
  DArrowRight,
  DataLine,
  Expand,
  Fold,
  FullScreen,
  Lock,
  Minus,
  Moon,
  Operation,
  PriceTag,
  QuestionFilled,
  Rank,
  Refresh,
  RefreshRight,
  ScaleToOriginal,
  Search,
  Setting,
  Sort,
  Sunny,
  User,
  VideoPlay
}

const normalizeIcon = computed(() => props.icon)

const isLocal = computed(() => unref(normalizeIcon).startsWith('svg-icon:'))

const isElementPlusIcon = computed(() => unref(normalizeIcon).startsWith('ep-icon:'))

const symbolId = computed(() => {
  return unref(isLocal) ? `#icon-${unref(normalizeIcon).split('svg-icon:')[1]}` : ''
})

const elementPlusIcon = computed(() => {
  if (!unref(isElementPlusIcon)) return undefined
  const iconName = unref(normalizeIcon).split('ep-icon:')[1]
  return elementPlusIconMap[iconName]
})

const getIconStyle = computed(() => {
  const { color, size } = props
  return {
    fontSize: `${size}px`,
    color
  }
})
</script>

<template>
  <ElIcon :class="prefixCls" :size="size" :color="color">
    <svg v-if="isLocal" aria-hidden="true">
      <use :xlink:href="symbolId" />
    </svg>

    <component :is="elementPlusIcon" v-else-if="elementPlusIcon" :style="getIconStyle" />
  </ElIcon>
</template>

<style lang="scss" scoped>
$prefix-cls: '#{$namespace}-icon';

.#{$prefix-cls} {
  :deep(svg) {
    &:hover {
      // stylelint-disable-next-line
      color: v-bind(hoverColor) !important;
    }
  }
}
</style>
