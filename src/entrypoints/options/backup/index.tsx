import { restoreFromGist, uploadBackup } from '@/utils/backup'
import { antd, Form } from '@rainte/ant'
import { Button, Card, Divider, Flex, Input, Space, Typography } from 'antd'
import { useState, type ReactNode } from 'react'
import { AiOutlineCloudDownload, AiOutlineCloudUpload } from 'react-icons/ai'
import {
  assertBackupSettings,
  formatDate,
  loadBackupSettings,
  loadBackupTime,
  saveBackupSettings,
  type BackupSettings,
  type BackupTime
} from './actions'

const createLinkInput = (label: string, url: string) => {
  return ({ value, onChange }: { value?: string; onChange?: (r: string) => void }) => (
    <Space.Compact style={{ width: '100%' }}>
      <Input value={value} onChange={(e) => onChange?.(e.target.value)} />
      <Typography.Link href={url} target="_blank">
        <Button>{label}</Button>
      </Typography.Link>
    </Space.Compact>
  )
}

const GithubTokenInput = createLinkInput(
  'Get Github Token',
  'https://github.com/settings/tokens/new'
)
const GistIdInput = createLinkInput('手动生成', 'https://gist.github.com')

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
      await uploadBackup({
        token: state.token,
        gistId: state.gistId,
        keys: ['proxy', 'tab']
      })
      return state
    })

  const onDown = () =>
    runBackup(async (state) => {
      await restoreFromGist({ token: state.token, gistId: state.gistId })
      const next = { ...state, updatedAt: new Date().toISOString() }
      await saveBackupSettings(next)
      return next
    })

  return (
    <Card title="GitHub Gist 配置">
      <Flex justify="center" align="center" gap={80}>
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
      <Divider />

      <Form
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
            title: 'Gist ID',
            dataIndex: 'gistId',
            formItemProps: { rules: [{ required: true }] },
            formItemRender: () => <GistIdInput />
          }
        ]}
      />
    </Card>
  )
}
