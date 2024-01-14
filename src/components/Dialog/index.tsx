import { Modal, ModalFuncProps } from 'antd'

export default {
  confirm: (props: ModalFuncProps) => {
    const { title, content, ...attrs } = props

    Modal.confirm({
      title: title || '提示',
      content: content || '确认操作？',
      ...attrs
    })
  }
}
