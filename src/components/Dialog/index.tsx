import { Modal, ModalFuncProps } from 'antd'
import { i18n } from '@/utils/browser'

export default {
  confirm: (props: ModalFuncProps) => {
    const { title, content, ...attrs } = props

    Modal.confirm({
      title: title || i18n.get('confirmTitle'),
      content: content || i18n.get('confirmContent'),
      ...attrs
    })
  }
}
