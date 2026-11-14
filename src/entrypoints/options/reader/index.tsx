import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Button,
  Card,
  Divider,
  Drawer,
  Empty,
  Flex,
  Segmented,
  Space,
  Spin,
  Tag,
  Typography,
  Upload
} from 'antd'
import { readFilePreview, type FilePreview } from '@/lib/epub'
import { antd } from '@rainte/ant'
import type { RcFile } from 'antd/es/upload'
import {
  AiOutlineFullscreen,
  AiOutlineFullscreenExit,
  AiOutlineMenu,
  AiOutlineUpload
} from 'react-icons/ai'
import { THEMES, Theme, splitPreviewChapters, type ChapterItem } from './actions'

const { Text } = Typography

export default function Reader() {
  const [loading, setLoading] = useState(false)
  const [book, setBook] = useState<FilePreview | null>(null)
  const [theme, setTheme] = useState<Theme>(Theme.Light)
  const [fontSize, setFontSize] = useState(16)
  const [navOpen, setNavOpen] = useState(false)
  const [currentChapter, setCurrentChapter] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const contentRef = useRef<HTMLDivElement>(null)

  const chapters = useMemo<ChapterItem[]>(() => {
    if (!book) return []
    return splitPreviewChapters(book.text)
  }, [book])

  const themeConf = THEMES[theme]
  const currentTitle = chapters[currentChapter]?.title ?? ''
  const currentContent = chapters[currentChapter]?.content ?? ''

  const paragraphs = useMemo<string[]>(() => {
    if (!currentContent) return []
    return currentContent
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean)
  }, [currentContent])

  const toggleFullscreen = useCallback(async () => {
    if (!contentRef.current) return
    try {
      if (!document.fullscreenElement) {
        await contentRef.current.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch {
      antd.message.error('当前浏览器不支持全屏')
    }
  }, [])

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const UploadDragger = (
    <Upload.Dragger
      accept=".txt,.epub"
      showUploadList={false}
      beforeUpload={async (f: RcFile) => {
        const lower = f.name.toLowerCase()
        if (!lower.endsWith('.txt') && !lower.endsWith('.epub')) {
          antd.message.error('只支持 .txt 或 .epub 文件')
          return Upload.LIST_IGNORE
        }
      }}
      onChange={async (info) => {
        try {
          setLoading(true)
          setBook(null)
          setCurrentChapter(0)
          setBook(await readFilePreview(info.file.originFileObj!))
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e)
          antd.message.error(`读取失败：${msg}`)
        } finally {
          setLoading(false)
        }
      }}
      onRemove={() => {
        setBook(null)
        setCurrentChapter(0)
      }}
    >
      <Space vertical>
        <AiOutlineUpload size={44} />
        <Text>点击或拖拽 .txt / .epub 文件到这里</Text>
        <Text type="secondary">TXT 自动识别 UTF-8 / GBK</Text>
      </Space>
    </Upload.Dragger>
  )

  const renderChapterContent = () => {
    if (loading) {
      return (
        <Flex align="center" justify="center">
          <Spin fullscreen />
        </Flex>
      )
    } else if (!book) {
      return UploadDragger
    } else if (!chapters.length) {
      return <Empty description="没有可阅读的章节" />
    }

    return (
      <div style={{ fontSize }}>
        {paragraphs.map((row) =>
          row.split('\n').map((line, j) => (
            <p key={j} style={{ textIndent: '2em' }}>
              {line}
            </p>
          ))
        )}
      </div>
    )
  }

  return (
    <Space vertical style={{ width: '100%' }}>
      <Card size="small">
        <Flex justify="space-between">
          <Space>
            <Button icon={<AiOutlineMenu />} onClick={() => setNavOpen(true)}>
              目录
            </Button>

            <Button
              icon={'A-'}
              onClick={() => setFontSize((s) => Math.max(12, s - 2))}
              disabled={fontSize <= 12}
            />

            <Button
              icon={'A+'}
              onClick={() => setFontSize((s) => Math.min(28, s + 2))}
              disabled={fontSize >= 28}
            />

            <Segmented
              value={theme}
              onChange={(v) => setTheme(v)}
              options={Object.entries(THEMES).map(([key, t]) => ({
                value: key as Theme,
                label: t.name
              }))}
            />

            <Button
              icon={isFullscreen ? <AiOutlineFullscreenExit /> : <AiOutlineFullscreen />}
              onClick={toggleFullscreen}
            />
          </Space>

          <Space>
            <Button onClick={() => setBook(null)}>清空</Button>
          </Space>
        </Flex>
      </Card>

      <Card
        size="small"
        title={
          book && (
            <Space>
              <Tag color="blue">{book.kind.toUpperCase()}</Tag>
              <Text strong>《{book.title}》</Text>
              <Text type="secondary">{book.author}</Text>
              <Text type="secondary">【{currentTitle}】</Text>
            </Space>
          )
        }
        extra={
          book && (
            <>
              <Button
                type="link"
                disabled={currentChapter <= 0}
                onClick={() => {
                  setCurrentChapter((i) => Math.max(0, i - 1))
                  contentRef.current?.scrollTo({ top: 0 })
                }}
              >
                上一章
              </Button>
              <Text type="secondary">
                {currentChapter + 1} / {chapters.length}
              </Text>
              <Button
                type="link"
                disabled={currentChapter >= chapters.length - 1}
                onClick={() => {
                  setCurrentChapter((i) => Math.min(chapters.length - 1, i + 1))
                  contentRef.current?.scrollTo({ top: 0 })
                }}
              >
                下一章
              </Button>
            </>
          )
        }
      >
        <div
          ref={contentRef}
          style={{
            maxHeight: isFullscreen ? '100vh' : '56vh',
            overflowY: 'auto',
            padding: isFullscreen ? 80 : 36,
            background: book ? themeConf.bg : THEMES[Theme.Light].bg,
            color: themeConf.text,
            transition: 'background 0.2s, color 0.2s'
          }}
        >
          {renderChapterContent()}
        </div>
      </Card>

      <Drawer
        title={
          <Flex align="center">
            <AiOutlineMenu />
            <Divider vertical />
            <Text>目录</Text>
          </Flex>
        }
        placement="left"
        open={navOpen}
        onClose={() => setNavOpen(false)}
      >
        <Flex vertical>
          {chapters.map((ch, i) => (
            <Button
              key={i}
              type={i === currentChapter ? 'primary' : 'text'}
              style={{ justifyContent: 'flex-start' }}
              onClick={() => {
                setCurrentChapter(i)
                setNavOpen(false)
                contentRef.current?.scrollTo({ top: 0 })
              }}
            >
              <Text>{ch.title}</Text>
            </Button>
          ))}
        </Flex>
      </Drawer>
    </Space>
  )
}
