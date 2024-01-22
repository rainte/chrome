import { App } from 'antd'
import type { MessageInstance, JointContent } from 'antd/es/message/interface'
import type { ModalStaticFunctions } from 'antd/es/modal/confirm'
import type { NotificationInstance } from 'antd/es/notification/interface'
import type { ModalFuncProps } from 'antd/es/modal/interface'
import i18n from './i18n'

let message: MessageInstance
let notification: NotificationInstance
let modal: Omit<ModalStaticFunctions, 'warn'>

export default () => {
  const staticFunction = App.useApp()
  message = staticFunction.message
  modal = staticFunction.modal
  notification = staticFunction.notification
  return null
}

const popup = {
  confirm: (props: ModalFuncProps) => {
    return modal.confirm({
      title: i18n.get('modalConfirmTitle'),
      content: i18n.get('modalConfirmContent'),
      ...props
    })
  },
  success: (content?: JointContent, duration?: number | VoidFunction, onClose?: VoidFunction) => {
    content = content || i18n.get('messageSuccess')
    return message.success(content, duration, onClose)
  }
}

export { message, notification, modal, popup }
