import { Flex, Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import Dragg, { DraggItemProps, useSortable, draggStyle } from '@/components/Dragg'
import scss from './index.module.scss'

type Item = {
  id: number
  text: string
  url?: string
}

export default () => {
  const items: DraggItemProps[] = [
    { id: 1, text: 'Tag 1' },
    { id: 2, text: 'Tag 2' },
    { id: 3, text: 'Tag 3' },
    { id: 4, text: 'Tag 4' },
    { id: 5, text: 'Tag 5' },
    { id: 6, text: 'Tag 6' },
    { id: 7, text: 'Tag 7' },
    { id: 8, text: 'Tag 8' }
  ]

  const DraggItem = (props: Item) => {
    const { id, text, url } = props
    const navigate = useNavigate()
    const { listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
    const style = draggStyle(transform, isDragging, transition)

    return (
      <Flex
        className={scss.draggItem}
        ref={setNodeRef}
        style={style}
        onClick={() => url && navigate(url)}
        {...listeners}
      >
        <Button block>{text}</Button>
      </Flex>
    )
  }

  return (
    <Flex className={scss.page} justify="center" wrap="wrap">
      <Dragg items={items} dom={DraggItem} />
    </Flex>
  )
}
