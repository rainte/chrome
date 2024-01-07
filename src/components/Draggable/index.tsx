import { useState } from 'react'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import type { DragEndEvent, UniqueIdentifier } from '@dnd-kit/core/dist/types/index'

export type DraggableElementProps<T = Record<string, any>> = (
  props: T & Record<string, any>
) => JSX.Element
export type DraggableItemProps<T = Record<string, any>> = {
  attrs: {id:UniqueIdentifier} & T
  Element?: DraggableElementProps
}
export type DraggableProps = {
  items: DraggableItemProps<any>[]
  Element: DraggableElementProps
}

const DraggableItem = <T,>(props: DraggableItemProps<T>) => {
  const { attrs, Element, } = props
  const { listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id:attrs.id })

  let style = { cursor: 'move', transition: 'unset' }
  transform &&
    (style = Object.assign(style, {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      transition: isDragging ? 'unset' : transition
    }))

  if (Element != undefined) {
    return <Element {...attrs} style={style} ref={setNodeRef} {...listeners}  />
  }
}

export default <T,>(props: DraggableProps) => {
  const { items: init, Element } = props
  const [items, setItems] = useState<DraggableItemProps<T>[]>(init)

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

  const context = items.map((item) => (
    <DraggableItem<T>  attrs={item} Element={Element} key={item.id} />
  ))

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
      <SortableContext items={items} strategy={horizontalListSortingStrategy}>
        {context}
      </SortableContext>
    </DndContext>
  )
}
