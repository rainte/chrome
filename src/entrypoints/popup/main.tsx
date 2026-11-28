import { usePrefersDark } from '@/hooks/usePrefersDark'
import { antd } from '@rainte/ant'
import { ConfigProvider, theme } from 'antd'
import 'antd/dist/reset.css'
import zhCN from 'antd/locale/zh_CN'
import React from 'react'
import ReactDOM from 'react-dom/client'
import '../index.css'
import App from './App'

antd.addErrorListener()

function ThemedApp() {
  const isDark = usePrefersDark()

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{ hashed: false, algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm }}
    >
      <App />
    </ConfigProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemedApp />
  </React.StrictMode>
)
