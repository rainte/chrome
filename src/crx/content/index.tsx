import ReactDOM from 'react-dom/client'
import Home from '@/views/home'

console.log('content')

// 向页面插入内容.
const app = document.createElement('div')
app.id = 'CRX-Rainte'
document.body.appendChild(app)
const crx = ReactDOM.createRoot(app)
crx.render(<Home />)

// 向页面插入脚本.
let script = document.createElement('script')
script.setAttribute('type', 'text/javascript')
script.src = chrome.runtime.getURL('insert.js')
document.body.appendChild(script)
