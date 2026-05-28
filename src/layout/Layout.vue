<script lang="tsx">
import { computed, defineAsyncComponent, defineComponent, ref, unref } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { Backtop } from '@/components/Backtop'
import { useRenderLayout } from './components/useRenderLayout'
import { useDesign } from '@/hooks/web/useDesign'
import { Icon } from '@/components/Icon'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('layout')

const settingPrefixCls = getPrefixCls('setting')

const AsyncSetting = defineAsyncComponent(() =>
  import('@/components/Setting').then(({ Setting }) => Setting)
)

const appStore = useAppStore()

// 是否是移动端
const mobile = computed(() => appStore.getMobile)

// 菜单折叠
const collapse = computed(() => appStore.getCollapse)

const layout = computed(() => appStore.getLayout)

const settingVisible = ref(false)

const openSetting = () => {
  settingVisible.value = true
}

const handleClickOutside = () => {
  appStore.setCollapse(true)
}

const renderLayout = () => {
  switch (unref(layout)) {
    case 'classic':
      const { renderClassic } = useRenderLayout()
      return renderClassic()
    case 'topLeft':
      const { renderTopLeft } = useRenderLayout()
      return renderTopLeft()
    case 'top':
      const { renderTop } = useRenderLayout()
      return renderTop()
    case 'cutMenu':
      const { renderCutMenu } = useRenderLayout()
      return renderCutMenu()
    default:
      break
  }
}

export default defineComponent({
  name: 'Layout',
  setup() {
    return () => (
      <section class={[prefixCls, `${prefixCls}__${layout.value}`, 'w-[100%] h-[100%] relative']}>
        {mobile.value && !collapse.value ? (
          <div
            class="absolute top-0 left-0 w-full h-full opacity-30 z-99 bg-[var(--el-color-black)]"
            onClick={handleClickOutside}
          ></div>
        ) : undefined}

        {renderLayout()}

        <Backtop></Backtop>

        <div
          class={[
            settingPrefixCls,
            'fixed top-[45%] right-0 w-40px h-40px flex items-center justify-center bg-[var(--el-color-primary)] cursor-pointer z-10'
          ]}
          onClick={openSetting}
        >
          <Icon icon="ep-icon:Setting" color="#fff" />
        </div>

        {settingVisible.value ? (
          <AsyncSetting v-model={settingVisible.value}></AsyncSetting>
        ) : undefined}
      </section>
    )
  }
})
</script>

<style lang="scss" scoped>
$prefix-cls: '#{$namespace}-layout';

.#{$prefix-cls} {
  background-color: var(--app-content-bg-color);

  .#{$prefix-cls}-content-scrollbar {
    & > :deep(.el-scrollbar__wrap) {
      & > .#{$elNamespace}-scrollbar__view {
        display: flex;
        height: 100% !important;
        flex-direction: column;
      }
    }
  }
}

.#{$namespace}-setting {
  border-radius: 6px 0 0 6px;
}
</style>
