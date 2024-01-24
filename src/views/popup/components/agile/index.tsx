import { Flex, Button } from 'antd'
import Dragg, { DraggItemProps, useSortable, draggStyle } from '@/components/Dragg'
import scss from './index.module.scss'
import route from '@/utils/route'

type Item = {
  id: number
  text: string
  url?: string
}

export default () => {
  const items: DraggItemProps[] = [
    { id: 1, text: 'Json', url: '/options?tab=json' },
    { id: 2, text: '书签', url: '/options?tab=bookmark' },
    { id: 3, text: 'Tag 3' },
    { id: 4, text: 'Tag 4' },
    { id: 5, text: 'Tag 5' },
    { id: 6, text: 'Tag 6' },
    { id: 7, text: 'Tag 7' },
    { id: 8, text: 'Tag 8' }
  ]

  const DraggItem = (props: Item) => {
    const { id, text, url } = props
    const { listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
    const style = draggStyle({ transform, isDragging, transition })

    return (
      <Flex
        className={scss.draggItem}
        ref={setNodeRef}
        style={style}
        onClick={() => url && route.toCrxTab(url)}
        {...listeners}
      >
        <Button block>{text}</Button>
      </Flex>
    )
  }

  return (
    <Flex className={scss.page} justify="space-between" wrap="wrap">
      <Dragg items={items} dom={DraggItem} />
    </Flex>
  )
}
