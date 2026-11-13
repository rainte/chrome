import React from 'react'
import ReactDOM from 'react-dom/client'
import { tabState } from '@/utils/storage'

const state = await tabState.getValue()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: `url(${state.cover})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    />
  </React.StrictMode>
)
