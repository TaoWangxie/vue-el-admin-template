<script lang="tsx">
import { defineComponent, computed } from 'vue'
import { Collapse } from '@/components/Collapse'
import { UserInfo } from '@/components/UserInfo'
import { Screenfull } from '@/components/Screenfull'
import { Breadcrumb } from '@/components/Breadcrumb'
import { useAppStore } from '@/store/modules/app'
import { useDesign } from '@/hooks/web/useDesign'

const { getPrefixCls, variables } = useDesign()

const prefixCls = getPrefixCls('tool-header')

const appStore = useAppStore()

// 面包屑
const breadcrumb = computed(() => appStore.getBreadcrumb)

// 折叠图标
const hamburger = computed(() => appStore.getHamburger)

// 全屏图标
const screenfull = computed(() => appStore.getScreenfull)

// 布局
const layout = computed(() => appStore.getLayout)

const headerStatusList = [
  { label: '待审批', count: 1 },
  { label: '待还车', count: 10 },
  { label: '已逾期', count: 8 }
]

export default defineComponent({
  name: 'ToolHeader',
  setup() {
    return () => (
      <div
        id={`${variables.namespace}-tool-header`}
        class={[
          prefixCls,
          'h-[var(--top-tool-height)] relative px-[var(--top-tool-p-x)] flex items-center justify-between'
        ]}
      >
        {layout.value !== 'top' ? (
          <div class="h-full flex items-center">
            {hamburger.value && layout.value !== 'cutMenu' ? (
              <Collapse class="custom-hover" color="var(--top-header-text-color)"></Collapse>
            ) : undefined}
            {breadcrumb.value ? <Breadcrumb class="<md:hidden"></Breadcrumb> : undefined}
          </div>
        ) : undefined}
        <div class="h-full flex items-center">
          <div class={`${prefixCls}__status <md:hidden`}>
            {headerStatusList.map((item, index) => (
              <>
                {index > 0 ? <span class={`${prefixCls}__status-divider`}></span> : undefined}
                <button class={`${prefixCls}__status-item`} type="button">
                  <span>{item.label}</span>
                  <span>（{item.count}）</span>
                </button>
              </>
            ))}
          </div>
          {screenfull.value ? (
            <Screenfull class="custom-hover" color="var(--top-header-text-color)"></Screenfull>
          ) : undefined}
          <UserInfo></UserInfo>
        </div>
      </div>
    )
  }
})
</script>

<style lang="scss" scoped>
$prefix-cls: '#{$namespace}-tool-header';

.#{$prefix-cls} {
  transition: left var(--transition-time-02);

  &__status {
    display: flex;
    height: 36px;
    margin-right: 12px;
    color: var(--top-header-text-color);
    align-items: center;
  }

  &__status-item {
    display: inline-flex;
    height: 32px;
    padding: 0 12px;
    appearance: none;
    font-size: 12px;
    color: var(--el-text-color-regular);
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: 16px;
    align-items: center;
    justify-content: center;

    &:hover {
      background: var(--el-fill-color-lighter);
    }
  }

  &__status-divider {
    width: 1px;
    height: 14px;
    margin: 0 10px;
    background: var(--el-border-color-lighter);
  }
}
</style>
