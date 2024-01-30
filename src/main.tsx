import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider, App } from 'antd'
import Children from './App'
import zhCN from 'antd/locale/zh_CN'
import 'antd/dist/reset.css'
import scss from './index.module.scss'
import './index.scss'

console.log('chrome', chrome)
import process from 'process'
window.process = process

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN} theme={{ cssVar: true, hashed: false }}>
      <App className={scss.app}>
        <Children />
      </App>
    </ConfigProvider>
  </React.StrictMode>
)
