import { App } from 'antd'
import type { MessageInstance, JointContent } from 'antd/es/message/interface'
import type { ModalStaticFunctions } from 'antd/es/modal/confirm'
import type { NotificationInstance } from 'antd/es/notification/interface'
import type { ModalFuncProps } from 'antd/es/modal/interface'
import { system } from '@rainte/js'
import crx from '@/utils/crx'

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
      title: crx.i18n.get('modalConfirmTitle'),
      content: crx.i18n.get('modalConfirmContent'),
      ...props
    })
  },
  success: (content?: JointContent, duration?: number | VoidFunction) => {
    content = content || crx.i18n.get('messageSuccess')
    return message.success(content, duration)
  },
  error: (content?: string, duration?: number | VoidFunction) => {
    content = content || crx.i18n.get('messageError')
    message.error(content, duration)
    system.fail(content)
  },
  ask: function (onOk: (...args: any[]) => any, props?: ModalFuncProps) {
    return this.confirm({ onOk, ...props })
  }
}

export { message, notification, modal, popup }
