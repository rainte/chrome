import React from 'react'
import ReactDOM from 'react-dom/client'
import { RecoilRoot } from 'recoil'
import { ConfigProvider, App } from 'antd'
import Children from './App'
import 'antd/dist/reset.css'
import './index.scss'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RecoilRoot>
      <ConfigProvider>
        <App className="root-app">
          <Children />
        </App>
      </ConfigProvider>
    </RecoilRoot>
  </React.StrictMode>
)
