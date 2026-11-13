import { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import type { UploadFile } from 'antd';
import type { RcFile } from 'antd/es/upload/interface';
import {
  Alert,
  App as AntApp,
  Button,
  Card,
  Drawer,
  Empty,
  Input,
  Segmented,
  Slider,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
  Upload,
} from 'antd';
import {
  FiBook,
  FiFileText,
  FiSearch,
  FiUploadCloud,
  FiUser,
  FiX,
  FiMenu,
  FiMaximize,
  FiMinimize,
  FiZoomIn,
  FiZoomOut,
  FiSun,
  FiMoon,
  FiEye,
} from 'react-icons/fi';
import { readFilePreview, type FilePreview } from '@/lib/epub';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

type ViewMode = 'paragraph' | 'plain';
type Theme = 'light' | 'sepia' | 'dark';

interface ChapterItem {
  title: string;
  content: string;
}

const CHAPTER_RE =
  /^[ \t]*第[ \t]*[一二三四五六七八九十百千万零〇\d]+[ \t]*(?:章|卷|回|节|集|部|篇|折)[^\n]*/gm;

const THEMES: Record<
  Theme,
  { bg: string; text: string; name: string; icon: React.ReactNode }
> = {
  light: { bg: '#ffffff', text: '#222', name: '浅色', icon: <FiSun /> },
  sepia: { bg: '#f5efe0', text: '#5b4636', name: '护眼', icon: <FiEye /> },
  dark: { bg: '#1e1e1e', text: '#d4d4d4', name: '深色', icon: <FiMoon /> },
};

/** 按章节正则拆分，没匹配到就整本作为一章 */
function splitPreviewChapters(text: string): ChapterItem[] {
  const matches = [...text.matchAll(CHAPTER_RE)];
  if (!matches.length) return [{ title: '全文', content: text }];

  const chapters: ChapterItem[] = [];

  const firstStart = matches[0]!.index;
  const preface = text.slice(0, firstStart).trim();
  if (preface) chapters.push({ title: '前言', content: preface });

  for (let i = 0; i < matches.length; i++) {
    const m = matches[i]!;
    const start = m.index;
    const end = i + 1 < matches.length ? matches[i + 1]!.index : text.length;
    const block = text.slice(start, end);
    const nl = block.indexOf('\n');
    const title = (nl === -1 ? block : block.slice(0, nl)).trim();
    const content = nl === -1 ? '' : block.slice(nl + 1).trim();
    if (content) chapters.push({ title: title || `第 ${i + 1} 章`, content });
  }
  return chapters.length ? chapters : [{ title: '全文', content: text }];
}

export default function PreviewPage() {
  const { message } = AntApp.useApp();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<FilePreview | null>(null);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('paragraph');
  const [theme, setTheme] = useState<Theme>('light');
  const [fontSize, setFontSize] = useState(16);
  const [navOpen, setNavOpen] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  // 拆章
  const chapters = useMemo<ChapterItem[]>(() => {
    if (!preview) return [];
    return splitPreviewChapters(preview.text);
  }, [preview]);

  // 当前章节
  const currentChapterItem = chapters[currentChapter];
  const currentTitle = currentChapterItem?.title ?? '';
  const currentContent = currentChapterItem?.content ?? '';

  const paragraphs = useMemo<string[]>(() => {
    if (!currentContent) return [];
    return currentContent
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
  }, [currentContent]);

  const filteredParagraphs = useMemo<string[]>(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return paragraphs;
    return paragraphs.filter((p) => p.toLowerCase().includes(kw));
  }, [paragraphs, keyword]);

  const matchCount = keyword.trim() ? filteredParagraphs.length : 0;

  // 上传
  const draggerProps = {
    accept: '.txt,.epub',
    multiple: false,
    maxCount: 1,
    fileList,
    beforeUpload: async (f: RcFile) => {
      const lower = f.name.toLowerCase();
      if (!lower.endsWith('.txt') && !lower.endsWith('.epub')) {
        message.error('只支持 .txt 或 .epub 文件');
        return Upload.LIST_IGNORE;
      }
      setFileList([{ uid: f.uid, name: f.name, originFileObj: f, status: 'done' }]);
      setError('');
      setPreview(null);
      setKeyword('');
      setCurrentChapter(0);
      setLoading(true);
      try {
        const data = await readFilePreview(f);
        setPreview(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        message.error(`读取失败：${msg}`);
      } finally {
        setLoading(false);
      }
      return false;
    },
    onRemove: () => {
      setFileList([]);
      setPreview(null);
      setError('');
      setKeyword('');
      setCurrentChapter(0);
    },
    onDrop: () => {},
  };

  // 全屏
  const toggleFullscreen = useCallback(async () => {
    if (!contentRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await contentRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      message.error('当前浏览器不支持全屏');
    }
  }, [message]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const themeConf = THEMES[theme];

  const renderChapterContent = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" tip="正在读取文件…" />
        </div>
      );
    }
    if (error) {
      return <Alert type="error" showIcon message="读取失败" description={error} />;
    }
    if (!preview) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="请选择一个 .txt 或 .epub 文件"
          style={{ padding: '60px 0' }}
        />
      );
    }
    if (!chapters.length) {
      return <Empty description="没有可阅读的章节" />;
    }

    const titleNode = currentTitle ? (
      <h2
        style={{
          fontSize: fontSize + 4,
          margin: '0 0 20px',
          fontWeight: 600,
          color: 'inherit',
        }}
      >
        {currentTitle}
      </h2>
    ) : null;

    if (viewMode === 'plain') {
      return (
        <>
          {titleNode}
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'ui-monospace, monospace',
              fontSize,
              lineHeight: 1.7,
              margin: 0,
              color: 'inherit',
            }}
          >
            {currentContent}
          </pre>
        </>
      );
    }

    if (!filteredParagraphs.length) {
      return (
        <>
          {titleNode}
          <Empty description="没有匹配的段落" />
        </>
      );
    }

    return (
      <>
        {titleNode}
        <div style={{ lineHeight: 1.9, fontSize }}>
          {filteredParagraphs.map((para, i) => {
            const lines = para.split('\n');
            return (
              <p
                key={i}
                style={{
                  margin: '0 0 16px',
                  textIndent: '2em',
                }}
              >
                {lines.map((line, j) => (
                  <span key={j}>
                    {line}
                    {j < lines.length - 1 && <br />}
                  </span>
                ))}
              </p>
            );
          })}
        </div>
      </>
    );
  };

  const chapterNav = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {chapters.map((ch, i) => (
        <Button
          key={i}
          type={i === currentChapter ? 'primary' : 'text'}
          size="small"
          style={{
            justifyContent: 'flex-start',
            textAlign: 'left',
            height: 'auto',
            padding: '6px 10px',
            whiteSpace: 'normal',
          }}
          onClick={() => {
            setCurrentChapter(i);
            setNavOpen(false);
            setKeyword('');
            contentRef.current?.scrollTo({ top: 0 });
          }}
        >
          <span style={{ fontSize: 13 }}>{ch.title}</span>
        </Button>
      ))}
    </div>
  );

  return (
    <div style={{ maxWidth: 1080, margin: '32px auto', padding: '0 20px 60px' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 4 }}>
          电子书预览
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          章节化阅读 · 字体缩放 · 全屏 · 主题配色 · 侧边导航
        </Paragraph>
      </div>

      <Card size="small" bordered style={{ marginBottom: 16 }}>
        <Dragger {...draggerProps}>
          <p className="ant-upload-drag-icon">
            <FiUploadCloud size={44} color="#4a90e2" />
          </p>
          <p className="ant-upload-text">点击或拖拽 .txt / .epub 文件到这里</p>
          <p className="ant-upload-hint">
            TXT 自动识别 UTF-8 / GBK；EPUB 按 spine 顺序提取正文
          </p>
        </Dragger>
      </Card>

      {preview && (
        <>
          {/* 顶部工具栏 */}
          <Card size="small" bordered style={{ marginBottom: 16 }}>
            <Space wrap split={<span style={{ color: '#ddd' }}>|</span>}>
              <Space size={4}>
                <Tooltip title="目录">
                  <Button icon={<FiMenu />} onClick={() => setNavOpen(true)}>
                    目录
                  </Button>
                </Tooltip>
                <Tag color="blue">
                  {currentChapter + 1} / {chapters.length}
                </Tag>
              </Space>

              <Space size={4}>
                <Tooltip title="缩小字体">
                  <Button
                    icon={<FiZoomOut />}
                    onClick={() => setFontSize((s) => Math.max(12, s - 2))}
                    disabled={fontSize <= 12}
                  />
                </Tooltip>
                <Slider
                  min={12}
                  max={28}
                  step={2}
                  value={fontSize}
                  onChange={setFontSize}
                  style={{ width: 100 }}
                  tooltip={{ formatter: (v) => `${v}px` }}
                />
                <Tooltip title="放大字体">
                  <Button
                    icon={<FiZoomIn />}
                    onClick={() => setFontSize((s) => Math.min(28, s + 2))}
                    disabled={fontSize >= 28}
                  />
                </Tooltip>
                <Text type="secondary" style={{ fontSize: 12, width: 36 }}>
                  {fontSize}px
                </Text>
              </Space>

              <Segmented
                size="small"
                value={theme}
                onChange={(v) => setTheme(v as Theme)}
                options={Object.entries(THEMES).map(([key, cfg]) => ({
                  value: key,
                  label: (
                    <Space size={4}>
                      {cfg.icon}
                      {cfg.name}
                    </Space>
                  ),
                }))}
              />

              <Segmented
                size="small"
                value={viewMode}
                onChange={(v) => setViewMode(v as ViewMode)}
                options={[
                  { label: '段落', value: 'paragraph', icon: <FiFileText /> },
                  { label: '原文', value: 'plain' },
                ]}
              />

              <Tooltip title={isFullscreen ? '退出全屏' : '全屏阅读'}>
                <Button
                  icon={isFullscreen ? <FiMinimize /> : <FiMaximize />}
                  onClick={toggleFullscreen}
                />
              </Tooltip>
            </Space>
          </Card>

          {/* 阅读区 */}
          <Card
            size="small"
            bordered
            title={
              <Space wrap>
                <FiBook color="#4a90e2" />
                <Text strong>{preview.title}</Text>
                <Tag color={preview.kind === 'epub' ? 'blue' : 'green'}>
                  {preview.kind.toUpperCase()}
                </Tag>
                {preview.author && (
                  <Tag icon={<FiUser size={12} />}>{preview.author}</Tag>
                )}
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 'normal' }}>
                  {(preview.size / 1024).toFixed(1)} KB · {preview.text.length} 字符
                </Text>
              </Space>
            }
          >
            <Space.Compact style={{ width: '100%', marginBottom: 12 }}>
              <Input
                allowClear
                prefix={<FiSearch color="#999" />}
                placeholder="在当前章节中搜索关键字"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                suffix={
                  keyword ? (
                    <Button
                      type="text"
                      size="small"
                      icon={<FiX />}
                      onClick={() => setKeyword('')}
                    />
                  ) : null
                }
              />
            </Space.Compact>
            {keyword.trim() && (
              <Text
                type="secondary"
                style={{ fontSize: 12, display: 'block', marginBottom: 8 }}
              >
                当前章节匹配到 {matchCount} 个段落
              </Text>
            )}

            <div
              ref={contentRef}
              style={{
                maxHeight: isFullscreen ? '100vh' : '65vh',
                overflowY: 'auto',
                padding: isFullscreen ? '40px 15%' : '16px 20px',
                background: themeConf.bg,
                color: themeConf.text,
                borderRadius: isFullscreen ? 0 : 8,
                border: isFullscreen ? 'none' : '1px solid #f0f0f0',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              {renderChapterContent()}
            </div>

            {/* 章节底部翻页 */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 12,
              }}
            >
              <Button
                disabled={currentChapter <= 0}
                onClick={() => {
                  setCurrentChapter((i) => Math.max(0, i - 1));
                  setKeyword('');
                  contentRef.current?.scrollTo({ top: 0 });
                }}
              >
                上一章
              </Button>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {currentTitle}
              </Text>
              <Button
                disabled={currentChapter >= chapters.length - 1}
                onClick={() => {
                  setCurrentChapter((i) => Math.min(chapters.length - 1, i + 1));
                  setKeyword('');
                  contentRef.current?.scrollTo({ top: 0 });
                }}
              >
                下一章
              </Button>
            </div>
          </Card>

          {/* 左侧目录 */}
          <Drawer
            title={
              <Space>
                <FiMenu />
                <span>目录</span>
                <Tag>{chapters.length} 章</Tag>
              </Space>
            }
            placement="left"
            width={280}
            open={navOpen}
            onClose={() => setNavOpen(false)}
            styles={{ body: { padding: 12 } }}
          >
            {chapterNav}
          </Drawer>
        </>
      )}
    </div>
  );
}