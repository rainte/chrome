import { useState, useEffect } from 'react'
import { Row, Col, Flex, Typography } from 'antd'
import Dragg, { useSortable, draggStyle } from '@/components/Dragg'
import { BookOutlined, CodeOutlined } from '@ant-design/icons'
import route from '@/utils/route'
import * as bookmark from '@/services/bookmark'

type Item = {
  id: number
  text: JSX.Element
  url?: string
}

export default () => {
  const [localTotal, setLocalTotal] = useState(0)
  const [cloudTotal, setCloudTotal] = useState(0)

  useEffect(() => {
    bookmark
      .total()
      .then((res: any[]) => {
        setLocalTotal(res[0])
        setCloudTotal(res[1])
      })
      .catch(() => {
        setLocalTotal(88)
        setCloudTotal(88)
      })
  }, [])

  const items: Item[] = [
    {
      id: 1,
      text: (
        <Flex gap="small">
          <CodeOutlined />
          <Typography.Text>Json</Typography.Text>
        </Flex>
      ),
      url: '/options?tab=json'
    },
    {
      id: 2,
      text: (
        <Flex gap="small">
          <BookOutlined />
          <Typography.Text>书签</Typography.Text>
          <Typography.Text>
            {cloudTotal} / {localTotal}
          </Typography.Text>
        </Flex>
      ),
      url: '/options?tab=bookmark'
    }
  ]

  const dom = (items: Item[]) => {
    return items.map((item) => {
      const { text, url } = item
      return (
        <Col span={12} onClick={() => url && route.toCrxTab(url)}>
          {cell(text)}
        </Col>
      )
    })
  }

  const DraggItem = (props: Item) => {
    const { id, text } = props
    const { listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
    const style = draggStyle({ transform, isDragging, transition })

    return (
      <Col span={12} ref={setNodeRef} style={style} {...listeners}>
        {cell(text)}
      </Col>
    )
  }

  const cell = (text: JSX.Element) => (
    <Typography.Link>
      <Flex
        align="center"
        justify="center"
        style={{
          padding: '0.2rem',
          background: 'var(--ant-color-bg-base)',
          borderRadius: 'var(--ant-border-radius)'
        }}
      >
        {text}
      </Flex>
    </Typography.Link>
  )

  return <Row gutter={[10, 5]}>{dom(items) && <Dragg items={items} dom={DraggItem} />}</Row>
}
