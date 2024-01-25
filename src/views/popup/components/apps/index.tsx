import { Row, Col, Button, Statistic } from 'antd'
import Dragg, { DraggItemProps, useSortable, draggStyle } from '@/components/Dragg'
import { BookOutlined, CloudOutlined } from '@ant-design/icons'
import route from '@/utils/route'

type Item = {
  id: number
  text: string
  url?: string
}

export default () => {
  const items: DraggItemProps[] = [
    { id: 1, text: 'Json', url: '/options?tab=json' },
    { id: 2, text: '书签', url: '/options?tab=bookmark' }
  ]

  const DraggItem = (props: Item) => {
    const { id, text, url } = props
    const { listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
    const style = draggStyle({ transform, isDragging, transition })

    return (
      <Col
        span={12}
        ref={setNodeRef}
        style={style}
        onClick={() => url && route.toCrxTab(url)}
        {...listeners}
      >
        <Button block>{text}</Button>
      </Col>
    )
  }

  return (
    <Row gutter={[10, 5]}>
      <Dragg items={items} dom={DraggItem} />
      <Col span={7} offset={5} title="云端">
        <Statistic prefix={<CloudOutlined />} value={112893} />
      </Col>
      <Col span={7} title="本地">
        <Statistic prefix={<BookOutlined />} value={112893} />
      </Col>
    </Row>
  )
}
