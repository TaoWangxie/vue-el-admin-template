# AGENTS.md

本文件是代码代理进入本仓库时的快速工作指引。强制细则以 `docs/开发强制约束.md` 为准，工程化细则以 `docs/工程化规范.md` 为准。

## 项目基线

- 技术栈：Vue 3 + TypeScript + Vite 5 + Element Plus。
- 状态管理：Pinia，不新增 Vuex、Redux 等状态库。
- 路由：Vue Router 4，保持 Hash 路由模式。
- 样式：SCSS、CSS 变量、UnoCSS、Element Plus 变量体系。
- 请求：必须走 `src/axios` 封装，不在业务代码里直接新建 axios 实例或直接 `fetch` 调接口。
- 包管理器：pnpm，Node 18+。

## 常用命令

```bash
pnpm dev
pnpm ts:check
pnpm lint:eslint
pnpm lint:format
pnpm lint:style
pnpm build:dev
pnpm build:test
pnpm build:pro
```

按影响范围执行检查：TS/共享逻辑改动跑 `pnpm ts:check`；Vue、TS、TSX 改动跑 `pnpm lint:eslint`；样式改动跑 `pnpm lint:style`；路由、构建配置、依赖、公共组件改动建议跑 `pnpm build:dev`。

## 开发前必读

1. 先阅读相关文件，不凭文件名猜实现。
2. 先确认项目现有组件、Hook、Store、工具函数、样式变量和类型定义。
3. 涉及表单、表格、搜索、弹窗时，先参考 `docs/组件使用规范/`。
4. 涉及架构、目录、命名、提交、质量检查时，先参考 `docs/工程化规范.md`。
5. 修改前检查工作区已有改动；不得回滚、覆盖、格式化无关文件。

## 业务组件优先级

- 列表页优先使用 `Table + useTable`。
- 查询区优先使用 `Search + useSearch`。
- 表单优先使用 `Form + useForm` 或 schema 配置。
- 弹窗优先使用 `Modal`。
- 基础按钮优先使用全局 `BaseButton` 或 Element Plus 按钮。

## 代码约束

- Vue 单文件组件优先使用 `<script setup lang="ts">`。
- 引入路径优先使用 `@/` 别名。
- 函数、变量使用清晰业务命名，不使用 `data1`、`list2`、`temp` 等无意义命名。
- 接口返回值、表单值、表格行数据需要定义对应类型，避免长期隐式结构。
- 编写方法、功能函数或复杂逻辑时，必须添加必要注释，说明业务意图、关键分支或非显而易见的实现原因。
- 只为复杂业务规则、兼容逻辑、非显而易见的实现补充注释，不写无意义注释。
- 不提交 `console.log`、`debugger`、临时注释代码、无用 import、未使用变量。

## 目录职责

```text
src/api/         # 接口请求与接口类型
src/axios/       # 请求封装、拦截器、取消请求
src/components/  # 通用组件
src/hooks/       # 组合式 Hook
src/layout/      # 布局框架
src/locales/     # 国际化语言包
src/router/      # 路由配置
src/store/       # Pinia 模块
src/styles/      # 全局样式和变量
src/utils/       # 通用工具函数
src/views/       # 业务页面
mock/            # Mock 接口
types/           # 全局类型声明
docs/            # 项目规范和组件文档
```

## 交付前自检

- 是否完整覆盖需求，没有只做 UI 或只做数据层。
- 是否复用了现有组件、Hook、API、Store、工具函数。
- 是否新增了必要类型。
- 是否考虑加载态、空态、错误态、禁用态、分页、重置、关闭弹窗清理。
- 是否影响权限、路由、TagsView、国际化、持久化。
- 是否没有覆盖用户未请求的改动。
- 是否已执行或说明未执行质量检查。
