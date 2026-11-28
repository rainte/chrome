import { browser } from '#imports'
import type { DiscoveredSource, Job } from '@/utils/job'
import {
  Badge,
  Button,
  Card,
  Empty,
  Flex,
  Listy,
  Popconfirm,
  Progress,
  Space,
  Typography
} from 'antd'
import { useEffect, useState } from 'react'

const { Text } = Typography

const STATUS_MAP: Record<
  Job['status'],
  { color: string; label: string; badge: 'processing' | 'success' | 'error' | 'default' }
> = {
  pending: { color: 'default', label: '等待中', badge: 'default' },
  running: { color: 'processing', label: '执行中', badge: 'processing' },
  done: { color: 'success', label: '完成', badge: 'success' },
  cancelled: { color: 'warning', label: '已取消', badge: 'default' },
  error: { color: 'error', label: '错误', badge: 'error' }
}

const JobProgress = ({ item }: { item: Job }) => {
  return (
    <Progress
      percent={item.progress}
      size="small"
      status={item.status === 'error' ? 'exception' : item.status === 'done' ? 'success' : 'active'}
      format={(p) => `${p}% ${item.phase || ''}`.trim()}
    />
  )
}

export default function M3u8() {
  const [sources, setSources] = useState<DiscoveredSource[]>([])
  const [jobs, setJobs] = useState<
    Job<{
      url: string
      fileName: string
    }>[]
  >([])

  useEffect(() => {
    Promise.all([
      browser.runtime.sendMessage({ type: 'GET_ALL_JOBS' }),
      browser.runtime.sendMessage({ type: 'GET_DISCOVERED' })
    ]).then(
      ([jobList, srcList]: [
        Job<{
          url: string
          fileName: string
        }>[],
        DiscoveredSource[]
      ]) => {
        setJobs(jobList)
        setSources(srcList)
      }
    )

    const listener = (msg: any) => {
      if (msg.type === 'JOB_UPDATE') {
        setJobs((prev) => {
          const idx = prev.findIndex((j) => j.id === msg.job.id)
          if (idx === -1) return [...prev, msg.job]
          const next = [...prev]
          next[idx] = msg.job
          return next
        })
      }
      if (msg.type === 'SOURCE_DISCOVERED') {
        setSources((prev) =>
          prev.some((s) => s.url === msg.source.url) ? prev : [msg.source, ...prev]
        )
      }
    }
    browser.runtime.onMessage.addListener(listener)
    return () => browser.runtime.onMessage.removeListener(listener)
  }, [])

  const onClearSources = () => {
    browser.runtime.sendMessage({ type: 'CLEAR_DISCOVERED' }).then(setSources)
  }

  const onClearJobs = () => {
    browser.runtime.sendMessage({ type: 'CLEAR_JOBS' }).then(setJobs)
  }

  const onDownloadSource = (src: DiscoveredSource) => {
    browser.runtime.sendMessage({
      type: 'CREATE_JOB',
      kind: 'm3u8',
      title: src.title,
      payload: {
        url: src.url,
        fileName: `${src.title}_${Date.now()}.mp4`
      }
    })
  }

  const onCancelJob = (job: Job) => {
    browser.runtime.sendMessage({ type: 'CANCEL_JOB', jobId: job.id })
  }

  return (
    <Flex vertical gap={5}>
      <Card
        title="嗅探资源"
        size="small"
        extra={
          <Popconfirm title="清空已发现的源？" onConfirm={onClearSources}>
            <Button type="link" danger>
              清空
            </Button>
          </Popconfirm>
        }
      >
        {sources.length === 0 ? (
          <Empty />
        ) : (
          <Listy
            items={sources}
            rowKey="url"
            rowHoverable={false}
            styles={{ item: { padding: 3 } }}
            itemRender={(item) => (
              <Flex justify="space-between" align="center">
                <Space>
                  <Text ellipsis title={item.url} style={{ width: '9rem' }}>
                    {item.title}
                  </Text>
                  <Text type="secondary">{item.duration}</Text>
                  {/* <Text type="secondary">{item.size}</Text> */}
                </Space>
                <Space.Compact size="small">
                  <Button type="link" onClick={() => onDownloadSource(item)}>
                    下载
                  </Button>
                </Space.Compact>
              </Flex>
            )}
          />
        )}
      </Card>

      <Card
        title="任务列表"
        size="small"
        extra={
          <Popconfirm title="清空已完成的任务？" onConfirm={onClearJobs}>
            <Button type="link" danger>
              清空
            </Button>
          </Popconfirm>
        }
      >
        {jobs.length === 0 ? (
          <Empty />
        ) : (
          <Listy
            items={[...jobs].reverse()}
            rowKey="id"
            rowHoverable={false}
            styles={{ item: { padding: 5 } }}
            itemRender={(item) => {
              const s = STATUS_MAP[item.status]
              const cancellable = item.status === 'pending' || item.status === 'running'
              return (
                <Flex vertical>
                  <Flex justify="space-between">
                    <Space>
                      <Badge status={s.badge} text={s.label} />
                      <Text ellipsis style={{ width: '5rem' }}>
                        {item.title}
                      </Text>
                    </Space>
                    <Space.Compact size="small">
                      {cancellable && (
                        <Button
                          type="link"
                          onClick={() =>
                            onDownloadSource({
                              type: 'hls',
                              url: item.payload.url,
                              title: item.title,
                              foundAt: item.createdAt
                            })
                          }
                        >
                          重试
                        </Button>
                      )}
                      {cancellable && (
                        <Popconfirm
                          key="cancel"
                          title="取消该任务？"
                          onConfirm={() => onCancelJob(item)}
                        >
                          <Button type="link" danger>
                            取消
                          </Button>
                        </Popconfirm>
                      )}
                    </Space.Compact>
                  </Flex>
                  {item.error && (
                    <Text type="danger" copyable>
                      {item.error}
                    </Text>
                  )}
                  <JobProgress item={item} />
                </Flex>
              )
            }}
          />
        )}
      </Card>
    </Flex>
  )
}
