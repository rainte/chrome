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
import type { RcFile } from 'antd/es/upload'
import { AiOutlineDownload } from 'react-icons/ai'
import { handleDownloadAll, handleDownloadOne } from './actions'

export default function Epub() {
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [results, setResults] = useState<BatchItemResult[]>([])

  const onFinish = async (values: any) => {
    try {
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
              wrapperCol: { span: 9 },
              extra: '书名取自文件名；支持 UTF-8/GBK；支持批量添加',
              rules: [{ required: true }]
            }
          },
          {
            title: '作者',
            dataIndex: 'author',
            fieldProps: { placeholder: '留空则用 EPUB 内置作者' }
          },
          {
            title: '起始标记',
            dataIndex: 'startMarker',
            fieldProps: { placeholder: '标记前丢弃；留空不启用；例：正文开始' }
          },
          {
            title: '屏蔽词',
            dataIndex: 'blockWords',
            fieldProps: { placeholder: '逗号分隔，命中即删；留空不启用；例：广告,推广' }
          },
          {
            title: '章节正则',
            dataIndex: 'chapterPattern',
            valueType: 'textarea',
            fieldProps: { placeholder: 'JS 正则，免写 /…/g' },
            formItemProps: {
              initialValue: DEFAULT_CONFIG.chapterPattern,
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
