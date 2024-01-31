console.log('content')

// 向页面插入脚本.
let script = document.createElement('script')
script.setAttribute('type', 'text/javascript')
script.src = chrome.runtime.getURL('insert.js')
document.body.appendChild(script)
