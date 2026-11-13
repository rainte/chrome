import { defineConfig } from 'wxt'

const icons = {
  16: '/icon/favicon.png',
  32: '/icon/favicon.png',
  48: '/icon/favicon.png',
  128: '/icon/favicon.png'
}

// See https://wxt.dev/api/reference/wxt/interfaces/inlineconfig.html
export default defineConfig({
  srcDir: 'src',
  imports: false,
  outDirTemplate: 'rainte',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Rainte',
    description: 'Rainte Chrome CRX',
    default_locale: 'zh_CN',
    icons,
    permissions: ['storage', 'proxy', 'bookmarks', 'tabs'],
    host_permissions: ['<all_urls>'],
    action: {
      default_icon: icons,
      default_title: 'Rainte'
    },
    web_accessible_resources: [
      {
        resources: ['icon/*.png'],
        matches: ['<all_urls>']
      }
    ]
  }
})
