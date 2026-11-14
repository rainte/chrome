import { useMemo, useState } from 'react'
import { Button, Divider, Flex, Input, Space, Splitter, Typography } from 'antd'
import { JsonView, collapseAllNested } from 'react-json-view-lite'
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

  const parsed = useMemo(() => tryParse(text), [text])
  const displayData = useMemo(
    () => (parsed ? (sortOn ? sortJson(parsed) : parsed) : null),
    [parsed, sortOn]
  )

  const remountView = () => setViewKey((k) => k + 1)

  const handleFormatToggle = () => {
    const next = formatted ? tryMinify(text) : tryFormat(text)
    if (next === null) return
    setText(next)
    setFormatted((f) => !f)
  }

  return (
    <Splitter style={{ height: '80vh' }}>
      <Splitter.Panel min="20%" defaultSize="50%">
        <Flex vertical style={{ height: '100%' }}>
          <Space>
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
                {expandAll ? '全部折叠' : '全部展开'}
              </Button>
            </Space.Compact>
            {!parsed && text.trim() && <Text type="danger">JSON 无效</Text>}
          </Space>

          <Divider size="small"></Divider>

          <div style={{ overflow: 'auto' }}>
            <JsonView
              key={`${viewKey}-${sortOn}`}
              data={displayData ?? {}}
              shouldExpandNode={expandAll ? () => true : collapseAllNested}
            />
          </div>
        </Flex>
      </Splitter.Panel>

      <Splitter.Panel min="20%">
        <Flex vertical style={{ height: '100%' }}>
          <Space.Compact>
            <Button onClick={handleFormatToggle}>{formatted ? '压缩' : '美化'}</Button>
          </Space.Compact>

          <Divider size="small"></Divider>

          <Input.TextArea
            value={text}
            spellCheck={false}
            placeholder="在此输入 JSON"
            onChange={(e) => {
              setText(e.target.value)
              setFormatted(false)
            }}
            style={{ flex: 1, border: 'none', padding: 12 }}
          />
        </Flex>
      </Splitter.Panel>
    </Splitter>
  )
}
