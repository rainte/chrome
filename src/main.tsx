import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider, App } from 'antd'
import { RecoilRoot } from 'recoil'
import zhCN from 'antd/locale/zh_CN'
import 'antd/dist/reset.css'
import Children from './App'
import scss from './index.module.scss'
import './index.scss'

console.log('chrome', chrome)

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <RecoilRoot>
      <ConfigProvider prefixCls="antd" locale={zhCN} theme={{ cssVar: true, hashed: false }}>
        <App className={scss.app}>
          <Children />
        </App>
      </ConfigProvider>
    </RecoilRoot>
  </React.StrictMode>
)
