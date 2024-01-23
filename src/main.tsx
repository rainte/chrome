import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider, App } from 'antd'
import Children from './App'
import zhCN from 'antd/locale/zh_CN'
import 'antd/dist/reset.css'
import './index.scss'

console.log('chrome', chrome)
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <App className="root-app">
        <Children />
      </App>
    </ConfigProvider>
  </React.StrictMode>
)
