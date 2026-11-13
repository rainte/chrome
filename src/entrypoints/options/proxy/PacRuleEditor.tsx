import { useState } from 'react'
import { Badge, Button, Input, Select, Space, Table } from 'antd'
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ProxyAction, type PacRule } from '@/utils/proxy'
import { AiOutlineHolder } from 'react-icons/ai'

interface RowProps extends React.HTMLAttributes<HTMLElement> {
  'data-row-key': string
}

function DraggableRow(props: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props['data-row-key']
  })

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging ? { position: 'relative', zIndex: 1, background: '#fafafa' } : {})
  }

  return <tr {...props} ref={setNodeRef} style={style} {...attributes} {...listeners} />
}

export default function PacRuleEditor({
  value = [],
  onChange
}: {
  value?: PacRule[]
  onChange?: (r: PacRule[]) => void
}) {
  const [pattern, setPattern] = useState('')
  const [action, setAction] = useState<ProxyAction>(ProxyAction.Proxy)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  const addRule = () => {
    const p = pattern.trim()
    if (!p || value.some((r) => r.pattern === p)) return
    onChange?.([...value, { pattern: p, action }])
    setPattern('')
  }

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = value.findIndex((r) => r.pattern === active.id)
    const newIndex = value.findIndex((r) => r.pattern === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    onChange?.(arrayMove(value, oldIndex, newIndex))
  }

  return (
    <Space vertical style={{ width: '100%' }}>
      <Space>
        <Input
          value={pattern}
          placeholder="域名，如 baidu.com"
          onChange={(e) => setPattern(e.target.value)}
        />
        <Select
          value={action}
          onChange={setAction}
          options={[
            { value: ProxyAction.Proxy, label: '代理' },
            { value: ProxyAction.Direct, label: '直连' }
          ]}
        />
        <Button onClick={addRule}>添加规则</Button>
      </Space>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={value.map((r) => r.pattern)} strategy={verticalListSortingStrategy}>
          <Table
            size="small"
            rowKey="pattern"
            pagination={false}
            dataSource={value}
            columns={[
              {
                width: 30,
                render: () => <AiOutlineHolder style={{ cursor: 'grab' }} />
              },
              { title: '域名', dataIndex: 'pattern' },
              {
                width: 60,
                title: '动作',
                dataIndex: 'action',
                render: (_: unknown, r: PacRule) => (
                  <Badge
                    status={r.action == ProxyAction.Proxy ? 'success' : 'default'}
                    text={r.action == ProxyAction.Proxy ? '代理' : '直连'}
                  />
                )
              },
              {
                width: 60,
                title: '操作',
                align: 'center',
                render: (_: unknown, r: PacRule) => (
                  <Button
                    type="link"
                    danger
                    onClick={() => onChange?.(value.filter((x) => x.pattern !== r.pattern))}
                  >
                    删除
                  </Button>
                )
              }
            ]}
            components={{ body: { row: DraggableRow } }}
          />
        </SortableContext>
      </DndContext>
    </Space>
  )
}
