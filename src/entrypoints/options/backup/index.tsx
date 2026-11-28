import { restoreBackup, uploadBackup } from '@/utils/backup'
import { antd, Form } from '@rainte/ant'
import { Button, Card, Flex, Input, Space, Typography } from 'antd'
import { useState, type ReactNode } from 'react'
import { AiOutlineCloudDownload, AiOutlineCloudUpload } from 'react-icons/ai'
import {
  assertBackupSettings,
  BackupStorageKeys,
  formatDate,
  loadBackupSettings,
  loadBackupTime,
  saveBackupSettings,
  type BackupSettings,
  type BackupTime
} from './actions'

const createLinkInput = (label: string, url: string, placeholder = '') => {
  return ({ value, onChange }: { value?: string; onChange?: (r: string) => void }) => (
    <Space.Compact style={{ width: '100%' }}>
      <Input value={value} placeholder={placeholder} onChange={(e) => onChange?.(e.target.value)} />
      <Typography.Link href={url} target="_blank">
        <Button>{label}</Button>
      </Typography.Link>
    </Space.Compact>
  )
}

const GithubTokenInput = createLinkInput('生成', 'https://github.com/settings/tokens/new')
const GithubRepoInput = createLinkInput('生成', 'https://github.com/new', 'owner/repo')

const BackupCard = ({
  label,
  icon,
  onClick,
  date
}: {
  label: string
  icon: ReactNode
  onClick: () => void
  date?: string
}) => (
  <Flex>
    {icon}
    <Flex vertical justify="center" align="end" style={{ width: 150 }}>
      <Typography.Title level={5}>{formatDate(date)}</Typography.Title>
      <Button type="primary" onClick={onClick}>
        {label}
      </Button>
    </Flex>
  </Flex>
)

export default () => {
  const [time, setTime] = useState<BackupTime>({})

  const refresh = (state: BackupSettings) => loadBackupTime(state).then(setTime)

  const runBackup = async (action: (state: BackupSettings) => Promise<BackupSettings>) => {
    const state = await loadBackupSettings()
    assertBackupSettings(state)

    antd.modal.confirm({
      onOk: () => antd.safeRun(() => action(state).then((next) => refresh(next)))
    })
  }

  const onUpload = () =>
    runBackup(async (state) => {
      const { includeBookmarks, updatedAt: _updatedAt, ...more } = state

      await uploadBackup({
        location: { kind: 'repo', ...more },
        keys: BackupStorageKeys,
        includeBookmarks: includeBookmarks
      })
      return state
    })

  const onDown = () =>
    runBackup(async (state) => {
      const { includeBookmarks, updatedAt: _updatedAt, ...more } = state

      const res = await restoreBackup({
        location: { kind: 'repo', ...more },
        keys: BackupStorageKeys,
        includeBookmarks: includeBookmarks
      })
      const next = { ...state, updatedAt: res.updatedAt }
      await saveBackupSettings(next)
      return next
    })

  return (
    <Space vertical>
      <Card title="配置">
        <Form
          labelCol={{ span: 5 }}
          request={loadBackupSettings}
          onInit={(values) => loadBackupTime(values).then(setTime)}
          onFinish={(values) =>
            antd.safeRun(async () => {
              const state = await loadBackupSettings()
              await saveBackupSettings({ ...state, ...values })
            })
          }
          columns={[
            {
              title: 'Github Token',
              dataIndex: 'token',
              formItemProps: { rules: [{ required: true }] },
              formItemRender: () => <GithubTokenInput />
            },
            {
              title: 'Github Repository',
              dataIndex: 'repo',
              formItemProps: { rules: [{ required: true }] },
              formItemRender: () => <GithubRepoInput />
            },
            {
              title: '路径',
              dataIndex: 'path'
            },
            {
              title: '含书签',
              dataIndex: 'includeBookmarks',
              valueType: 'switch'
            }
          ]}
        />
      </Card>

      <Card>
        <Flex wrap justify="center" align="center" gap={80}>
          <BackupCard
            label="上传备份"
            icon={<AiOutlineCloudUpload size={80} />}
            onClick={onUpload}
            date={time.cloud}
          />
          <BackupCard
            label="覆盖本地"
            icon={<AiOutlineCloudDownload size={80} />}
            onClick={onDown}
            date={time.local}
          />
        </Flex>
      </Card>
    </Space>
  )
}
