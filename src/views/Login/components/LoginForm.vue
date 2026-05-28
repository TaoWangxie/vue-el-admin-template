<script setup lang="tsx">
import { computed, nextTick, ref, watch, onMounted, onUnmounted, unref } from 'vue'
import { Form, FormSchema } from '@/components/Form'
import { useI18n } from '@/hooks/web/useI18n'
import { ElCheckbox, ElLink } from 'element-plus'
import { useForm } from '@/hooks/web/useForm'
import { loginApi, smsLoginApi, getTestRoleApi, getAdminRoleApi } from '@/api/login'
import { useAppStore } from '@/store/modules/app'
import { usePermissionStore } from '@/store/modules/permission'
import { useRouter } from 'vue-router'
import type { RouteLocationNormalizedLoaded, RouteRecordRaw } from 'vue-router'
import { SmsLoginType, UserLoginType } from '@/api/login/types'
import { useUserStore } from '@/store/modules/user'
import { BaseButton } from '@/components/Button'
import type { FormRules } from 'element-plus'

const emit = defineEmits(['to-register'])

const appStore = useAppStore()

const userStore = useUserStore()

const permissionStore = usePermissionStore()

const { currentRoute, addRoute, push } = useRouter()

const { t } = useI18n()

type LoginMode = 'sms' | 'password'

const loginMode = ref<LoginMode>('sms')

const smsCountdown = ref(0)

let smsTimer: TimeoutHandle | undefined

const agree = ref(false)

const validateActiveRequired =
  (mode: LoginMode) => (_rule: unknown, value: unknown, callback: (error?: Error) => void) => {
    if (loginMode.value !== mode || value) {
      callback()
      return
    }
    callback(new Error(t('common.required')))
  }

const rules: FormRules = {
  username: [{ validator: validateActiveRequired('password') }],
  password: [{ validator: validateActiveRequired('password') }],
  phone: [{ validator: validateActiveRequired('sms') }],
  code: [{ validator: validateActiveRequired('sms') }],
  agree: [
    {
      validator: (_rule: unknown, _value: unknown, callback: (error?: Error) => void) => {
        if (agree.value) {
          callback()
          return
        }
        callback(new Error(t('login.agreementRequired')))
      }
    }
  ]
}

const remember = ref(userStore.getRememberMe)

const activeTabClass =
  'relative text-[var(--el-text-color-primary)] font-700 after:(content-[\"\"] absolute left-1/2 bottom-[-8px] w-30px h-3px bg-[var(--el-color-primary)] rounded-2px translate-x-[-50%])'

const inactiveTabClass = 'text-[var(--el-text-color-secondary)] font-500'

const switchLoginMode = async (mode: LoginMode) => {
  if (loginMode.value === mode) return
  loginMode.value = mode
  await nextTick()
  const formRef = await getElFormExpose()
  formRef?.clearValidate()
}

const startSmsCountdown = () => {
  smsCountdown.value = 60
  smsTimer && clearInterval(smsTimer)
  smsTimer = setInterval(() => {
    if (smsCountdown.value <= 1) {
      smsCountdown.value = 0
      smsTimer && clearInterval(smsTimer)
      smsTimer = undefined
      return
    }
    smsCountdown.value -= 1
  }, 1000)
}

const getSmsCode = async () => {
  const formRef = await getElFormExpose()
  await formRef?.validateField('phone', (isValid) => {
    if (isValid && smsCountdown.value === 0) {
      startSmsCountdown()
    }
  })
}

const schema = computed<FormSchema[]>(() => [
  {
    field: 'loginTabs',
    colProps: {
      span: 24
    },
    formItemProps: {
      slots: {
        default: () => {
          return (
            <div class="login-mode-tabs">
              <span
                class={[
                  'login-mode-tab',
                  loginMode.value === 'sms' ? activeTabClass : inactiveTabClass
                ]}
                onClick={() => switchLoginMode('sms')}
              >
                {t('login.smsLogin')}
              </span>
              <span
                class={[
                  'login-mode-tab',
                  loginMode.value === 'password' ? activeTabClass : inactiveTabClass
                ]}
                onClick={() => switchLoginMode('password')}
              >
                {t('login.passwordLogin')}
              </span>
            </div>
          )
        }
      }
    }
  },
  {
    field: 'phone',
    label: '',
    component: 'Input',
    hidden: loginMode.value !== 'sms',
    colProps: {
      span: 24
    },
    componentProps: {
      placeholder: t('login.phonePlaceholder')
    }
  },
  {
    field: 'code',
    label: '',
    hidden: loginMode.value !== 'sms',
    colProps: {
      span: 24
    },
    formItemProps: {
      slots: {
        default: (formModel) => {
          return (
            <div class="w-[100%] h-40px flex items-center border-1 border-solid border-[var(--el-border-color)] bg-[var(--el-fill-color-blank)] transition-border-color hover:border-[var(--el-border-color-hover)]">
              <input
                class="min-w-0 flex-1 h-full px-15px border-none outline-none bg-transparent text-[var(--el-input-text-color,var(--el-text-color-regular))] placeholder:text-[var(--el-text-color-placeholder)]"
                placeholder={t('login.codePlaceholder')}
                value={formModel.code || ''}
                onInput={(event) => {
                  formModel.code = (event.target as HTMLInputElement).value
                }}
              />
              <button
                type="button"
                class={[
                  'h-full shrink-0 px-18px border-none bg-transparent text-[var(--el-color-primary)] font-500 cursor-pointer whitespace-nowrap',
                  {
                    '!cursor-not-allowed !text-[var(--el-text-color-placeholder)]':
                      smsCountdown.value > 0
                  }
                ]}
                disabled={smsCountdown.value > 0}
                onClick={getSmsCode}
              >
                {smsCountdown.value > 0
                  ? t('login.countdown', { seconds: smsCountdown.value })
                  : t('login.getCode')}
              </button>
            </div>
          )
        }
      }
    }
  },
  {
    field: 'username',
    label: '',
    component: 'Input',
    hidden: loginMode.value !== 'password',
    colProps: {
      span: 24
    },
    componentProps: {
      placeholder: t('login.usernamePlaceholder')
    }
  },
  {
    field: 'password',
    label: '',
    component: 'InputPassword',
    hidden: loginMode.value !== 'password',
    colProps: {
      span: 24
    },
    formItemProps: {
      class: 'login-password-form-item'
    },
    componentProps: {
      style: {
        width: '100%'
      },
      placeholder: t('login.passwordPlaceholder')
    }
  },
  {
    field: 'tool',
    hidden: loginMode.value !== 'password',
    colProps: {
      span: 24
    },
    formItemProps: {
      class: 'login-tool-form-item',
      slots: {
        default: () => {
          return (
            <div class="flex justify-between items-center w-[100%]">
              <ElCheckbox v-model={remember.value} label={t('login.remember')} size="small" />
              <ElLink type="primary" underline={false}>
                {t('login.forgetPassword')}
              </ElLink>
            </div>
          )
        }
      }
    }
  },
  {
    field: 'login',
    colProps: {
      span: 24
    },
    formItemProps: {
      slots: {
        default: () => {
          return (
            <>
              <div class="w-[100%]">
                <BaseButton
                  loading={loading.value}
                  type="primary"
                  class="w-[100%]"
                  onClick={signIn}
                >
                  {t('login.login')}
                </BaseButton>
              </div>
              <div class="w-[100%] mt-15px">
                <BaseButton class="w-[100%]" onClick={toRegister}>
                  {t('login.register')}
                </BaseButton>
              </div>
            </>
          )
        }
      }
    }
  },
  {
    field: 'agree',
    colProps: {
      span: 24
    },
    formItemProps: {
      class: 'login-agree-form-item',
      slots: {
        default: () => {
          return (
            <div class="w-[100%] flex items-start justify-start">
              <ElCheckbox v-model={agree.value} class="shrink-0" />
              <span class="ml-8px inline-flex flex-wrap items-center text-13px leading-20px text-[var(--el-text-color-regular)]">
                {t('login.agreePrefix')}
                <ElLink type="primary" underline={false}>
                  {t('login.userAgreement')}
                </ElLink>
                {t('login.and')}
                <ElLink type="primary" underline={false}>
                  {t('login.privacyPolicy')}
                </ElLink>
              </span>
            </div>
          )
        }
      }
    }
  }
])

const initLoginInfo = () => {
  const loginInfo = userStore.getLoginInfo
  if (loginInfo) {
    const { username } = loginInfo
    setValues({ username })
  }
}
onMounted(() => {
  initLoginInfo()
})

onUnmounted(() => {
  smsTimer && clearInterval(smsTimer)
})

const { formRegister, formMethods } = useForm()
const { getFormData, getElFormExpose, setValues } = formMethods

const loading = ref(false)

const redirect = ref<string>('')

watch(
  () => currentRoute.value,
  (route: RouteLocationNormalizedLoaded) => {
    redirect.value = route?.query?.redirect as string
  },
  {
    immediate: true
  }
)

// 登录
const signIn = async () => {
  const formRef = await getElFormExpose()
  await formRef?.validate(async (isValid) => {
    if (isValid) {
      loading.value = true

      try {
        const formData = await getFormData<UserLoginType & SmsLoginType>()
        const isPasswordLogin = loginMode.value === 'password'
        const res = isPasswordLogin
          ? await loginApi({
              username: formData.username,
              password: formData.password
            })
          : await smsLoginApi({
              phone: formData.phone,
              code: formData.code
            })

        if (res) {
          // 是否记住我
          if (isPasswordLogin && unref(remember)) {
            userStore.setLoginInfo({
              username: formData.username
            })
          } else {
            userStore.setLoginInfo(undefined)
          }
          userStore.setRememberMe(unref(remember))
          userStore.setUserInfo(res.data)
          // 是否使用动态路由
          if (appStore.getDynamicRouter) {
            await getRole()
          } else {
            await permissionStore.generateRoutes('static').catch(() => {})
            permissionStore.getAddRouters.forEach((route) => {
              addRoute(route as RouteRecordRaw) // 动态添加可访问路由表
            })
            permissionStore.setIsAddRouters(true)
            push({ path: redirect.value || permissionStore.addRouters[0].path })
          }
        }
      } finally {
        loading.value = false
      }
    }
  })
}

// 获取角色信息
const getRole = async () => {
  const formData = await getFormData<UserLoginType & SmsLoginType>()
  const params = {
    roleName: loginMode.value === 'password' ? formData.username : 'admin'
  }
  const res =
    appStore.getDynamicRouter && appStore.getServerDynamicRouter
      ? await getAdminRoleApi(params)
      : await getTestRoleApi(params)
  if (res) {
    const routers = res.data || []
    userStore.setRoleRouters(routers)
    appStore.getDynamicRouter && appStore.getServerDynamicRouter
      ? await permissionStore.generateRoutes('server', routers).catch(() => {})
      : await permissionStore.generateRoutes('frontEnd', routers).catch(() => {})

    permissionStore.getAddRouters.forEach((route) => {
      addRoute(route as RouteRecordRaw) // 动态添加可访问路由表
    })
    permissionStore.setIsAddRouters(true)
    push({ path: redirect.value || permissionStore.addRouters[0].path })
  }
}

// 去注册页面
const toRegister = () => {
  emit('to-register')
}
</script>

<template>
  <Form
    :schema="schema"
    :rules="rules"
    label-position="top"
    hide-required-asterisk
    :validate-on-rule-change="false"
    size="large"
    class="dark:(border-1 border-[var(--el-border-color)] border-solid)"
    @register="formRegister"
  />
</template>

<style lang="scss" scoped>
:deep(.login-mode-tabs) {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 76px;
  margin-bottom: 28px;
}

:deep(.login-mode-tab) {
  font-size: 16px;
  line-height: 24px;
  cursor: pointer;
}

:deep(.login-password-form-item) {
  margin-bottom: 10px;
}

:deep(.login-tool-form-item) {
  margin-bottom: 14px;
}

:deep(.login-agree-form-item) {
  margin-bottom: 0;

  .el-checkbox {
    height: 20px;
    margin-right: 0;
  }

  .el-checkbox__label {
    display: none;
  }

  .el-form-item__error {
    left: 0;
  }
}
</style>
