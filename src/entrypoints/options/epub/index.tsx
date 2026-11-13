import { useState } from 'react'
import { Button, Modal, Space, Table, Upload, type UploadFile } from 'antd'
import { antd, Form } from '@rainte/ant'
import {
  convertFiles,
  DEFAULT_CONFIG,
  EpubKind,
  type BatchItemResult,
  type EpubConfig
} from '@/lib/epub'
import { handleDownloadAll, handleDownloadOne } from './actions'
import type { RcFile } from 'antd/es/upload'
import { AiOutlineDownload } from 'react-icons/ai'

export default function App() {
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [results, setResults] = useState<BatchItemResult[]>([])

  const onFinish = async (values: any) => {
    try {
      console.log('values', values)
      setResults([])

      const files = values.files
        .map((f: UploadFile) => f.originFileObj)
        .filter((f: UploadFile): f is RcFile => Boolean(f))
      if (!files.length) return

      const all = await convertFiles(files, values as EpubConfig, (done, total) => {
        setProgress({ done, total })
      })
      setResults(all)
      const okCount = all.filter((r) => r.ok).length
      const failCount = all.length - okCount
      if (failCount) antd.message.warning(`失败 ${failCount} 个`)
      setIsModalOpen(true)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      antd.message.error(msg)
    } finally {
      setProgress({ done: 0, total: 0 })
    }
  }

  return (
    <Space vertical style={{ width: '100%' }}>
      <Form
        onFinish={onFinish}
        submitter={{
          searchConfig: {
            submitText: progress.total ? `正在转换 ${progress.done}/${progress.total}` : '开始转换'
          }
        }}
        columns={[
          {
            title: '选择文件',
            dataIndex: 'files',
            valueType: 'upload',
            fieldProps: {
              accept: '.txt,.epub',
              multiple: true,
              beforeUpload: (f: RcFile) => {
                const lower = f.name.toLowerCase()
                if (!lower.endsWith('.txt') && !lower.endsWith('.epub')) {
                  antd.message.error(`不支持的文件类型：${f.name}`)
                  return Upload.LIST_IGNORE
                }
              }
            },
            formItemProps: {
              extra: '文件名即书名，支持 UTF-8 / GBK 编码，可一次添加多个文件',
              rules: [{ required: true }]
            }
          },
          {
            title: '作者',
            dataIndex: 'author',
            fieldProps: { placeholder: '留空自动读取' },
            formItemProps: { extra: '留空则使用 EPUB 文件内置的作者信息' }
          },
          {
            title: '起始标记',
            dataIndex: 'startMarker',
            fieldProps: { placeholder: '例如：正文开始' },
            formItemProps: { extra: '标记之前的所有内容会被丢弃；留空则不启用' }
          },
          {
            title: '屏蔽词',
            dataIndex: 'blockWords',
            fieldProps: { placeholder: '例如：广告,推广' },
            formItemProps: { extra: '用英文逗号分隔，命中的文字会被删除；留空则不启用' }
          },
          {
            title: '章节正则',
            dataIndex: 'chapterPattern',
            valueType: 'textarea',
            formItemProps: {
              initialValue: DEFAULT_CONFIG.chapterPattern,
              extra: '使用 JS 正则语法，无需写 /…/g 包裹',
              rules: [
                {
                  validator: async (_, value: string) => {
                    try {
                      new RegExp(value)
                    } catch (e) {
                      const msg = e instanceof Error ? e.message : String(e)
                      throw new Error(`正则无效：${msg}`)
                    }
                  }
                }
              ]
            }
          }
        ]}
      />

      <Modal
        title="转换结果"
        width={800}
        open={isModalOpen}
        mask={{ closable: false }}
        onOk={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
      >
        <Space vertical style={{ width: '100%' }}>
          <Space.Compact>
            <Button type="primary" onClick={() => handleDownloadAll(results)}>
              全部下载（EPUB + TXT）
            </Button>
            <Button onClick={() => handleDownloadAll(results, EpubKind.Epub)}>下载 EPUB</Button>
            <Button onClick={() => handleDownloadAll(results, EpubKind.Txt)}>下载 TXT</Button>
          </Space.Compact>

          <Table
            size="small"
            rowKey="title"
            pagination={false}
            dataSource={results}
            columns={[
              { title: '书名', dataIndex: ['result', 'title'] },
              { width: 150, title: '作者', dataIndex: ['result', 'author'] },
              { width: 70, title: '章数', dataIndex: ['result', 'chapterCount'] },
              {
                width: 150,
                title: '操作',
                align: 'center',
                render: (_, r) => (
                  <Space.Compact>
                    <Button
                      type="link"
                      icon={<AiOutlineDownload />}
                      onClick={() => handleDownloadOne(EpubKind.Epub, r)}
                    >
                      EPUB
                    </Button>
                    <Button
                      type="link"
                      icon={<AiOutlineDownload />}
                      onClick={() => handleDownloadOne(EpubKind.Txt, r)}
                    >
                      TXT
                    </Button>
                  </Space.Compact>
                )
              }
            ]}
          />
        </Space>
      </Modal>
    </Space>
  )
}
