import { type CardProps } from 'antd'

export const cardStyles: CardProps['styles'] = {
  root: { height: '100%', minHeight: '0', display: 'flex', flexDirection: 'column' },
  body: { flex: 1, minHeight: '0', display: 'flex', flexDirection: 'column', overflow: 'auto' }
}
