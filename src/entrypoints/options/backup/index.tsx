import { useState } from 'react'
import { Button, Card, Divider, Flex, Input, Space, Typography } from 'antd'
import { antd, Form } from '@rainte/ant'
import { restoreFromGist, uploadBackup } from '@/utils/backup'
import { AiOutlineCloudDownload, AiOutlineCloudUpload } from 'react-icons/ai'
import {
  assertBackupSettings,
  loadBackupSettings,
  loadBackupTime,
  saveBackupSettings,
  toDate,
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
      <Flex justify="space-evenly" align="center">
        <Flex>
          <AiOutlineCloudUpload size={80} />
          <Flex vertical align="end" justify="center" style={{ width: 150 }}>
            <Typography.Title level={5}>{toDate(time.cloud)}</Typography.Title>
            <Button type="primary" onClick={onUpload}>
              上传备份
            </Button>
          </Flex>
        </Flex>
        <Divider vertical />
        <Flex>
          <AiOutlineCloudDownload size={80} />
          <Flex vertical align="end" justify="center" style={{ width: 150 }}>
            <Typography.Title level={5}>{toDate(time.local)}</Typography.Title>
            <Button type="primary" onClick={onDown}>
              覆盖本地
            </Button>
          </Flex>
        </Flex>
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
