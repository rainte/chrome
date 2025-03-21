import { App } from 'antd'
import type { MessageInstance, JointContent } from 'antd/es/message/interface'
import type { ModalStaticFunctions } from 'antd/es/modal/confirm'
import type { NotificationInstance } from 'antd/es/notification/interface'
import type { ModalFuncProps } from 'antd/es/modal/interface'
import { fast } from '@rainte/js'
import i18n from '@/utils/i18n'

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
  success: (content?: JointContent, duration?: number | VoidFunction) => {
    content = content || i18n.get('messageSuccess')
    return message.success(content, duration)
  },
  error: (content?: string, duration?: number | VoidFunction) => {
    content = content || i18n.get('messageError')
    message.error(content, duration)
    fast.fail(content)
  },
  ask: function (onOk: (...args: any[]) => any, props?: ModalFuncProps) {
    return this.confirm({ onOk, ...props })
  }
}

export { message, notification, modal, popup }
