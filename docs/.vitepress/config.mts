import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitepress'

const docsDir = dirname(fileURLToPath(import.meta.url))
const phenodocsRoot = resolve(docsDir, '../../../phenodocs')
const phenodocsTheme = resolve(phenodocsRoot, '.vitepress/theme/index.ts')

export default defineConfig({
  title: 'Phenotype Design',
  description: 'Keycap palette — design tokens and style guide',
  lang: 'en-US',
  cleanUrls: true,
  appearance: 'dark',

  vite: {
    resolve: {
      alias: {
        '@phenodocs-theme': phenodocsTheme,
      },
    },
    server: {
      fs: {
        allow: [phenodocsRoot],
      },
    },
  },

  themeConfig: {
    siteTitle: 'Phenotype Design',

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Tokens', link: '/tokens/colors' },
      { text: 'Components', link: '/components/badges' },
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Usage', link: '/guide/usage' },
        ]
      },
      {
        text: 'Tokens',
        items: [
          { text: 'Colors', link: '/tokens/colors' },
          { text: 'Typography', link: '/tokens/typography' },
        ]
      },
      {
        text: 'Components',
        items: [
          { text: 'Badges', link: '/components/badges' },
          { text: 'Cards & Pipeline', link: '/components/cards' },
        ]
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/KooshaPari/phenotype-design' }
    ],

    footer: {
      message: 'MIT License',
      copyright: '© 2025 Phenotype',
    },

    search: { provider: 'local' },

    outline: { level: [2, 3] },
  },

  markdown: {
    lineNumbers: true,
    theme: { light: 'github-light', dark: 'vitesse-dark' },
  },
})
