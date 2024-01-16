import { App } from 'antd'
import type { MessageInstance } from 'antd/es/message/interface'
import type { ModalStaticFunctions } from 'antd/es/modal/confirm'
import type { NotificationInstance } from 'antd/es/notification/interface'

let message: MessageInstance
let notification: NotificationInstance
let modal: Omit<ModalStaticFunctions, 'warn'>

export default () => {
  const staticFunction = App.useApp()
  message = staticFunction.message
  modal = staticFunction.modal
  notification = staticFunction.notification
  console.log(123)
  return null
}

export { message, notification, modal }

// import { Modal, ModalFuncProps } from 'antd'
// import { i18n } from '@/utils/browser'

// export default {
//   confirm: (props: ModalFuncProps) => {
//     const { title, content, ...attrs } = props

//     Modal.confirm({
//       title: title || '提示',
//       content: content || '确认操作？',
//       ...attrs
//     })
//   }
// }
