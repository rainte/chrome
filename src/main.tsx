import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider, App } from 'antd'
import { RecoilRoot } from 'recoil'
import Children from './App'
import zhCN from 'antd/locale/zh_CN'
import scss from './index.module.scss'
import 'antd/dist/reset.css'
import './index.scss'

console.log('chrome', chrome)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RecoilRoot>
      <ConfigProvider locale={zhCN} theme={{ cssVar: true, hashed: false }}>
        <App className={scss.app}>
          <Children />
        </App>
      </ConfigProvider>
    </RecoilRoot>
  </React.StrictMode>
)
