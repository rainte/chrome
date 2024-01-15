import { Flex, Button } from 'antd'
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
    <Flex onClick={() => navigate(url as string)} style={style} ref={setNodeRef} {...listeners}>
      <Button block>{text}</Button>
    </Flex>
  )
}

export default () => {
  const items: DraggItemProps[] = [
    { id: 1, text: 'Tag 1' },
    { id: 2, text: 'Tag 2' },
    { id: 3, text: 'Tag 3' }
  ]

  return (
    <Flex>
      <Dragg items={items} Element={Element} />
    </Flex>
  )
}
