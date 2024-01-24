import ReactDOM from 'react-dom/client'
import Popup from '@/views/popup'

console.log('content')

// 向页面插入内容.
const app = document.createElement('div')
app.id = 'root-crx'
document.body.appendChild(app)
const crx = ReactDOM.createRoot(app)
crx.render(<Popup />)

// 向页面插入脚本.
let script = document.createElement('script')
script.setAttribute('type', 'text/javascript')
script.src = chrome.runtime.getURL('insert.js')
document.body.appendChild(script)
