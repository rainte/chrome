import { downloadBlob } from '@/lib/download'
import { cardStyles } from '@/utils/misc'
import { antd } from '@rainte/ant'
import { Button, Card, Input, Space, Splitter } from 'antd'
import 'github-markdown-css/github-markdown.css'
import { marked } from 'marked'
import { useMemo, useState } from 'react'
import { AiOutlineDownload } from 'react-icons/ai'
import { DEFAULT_MARKDOWN, toHtml } from './actions'

marked.setOptions({ breaks: true, gfm: true })

export default function MarkdownToHtml() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN)

  const html = useMemo(() => {
    try {
      return marked.parse(markdown) as string
    } catch (e) {
      return `<p style="color:red">解析错误: ${(e as Error).message}</p>`
    }
  }, [markdown])

  const onDownload = () => {
    const fullHtml = toHtml(html)
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' })
    downloadBlob(blob, `markdown-${new Date().toISOString().slice(0, 10)}.html`)
    antd.message.success('HTML 文件已开始下载')
  }

  return (
    <Splitter>
      <Splitter.Panel defaultSize="50%" min="30%">
        <Card
          title="Markdown 编辑"
          styles={cardStyles}
          extra={
            <Space.Compact>
              <Button onClick={() => setMarkdown('')}>清空</Button>
              <Button onClick={() => setMarkdown(DEFAULT_MARKDOWN)}>示例</Button>
            </Space.Compact>
          }
        >
          <Input.TextArea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="输入 Markdown 内容..."
            variant="borderless"
            style={{ height: '100%' }}
          />
        </Card>
      </Splitter.Panel>

      <Splitter.Panel defaultSize="50%" min="30%">
        <Card
          title="实时预览"
          styles={cardStyles}
          extra={
            <Space.Compact>
              <Button type="primary" icon={<AiOutlineDownload />} onClick={onDownload}>
                下载 HTML
              </Button>
            </Space.Compact>
          }
        >
          <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
        </Card>
      </Splitter.Panel>
    </Splitter>
  )
}
