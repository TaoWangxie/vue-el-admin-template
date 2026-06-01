<script setup lang="ts">
import { ElIcon, ElUpload } from 'element-plus'
import type { UploadProps } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'

defineOptions({
  name: 'FileUpload'
})

withDefaults(
  defineProps<{
    action?: string
    autoUpload?: boolean
    buttonText?: string
    limit?: number
    listType?: UploadProps['listType']
    tip?: string
  }>(),
  {
    action: '#',
    autoUpload: false,
    buttonText: '选择文件',
    limit: 1,
    listType: 'text',
    tip: ''
  }
)
</script>

<template>
  <ElUpload :action="action" :auto-upload="autoUpload" :limit="limit" :list-type="listType">
    <template #trigger>
      <button class="file-upload-trigger" type="button">
        <ElIcon size="22">
          <UploadFilled />
        </ElIcon>
        <span>{{ buttonText }}</span>
      </button>
    </template>

    <template v-if="tip" #tip>
      <div class="el-upload__tip">{{ tip }}</div>
    </template>
  </ElUpload>
</template>

<style lang="scss" scoped>
.file-upload-trigger {
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
</style>
