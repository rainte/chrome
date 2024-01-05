import { useState } from 'react'
import { Row, Col, Button } from 'antd'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent, UniqueIdentifier } from '@dnd-kit/core/dist/types/index'
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'

export type DraggableProps = { items: DraggableItemProps[], element:JSX.Element }
export type DraggableItemProps = { id: UniqueIdentifier, element:JSX.Element } & Record<string, any>

const DraggableItem = (props: DraggableItemProps) => {
  const { id, element } = props
  const { listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  let style = { cursor: 'move', transition: 'unset' }
  transform &&
    (style = Object.assign(style, {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      transition: isDragging ? 'unset' : transition
    }))

  return ({context}
    // <element style={style}  ref={setNodeRef} {...listeners}/>
    //   style={style}
    //   ref={setNodeRef}
    //   {...listeners}
    // >
    //   <Button block>{text}</Button>
    // </Col>
  )
}

export default (props: DraggableProps) => {
  const { items: init, element } = props
  const [items, setItems] = useState<DraggableItemProps[]>(init)

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

    const context = items.map((item) => <DraggableItem {...item} element={element} key={item.id} />)

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
      <SortableContext items={items} strategy={horizontalListSortingStrategy}>
        {context}
      </SortableContext>
    </DndContext>
  )
}
