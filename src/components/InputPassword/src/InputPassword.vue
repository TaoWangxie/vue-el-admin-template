<script setup lang="ts">
import { ref, unref, watch } from 'vue'
import { ElInput } from 'element-plus'
import { propTypes } from '@/utils/propTypes'
import { useConfigGlobal } from '@/hooks/web/useConfigGlobal'
import type { ZxcvbnResult } from '@zxcvbn-ts/core'
import { useDesign } from '@/hooks/web/useDesign'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('input-password')

const props = defineProps({
  // 是否显示密码强度
  strength: propTypes.bool.def(false),
  modelValue: propTypes.string.def('')
})

watch(
  () => props.modelValue,
  (val: string) => {
    if (val === unref(valueRef)) return
    valueRef.value = val
  }
)

const { configGlobal } = useConfigGlobal()

const emit = defineEmits(['update:modelValue'])

// 设置input的type属性
const textType = ref<'password' | 'text'>('password')

// 输入框的值
const valueRef = ref(props.modelValue)

const passwordStrength = ref(-1)

type ZxcvbnFn = (typeof import('@zxcvbn-ts/core'))['zxcvbn']

let zxcvbnLoader: Promise<ZxcvbnFn> | undefined

const loadZxcvbn = async () => {
  if (!zxcvbnLoader) {
    zxcvbnLoader = import('@zxcvbn-ts/core').then(({ zxcvbn }) => zxcvbn)
  }
  return zxcvbnLoader
}

// 监听
watch(
  () => valueRef.value,
  (val: string) => {
    emit('update:modelValue', val)
  }
)

// 获取密码强度，仅在开启强度条时懒加载 zxcvbn，避免登录首屏加载大依赖
let strengthToken = 0
watch(
  [() => props.strength, () => valueRef.value],
  async ([strength, value]) => {
    const token = ++strengthToken
    if (!strength || !value) {
      passwordStrength.value = -1
      return
    }

    const zxcvbn = await loadZxcvbn()
    if (token !== strengthToken) return

    const zxcvbnRef = zxcvbn(value) as ZxcvbnResult
    passwordStrength.value = zxcvbnRef.score
  },
  {
    immediate: true
  }
)
</script>

<template>
  <div :class="[prefixCls, `${prefixCls}--${configGlobal?.size}`]">
    <ElInput v-bind="$attrs" v-model="valueRef" showPassword :type="textType" />
    <div
      v-if="strength"
      :class="`${prefixCls}__bar`"
      class="relative h-6px mt-10px mb-6px mr-auto ml-auto"
    >
      <div :class="`${prefixCls}__bar--fill`" :data-score="passwordStrength"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$prefix-cls: '#{$namespace}-input-password';

.#{$prefix-cls} {
  :deep(.#{$elNamespace}-input__clear) {
    margin-left: 5px;
  }

  &__bar {
    background-color: var(--el-text-color-disabled);
    border-radius: var(--el-border-radius-base);

    &::before,
    &::after {
      position: absolute;
      z-index: 10;
      display: block;
      width: 20%;
      height: inherit;
      background-color: transparent;
      border-color: var(--el-color-white);
      border-style: solid;
      border-width: 0 5px;
      content: '';
    }

    &::before {
      left: 20%;
    }

    &::after {
      right: 20%;
    }

    &--fill {
      position: absolute;
      width: 0;
      height: inherit;
      background-color: transparent;
      border-radius: inherit;
      transition:
        width 0.5s ease-in-out,
        background 0.25s;

      &[data-score='0'] {
        width: 20%;
        background-color: var(--el-color-danger);
      }

      &[data-score='1'] {
        width: 40%;
        background-color: var(--el-color-danger);
      }

      &[data-score='2'] {
        width: 60%;
        background-color: var(--el-color-warning);
      }

      &[data-score='3'] {
        width: 80%;
        background-color: var(--el-color-success);
      }

      &[data-score='4'] {
        width: 100%;
        background-color: var(--el-color-success);
      }
    }
  }

  &--mini > &__bar {
    border-radius: var(--el-border-radius-small);
  }
}
</style>
