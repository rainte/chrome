import { usePrefersDark } from '@/hooks/usePrefersDark'
import { cardStyles } from '@/utils/misc'
import { Button, Card, Input, Space, Splitter, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { JsonView, collapseAllNested, darkStyles, defaultStyles } from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'

const { Text } = Typography

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

const tryFormat = (text: string): string | null => {
  try {
    return JSON.stringify(JSON.parse(text), null, 2)
  } catch {
    return null
  }
}

const tryMinify = (text: string): string | null => {
  try {
    return JSON.stringify(JSON.parse(text))
  } catch {
    return null
  }
}

const tryParse = (text: string): JsonValue | null => {
  if (!text.trim()) return null
  try {
    return JSON.parse(text) as JsonValue
  } catch {
    return null
  }
}

function sortJson(value: JsonValue): JsonValue {
  if (value === null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map((v) => sortJson(v))
  const entries = Object.entries(value).sort(([a], [b]) => a.localeCompare(b))
  const result: Record<string, JsonValue> = {}
  for (const [k, v] of entries) result[k] = sortJson(v)
  return result
}

export default function Json() {
  const [text, setText] = useState('')
  const [sortOn, setSortOn] = useState(false)
  const [expandAll, setExpandAll] = useState(false)
  const [formatted, setFormatted] = useState(false)
  const [viewKey, setViewKey] = useState(0)
  const isDark = usePrefersDark()

  const parsed = useMemo(() => tryParse(text), [text])
  const displayData = useMemo(
    () => (parsed ? (sortOn ? sortJson(parsed) : parsed) : null),
    [parsed, sortOn]
  )

  const remountView = () => setViewKey((k) => k + 1)

  const onFormatToggle = () => {
    const next = formatted ? tryMinify(text) : tryFormat(text)
    if (next === null) return
    setText(next)
    setFormatted((f) => !f)
  }

  const LeftToolbar = () => (
    <Space.Compact>
      <Button
        onClick={() => {
          setSortOn((s) => !s)
          remountView()
        }}
      >
        {sortOn ? '原序' : '排序'}
      </Button>
      <Button
        onClick={() => {
          setExpandAll((e) => !e)
          remountView()
        }}
      >
        {expandAll ? '折叠' : '展开'}
      </Button>
    </Space.Compact>
  )

  const RightToolbar = () => (
    <Space.Compact>
      <Button onClick={onFormatToggle}>{formatted ? '压缩' : '美化'}</Button>
      <Button onClick={() => setText('')}>清空</Button>
    </Space.Compact>
  )

  return (
    <Splitter>
      <Splitter.Panel min="30%" defaultSize="50%">
        <Card
          title={<LeftToolbar />}
          styles={cardStyles}
          extra={!parsed && text.trim() && <Text type="danger">JSON 无效</Text>}
        >
          <JsonView
            style={{ ...(isDark ? darkStyles : defaultStyles), container: '' }}
            key={`${viewKey}-${sortOn}`}
            data={displayData ?? {}}
            shouldExpandNode={expandAll ? () => true : collapseAllNested}
          />
        </Card>
      </Splitter.Panel>

      <Splitter.Panel min="30%">
        <Card title={<RightToolbar />} styles={cardStyles}>
          <Input.TextArea
            value={text}
            spellCheck={false}
            placeholder="在此输入 JSON"
            onChange={(e) => {
              setText(e.target.value)
              setFormatted(false)
            }}
            style={{ flex: 1 }}
          />
        </Card>
      </Splitter.Panel>
    </Splitter>
  )
}
