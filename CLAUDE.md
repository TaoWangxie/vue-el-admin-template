# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用命令

```bash
pnpm dev              # 启动开发服务器，端口 3005（mode: base，Mock 已启用）
pnpm build:pro        # 生产环境构建
pnpm build:dev        # 开发环境构建
pnpm build:test       # 测试环境构建
pnpm ts:check         # TypeScript 类型检查（vue-tsc）
pnpm lint:eslint      # ESLint 修复（src/**/*.{js,ts,vue}）
pnpm lint:format      # Prettier 格式化
pnpm lint:style       # Stylelint 修复
```

## 开发前必读

**强制约束优先级**：用户明确要求 > 本文档 > [docs/工程化规范.md](docs/工程化规范.md) > [docs/组件使用规范/*](docs/组件使用规范/) > 现有局部代码风格

**开发前必须执行**：
1. 先阅读相关文件，不允许只凭文件名猜实现
2. 先确认项目现有能力：组件、Hook、Store、工具函数、样式变量、类型定义
3. 涉及表单、表格、搜索、弹窗时，必须先参考 [docs/组件使用规范/](docs/组件使用规范/)
4. 涉及架构、目录、命名、提交、质量检查时，必须先参考 [docs/工程化规范.md](docs/工程化规范.md)
5. 修改前检查当前工作区是否已有改动；不得回滚、覆盖、格式化无关文件
6. 修改 [docs/组件使用规范/](docs/组件使用规范/) 已覆盖的组件能力时，必须精炼同步对应组件文档，且单个组件规范文档不超过 500 行

详细约束请参考 [docs/开发强制约束.md](docs/开发强制约束.md)。

## 架构概览

基于 Vue 3 + Element Plus + TypeScript + Vite 5 的后台管理模板，使用 Hash 路由模式。

**路由与权限** ([src/permission.ts](src/permission.ts), [src/store/modules/permission.ts](src/store/modules/permission.ts)):
- 导航守卫通过 `userStore.getUserInfo` 判断登录状态
- 支持三种路由生成策略：`server`（后端驱动）、`frontEnd`（前端角色过滤）、`static`（静态路由）
- `appStore.dynamicRouter` 和 `appStore.serverDynamicRouter` 控制使用哪种策略
- 登录后通过 `router.addRoute()` 动态添加路由

**状态管理** ([src/store/modules/](src/store/modules/)):
- Pinia + `pinia-plugin-persistedstate` 实现持久化
- `app.ts` — 布局配置、主题、暗黑模式、UI 开关（整体持久化）
- `permission.ts` — 路由表（持久化 routers/addRouters/menuTabRouters）
- `user.ts` — 认证 token、用户信息、角色路由
- 每个 store 导出 `useXxxStoreWithOut()` 函数，用于 setup 上下文外调用

**HTTP 请求层** ([src/axios/](src/axios/)):
- 基于 Axios 封装，使用 AbortController 实现请求取消
- 每次请求自动从 `userStore` 注入 Token 到请求头
- [src/axios/service.ts](src/axios/service.ts) — 实例配置、拦截器、取消请求 API
- [src/axios/index.ts](src/axios/index.ts) — 导出 `request.get/post/put/delete` 方法

**国际化** ([src/locales/](src/locales/)):
- Vue I18n，包含 `zh-CN.ts` 和 `en.ts` 语言文件
- 通过 [src/hooks/web/useI18n.ts](src/hooks/web/useI18n.ts) 的 `useI18n()` hook 访问

**布局** ([src/layout/](src/layout/)):
- 单一 `Layout.vue`，支持多种布局模式（classic、top 等），由 `appStore.layout` 控制
- 布局子组件位于 [src/layout/components/](src/layout/components/)

**全局组件** ([src/components/index.ts](src/components/index.ts)):
- `Icon` 和 `BaseButton` 全局注册
- 其他组件按需导入

## 技术栈约束（不可变更）

- 必须使用 Vue 3 + TypeScript + Vite + Element Plus
- 状态管理必须使用 Pinia，不新增 Vuex、Redux 等状态库
- 路由必须使用 Vue Router 4，保持 Hash 路由模式
- 样式优先使用项目现有 SCSS、CSS 变量、UnoCSS、Element Plus 变量体系
- HTTP 请求必须走 [src/axios](src/axios) 封装，不允许在业务代码里直接新建 axios 实例或直接 `fetch` 调接口
- 日期处理优先使用项目已有 `dayjs` 或 [src/utils/dateUtil.ts](src/utils/dateUtil.ts)
- 工具函数优先复用 [src/utils/](src/utils/)、`lodash-es`、`@vueuse/core`，不复制粘贴相似实现

## 业务组件优先级

- 列表页优先使用 `Table + useTable`，参考 [docs/组件使用规范/Table表格组件文档.md](docs/组件使用规范/Table表格组件文档.md)
- 查询区优先使用 `Search + useSearch`，参考 [docs/组件使用规范/Search搜索组件.md](docs/组件使用规范/Search搜索组件.md)
- 表单优先使用 `Form + useForm` 或 schema 配置，参考 [docs/组件使用规范/Form组件使用文档.md](docs/组件使用规范/Form组件使用文档.md)
- 弹窗优先使用 `Modal`，参考 [docs/组件使用规范/Modal弹窗组件.md](docs/组件使用规范/Modal弹窗组件.md)
- 基础按钮优先使用全局 `BaseButton` 或 Element Plus 按钮，保持项目视觉一致

## 代码风格硬约束

- Vue 单文件组件优先使用 `<script setup lang="ts">`
- TSX 仅在复杂渲染配置、组件内部渲染函数或现有文件已使用 TSX 时使用
- 引入路径优先使用 `@/` 别名，不使用过深的 `../../../`
- 函数、变量使用清晰业务命名，不使用 `data1`、`list2`、`temp` 这类无意义命名
- 不允许新增大段无类型的 `any`；确实无法避免时必须限制作用域
- 不允许把接口返回值、表单值、表格行数据长期保持为隐式结构；需要定义对应类型
- 编写方法、功能函数或复杂逻辑时，必须添加必要注释，说明业务意图、关键分支或非显而易见的实现原因
- 不允许在组件中写无意义注释；只为复杂业务规则、兼容逻辑、非显而易见的实现补充注释
- 不允许提交 `console.log`、`debugger`、临时注释代码、无用 import、未使用变量

## API 与数据约束

- API 文件放在 `src/api/模块名/index.ts`
- API 类型放在同目录 `types.ts`，或在模块内拆分更细类型文件
- API 方法命名使用动词 + 资源 + `Api`，例如 `getUserListApi`、`createUserApi`、`updateUserApi`、`deleteUserApi`
- 所有 API 方法必须声明返回 Promise 类型，例如 `Promise<IResponse<UserListRes>>`
- 请求路径、参数名、返回结构必须以需求或后端约定为准，不允许 AI 自行编造字段
- 接口异常处理优先走全局 axios 拦截器；页面只处理业务态、空态、局部提示

## 质量检查强制项

代码改动完成后，按影响范围执行检查：

```bash
pnpm ts:check       # TS 类型或共享逻辑改动
pnpm lint:eslint    # Vue、TS、TSX 改动
pnpm lint:style     # 样式改动
pnpm build:dev      # 路由、构建配置、依赖、公共组件改动
```

如因环境、依赖、网络等原因无法执行，必须在交付说明中明确说明。

## 禁止行为

- 禁止无需求重构大面积文件
- 禁止改动与任务无关的格式、缩进、排序
- 禁止删除用户已有代码、注释、文档、Mock、类型，除非用户明确要求或确认为废弃
- 禁止绕过现有封装直接调用底层库
- 禁止复制一份几乎相同的组件或 Hook
- 禁止把后端字段映射、权限判断、表单校验散落在多个组件中重复实现
- 禁止为了"看起来能跑"写假字段、假权限、假流程而不标注

## 环境与配置

- `.env.base` — 默认开发配置（Mock 启用，端口 3005）
- `.env.dev` / `.env.test` / `.env.pro` — 各环境覆盖配置
- 关键环境变量：`VITE_USE_MOCK`、`VITE_API_BASE_PATH`、`VITE_USE_ALL_ELEMENT_PLUS_STYLE`
- API 代理：`/api` → `http://127.0.0.1:8000`（开发服务器）
- 路径别名：`@/` → `src/`

## 技术栈

- **运行时**：Vue 3.5、Vue Router 4（Hash 模式）、Pinia
- **UI**：Element Plus 2.5、UnoCSS、SCSS（变量文件 [src/styles/variables.module.scss](src/styles/variables.module.scss)）
- **构建**：Vite 5、TypeScript 5.3
- **包管理器**：pnpm 8+、Node 18+
- **Mock**：vite-plugin-mock（文件位于 [mock/](mock/)）

## 文档结构

**组件使用文档** ([docs/组件使用规范/](docs/组件使用规范/)):
- [Form组件使用文档.md](docs/组件使用规范/Form组件使用文档.md) — Form 表单组件的配置化使用说明（基于 schema）
- [Table表格组件文档.md](docs/组件使用规范/Table表格组件文档.md) — Table 表格组件的使用文档
- [Search搜索组件.md](docs/组件使用规范/Search搜索组件.md) — Search 搜索组件的使用文档
- [Modal弹窗组件.md](docs/组件使用规范/Modal弹窗组件.md) — Modal 弹窗组件的使用文档

**其他文档目录**:
- [docs/业务模板/](docs/业务模板/) — 业务模板相关文档
- [docs/工程化规范.md](docs/工程化规范.md) — 工程化规范文档
- [docs/开发强制约束.md](docs/开发强制约束.md) — 开发强制约束文档（必读）

## 交付前自检清单

- 需求是否完整覆盖，没有只实现 UI 或只实现数据层
- 是否复用了现有组件、Hook、API、Store、工具函数
- 是否新增了必要类型，避免隐式结构
- 是否考虑加载态、空态、错误态、禁用态、分页、重置、关闭弹窗清理
- 是否影响权限、路由、TagsView、国际化、持久化
- 是否没有覆盖用户未请求的改动
- 是否已执行或说明未执行质量检查
