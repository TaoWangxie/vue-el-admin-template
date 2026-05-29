<script setup lang="ts">
import { propTypes } from '@/utils/propTypes'

defineOptions({
  name: 'DetailSection'
})

defineProps({
  title: propTypes.string.def('')
})
</script>

<template>
  <section class="detail-section mb-12px">
    <div v-if="$slots['title-top']" class="detail-section__top">
      <slot name="title-top"></slot>
    </div>

    <div class="detail-section__header">
      <div class="detail-section__title-wrap">
        <span class="detail-section__mark"></span>
        <span class="detail-section__title">{{ title }}</span>
        <slot name="title-extra"></slot>
      </div>

      <div v-if="$slots['header-extra']" class="detail-section__extra">
        <slot name="header-extra"></slot>
      </div>
    </div>

    <div class="detail-section__body">
      <slot></slot>
    </div>
  </section>
</template>

<style lang="scss">
.detail-section {
  overflow: hidden;
  background: var(--el-bg-color);
  border-radius: 6px;

  &__top {
    padding: 16px 18px 0;
  }

  &__header {
    display: flex;
    height: 64px;
    padding: 0 18px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    align-items: center;
    justify-content: space-between;
  }

  &__title-wrap {
    display: flex;
    min-width: 0;
    align-items: center;
  }

  &__mark {
    width: 4px;
    height: 18px;
    margin-right: 8px;
    background: var(--el-color-primary);
    border-radius: 2px;
  }

  &__title {
    color: var(--el-text-color-primary);
    font-size: 16px;
    font-weight: 700;
  }

  &__extra {
    display: flex;
    margin-left: 16px;
    align-items: center;
    justify-content: flex-end;
  }

  &__body {
    display: grid;
    padding: 24px 56px 36px;
    align-content: start;
    align-items: start;
    grid-auto-rows: min-content;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    row-gap: 36px;
  }
}

.detail-field {
  display: flex;
  min-width: 0;
  color: var(--el-text-color-primary);
  font-size: 14px;
  line-height: 22px;

  &--full {
    grid-column: 1 / -1;
  }

  &__label {
    flex: 0 0 auto;
    color: var(--el-text-color-regular);
  }

  &__value {
    min-width: 0;
    word-break: break-all;
  }
}

@media (max-width: 992px) {
  .detail-section__body {
    padding: 22px 24px 32px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .detail-section__body {
    grid-template-columns: 1fr;
  }
}
</style>
