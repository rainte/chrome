import { CHAPTER_RE, readFile, type EpubResult } from '@/lib/epub'
import { cardStyles } from '@/utils/misc'
import { readerScrollState, readerState } from '@/utils/storage'
import { antd } from '@rainte/ant'
import {
  Button,
  Card,
  Divider,
  Drawer,
  Empty,
  Flex,
  Input,
  Segmented,
  Space,
  Spin,
  Tag,
  Typography,
  Upload
} from 'antd'
import type { RcFile } from 'antd/es/upload'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AiOutlineFullscreen, AiOutlineMenu, AiOutlineUpload } from 'react-icons/ai'
import { THEMES, Theme, clearBook, loadBook, saveBook } from './actions'

const { Text } = Typography

export default function Reader() {
  const [chapterPattern, setChapterPattern] = useState(CHAPTER_RE)
  const [loading, setLoading] = useState(false)
  const [hydrated, setHydrated] = useState(false) // 首次从存储恢复完成
  const [book, setBook] = useState<EpubResult | null>(null)
  const [theme, setTheme] = useState<Theme>(Theme.Light)
  const [fontSize, setFontSize] = useState(16)
  const [navOpen, setNavOpen] = useState(false)
  const [currentChapter, setCurrentChapter] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const contentRef = useRef<HTMLDivElement>(null)
  const fullscreenRef = useRef<HTMLDivElement>(null)
  const saveTimer = useRef<number | null>(null)

  const themeConf = THEMES[theme]
  const chapters = book?.chapters ?? []
  const [currentTitle = '', currentContent = ''] = chapters[currentChapter] ?? []

  const paragraphs = useMemo<string[]>(() => {
    if (!currentContent) return []
    return currentContent
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean)
  }, [currentContent])

  const loadCache = async (ref: { cancelled: boolean }) => {
    setLoading(true)
    try {
      const state = await readerState.getValue()

      if (!ref.cancelled) {
        setTheme(state.theme)
        setFontSize(state.fontSize)
      }

      const b = await loadBook()
      if (!ref.cancelled && b) {
        setBook(b)
        setCurrentChapter(state.chapter)
      }
    } catch (e) {
      console.warn('恢复阅读状态失败', e)
    } finally {
      if (!ref.cancelled) {
        setLoading(false)
        setHydrated(true)
      }
    }
  }

  const loadCacheScroll = async (ref: { cancelled: boolean }) => {
    const ratio = await readerScrollState.getValue()
    if (ref.cancelled || ratio < 0) return
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (ref.cancelled) return
        const el = contentRef.current // ← 在滚动前重新取
        if (!el) return
        const max = el.scrollHeight - el.clientHeight
        el.scrollTo({ top: ratio * max, behavior: 'auto' })
      })
    })
  }

  useEffect(() => {
    const ref = { cancelled: false }
    loadCache(ref)
    return () => {
      ref.cancelled = true
    }
  }, [])

  useEffect(() => {
    const ref = { cancelled: false }
    loadCacheScroll(ref)
    return () => {
      ref.cancelled = true
    }
  }, [paragraphs])

  useEffect(() => {
    if (hydrated) readerState.setValue({ theme, fontSize, chapter: currentChapter })
  }, [theme, fontSize, currentChapter, hydrated])

  useEffect(() => {
    if (!hydrated) return
    if (book) saveBook(book)
    else clearBook()
  }, [book, hydrated])

  useEffect(() => {
    if (hydrated && !isFullscreen) onScroll()
  }, [isFullscreen, hydrated])

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const onFullscreen = async () => {
    if (!fullscreenRef.current) return
    try {
      if (!document.fullscreenElement) {
        await fullscreenRef.current.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch {
      antd.message.error('当前浏览器不支持全屏')
    }
  }

  const goChapter = async (idx: number) => {
    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current)
      saveTimer.current = null
    }

    await readerScrollState.setValue(0)
    setCurrentChapter(idx)
    requestAnimationFrame(() => contentRef.current?.scrollTo({ top: 0 }))
  }

  const onScroll = () => {
    if (!book) return
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      const el = contentRef.current
      if (!el) return
      const max = el.scrollHeight - el.clientHeight
      const ratio = max > 0 ? el.scrollTop / max : 0
      readerScrollState.setValue(ratio)
    }, 300)
  }

  const UploadDragger = () => (
    <Upload.Dragger
      accept=".txt,.epub"
      showUploadList={false}
      styles={{ root: { height: '100%' } }}
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
          setCurrentChapter(0)
          await readerScrollState.setValue(0)
          setBook(await readFile(info.file.originFileObj!, { chapterPattern }))
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e)
          antd.message.error(`读取失败：${msg}`)
        } finally {
          setLoading(false)
        }
      }}
    >
      <Space vertical>
        <AiOutlineUpload size={44} />
        <Text>点击或拖拽 .txt / .epub 文件到这里</Text>
        <Text type="secondary">TXT 自动识别 UTF-8 / GBK</Text>
      </Space>
    </Upload.Dragger>
  )

  const renderContent = () => {
    if (loading) {
      return (
        <Flex justify="center" align="center">
          <Spin fullscreen />
        </Flex>
      )
    } else if (!book) {
      return (
        <Flex vertical gap={9} style={{ height: '100%' }}>
          <Input.TextArea
            rows={3}
            value={chapterPattern}
            placeholder="章节正则"
            onChange={(e) => setChapterPattern(e.target.value)}
          />
          <UploadDragger />
        </Flex>
      )
    } else if (!chapters.length) {
      return <Empty description="没有可阅读的章节" />
    }

    return (
      <Flex
        ref={contentRef}
        onScroll={onScroll}
        style={{
          fontSize,
          flexDirection: 'column',
          height: isFullscreen ? '100vh' : '100%',
          overflowY: 'auto',
          padding: isFullscreen ? 80 : 36,
          background: book ? themeConf.bg : THEMES[Theme.Light].bg,
          color: themeConf.text,
          transition: 'background 0.2s, color 0.2s'
        }}
      >
        {paragraphs.map((row) =>
          row.split('\n').map((line, i) => (
            <p key={i} style={{ textIndent: '2em' }}>
              {line}
            </p>
          ))
        )}
      </Flex>
    )
  }

  const LeftToolbar = () => (
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
      <Button icon={<AiOutlineFullscreen />} onClick={onFullscreen} />
    </Space>
  )

  const RightToolbar = () => (
    <Space>
      <Button onClick={() => setBook(null)}>清空</Button>
    </Space>
  )

  const LeftHeader = ({ book }: { book: EpubResult }) => (
    <Space>
      <Tag color="blue">{book.kind.toUpperCase()}</Tag>
      <Text strong>《{book.title}》</Text>
      <Text type="secondary">{book.author}</Text>
      <Text type="secondary">【{currentTitle}】</Text>
    </Space>
  )

  const RightHeader = () => (
    <Space>
      <Button
        type="link"
        disabled={currentChapter <= 0}
        onClick={() => goChapter(Math.max(0, currentChapter - 1))}
      >
        上一章
      </Button>
      <Text type="secondary">
        {currentChapter + 1} / {chapters.length}
      </Text>
      <Button
        type="link"
        disabled={currentChapter >= chapters.length - 1}
        onClick={() => goChapter(Math.min(chapters.length - 1, currentChapter + 1))}
      >
        下一章
      </Button>
    </Space>
  )

  return (
    <>
      <Flex vertical gap={8} flex={1} style={{ height: '100%' }}>
        {book && <Card title={<LeftToolbar />} extra={<RightToolbar />}></Card>}
        <Card
          ref={fullscreenRef}
          size="small"
          styles={cardStyles}
          title={book && <LeftHeader book={book} />}
          extra={book && <RightHeader />}
        >
          {renderContent()}
        </Card>
      </Flex>

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
                setNavOpen(false)
                goChapter(i)
              }}
            >
              <Text>{ch[0]}</Text>
            </Button>
          ))}
        </Flex>
      </Drawer>
    </>
  )
}
