import { useState } from 'react'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import type { DragEndEvent, UniqueIdentifier } from '@dnd-kit/core/dist/types/index'

export { useSortable } from '@dnd-kit/sortable'
export type DraggItemProps = {
  id: UniqueIdentifier
} & Record<string, any>
export type DraggProps = {
  items: DraggItemProps[]
  dom: (props: any) => JSX.Element
}

export const draggStyle = (props: any) => {
  const { transform, isDragging, transition } = props
  let style = { cursor: 'move', transition: 'unset' }
  transform &&
    (style = Object.assign(style, {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      transition: isDragging ? 'unset' : transition
    }))
  return style
}

export default (props: DraggProps) => {
  const { items: init, dom: Dom } = props
  const [items, setItems] = useState<DraggItemProps[]>(init)

  const sensors = useSensors(useSensor(PointerSensor))
  const context = items.map((item) => <Dom {...item} key={item.id} />)

  const onDragEnd = (event: DragEndEvent) => {
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

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd} collisionDetection={closestCenter}>
      <SortableContext items={items} strategy={horizontalListSortingStrategy}>
        {context}
      </SortableContext>
    </DndContext>
  )
}
