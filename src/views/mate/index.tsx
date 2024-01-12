import { Row, Col, Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import Dragg, { DraggItemProps, useSortable, draggStyle } from '@/components/Dragg'

type Item = {
  id: number
  text: string
  url?: string
}

const Element = (props: Item) => {
  const { id, text, url } = props
  const navigate = useNavigate()
  const { listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = draggStyle(transform, isDragging, transition)

  return (
    <Col
      span={6}
      onClick={() => navigate(url as string)}
      style={style}
      ref={setNodeRef}
      {...listeners}
    >
      <Button block>{text}</Button>
    </Col>
  )
}

export default () => {
  const items: DraggItemProps[] = [
    { id: 1, text: 'Tag 1' },
    { id: 2, text: 'Tag 2' },
    { id: 3, text: 'Tag 3' }
  ]

  return (
    <Row gutter={[16, 16]}>
      <Dragg items={items} Element={Element} />
    </Row>
  )
}
