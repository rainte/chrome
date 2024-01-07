import { useState } from 'react'
import { Row, Col, Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import Draggable, { DraggableItemProps, DraggableElementProps } from '@/components/Draggable'

type Item = {
  id: number
  text: string
  url?: string
}

const Element: DraggableElementProps<Item> = (props) => {
  const { text, url } = props
  const navigate = useNavigate()

  return (
    <Col onClick={() => navigate(url as string)} span={6}>
      <Button block>{text}</Button>
    </Col>
  )
}

export default () => {
  const items: DraggableItemProps<Item>[] = [
    { id: 1, text: 'Tag 1' },
    { id: 2, text: 'Tag 2' },
    { id: 3, text: 'Tag 2' }
  ]

  return (
    <Row gutter={[16, 16]}>
      <Draggable<Item> items={items} Element={Element} />
    </Row>
  )
}
