import { useState } from 'react'
import { Row, Col, Button } from 'antd'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core/dist/types/index'
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { useNavigate } from 'react-router-dom'

type DraggableTagProps = { id: number; text: string; url?: string }

const DraggableTag = (props: DraggableTagProps) => {
  const navigate = useNavigate()
  const { id, text, url } = props
  const { listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  let style = { cursor: 'move', transition: 'unset' }
  transform &&
    (style = Object.assign(style, {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      transition: isDragging ? 'unset' : transition
    }))

  return (
    <Col
      onClick={() => navigate(url as string)}
      span={6}
      style={style}
      ref={setNodeRef}
      {...listeners}
    >
      <Button block>{text}</Button>
    </Col>
  )
}

export default () => {
  const [items, setItems] = useState<DraggableTagProps[]>([
    { id: 1, text: 'Tag 1' },
    { id: 2, text: 'Tag 2' },
    { id: 3, text: 'Tag 2' }
  ])

  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    if (active.id !== over.id) {
      setItems((data) => {
        const oldIndex = data.findIndex((item) => item.id === active.id)
        const newIndex = data.findIndex((item) => item.id === over.id)

        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  const context = items.map((item) => <DraggableTag {...item} key={item.id} />)

  return (
    <Row gutter={[16, 16]}>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <SortableContext items={items} strategy={horizontalListSortingStrategy}>
          {context}
        </SortableContext>
      </DndContext>
    </Row>
  )
}
