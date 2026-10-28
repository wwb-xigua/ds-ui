import { defineConfig } from 'vitepress';
import svgLoader from 'vite-svg-loader';
import { fileURLToPath } from 'node:url';

// `new URL(...).pathname` percent-encodes non-ASCII characters, which breaks on
// paths containing CJK segments. fileURLToPath keeps them intact.
const fromDocs = (relative: string) => fileURLToPath(new URL(relative, import.meta.url));

export default defineConfig({
  title: '@coldboy/ds-ui',
  description: '一个基于 Naive UI 的 Vue 3 组件库，面向中后台数据密集型界面',
  lang: 'zh-CN',
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: false,
  // Root-level files that must not be treated as documentation pages.
  srcExclude: ['README.md', 'CONTRIBUTING.md', 'SECURITY.md', 'LICENSE', '**/node_modules/**'],

  // Demos import the library straight from source so examples stay live as the
  // components change. This is the same code path the published package uses.
  vite: {
    plugins: [
      // Required by the library build too. Without it, `import.meta.glob(...,
      // { import: 'default' })` inside SIcon resolves to plain URL strings
      // instead of SVG components, and `<n-icon :component>` renders nothing.
      svgLoader(),
    ],
    resolve: {
      dedupe: ['vue', 'naive-ui'],
      alias: [
        {
          find: /^ds-ui$/,
          replacement: fromDocs('../../packages/index.ts'),
        },
        {
          find: /^ds-ui\/(.*)$/,
          replacement: fromDocs('../../packages/') + '$1',
        },
        {
          find: /\/#\//,
          replacement: fromDocs('../../types/'),
        },
      ],
    },
  },

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: '@coldboy/ds-ui',

    nav: [
      { text: '开始', link: '/guide/getting-started' },
      { text: '组件', link: '/components/stable' },
      { text: '更新日志', link: '/changelog' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/guide/why' },
            { text: '安装', link: '/guide/getting-started' },
            { text: '快速上手', link: '/guide/quick-start' },
            { text: '主题定制', link: '/guide/theming' },
          ],
        },
        {
          text: '进阶',
          items: [
            { text: '按需引入', link: '/guide/tree-shaking' },
            { text: '常见问题', link: '/guide/faq' },
          ],
        },
      ],
      '/components/': [
        {
          text: '数据展示',
          items: [{ text: 'STable 数据表格', link: '/components/stable' }],
        },
        {
          text: '数据录入',
          items: [{ text: 'SForm 表单', link: '/components/sform' }],
        },
        {
          text: '反馈',
          items: [
            { text: 'SModal 弹窗', link: '/components/smodal' },
            { text: 'SDrawer 抽屉', link: '/components/sdrawer' },
            { text: 'SMessage 消息', link: '/components/smessage' },
          ],
        },
        {
          text: '通用',
          items: [
            { text: 'SCard 卡片', link: '/components/scard' },
            { text: 'SContainer 容器', link: '/components/scontainer' },
            { text: 'SIcon 图标', link: '/components/sicon' },
          ],
        },
      ],
    },

    outline: {
      level: [2, 3],
      label: '本页目录',
    },

    search: {
      provider: 'local',
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/wwb-xigua/ds-ui' }],

    footer: {
      message: '基于 MIT 协议开源',
      copyright: 'ds-ui contributors',
    },

    docFooter: { prev: '上一页', next: '下一页' },
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '回到顶部',
  },
});
