import { useState, useEffect } from 'react'
import { Collapse, Upload, Flex, Typography, Spin, CollapseProps } from 'antd'
import Image from '@/components/Image'
import { UploadOutlined } from '@ant-design/icons'
import hub, { FileEnum } from '@/utils/hub'
import { popup } from '@/utils/show'

export default () => {
  const [loading, setLoading] = useState(true)
  const [newTabBgImg, setNewTabBgImg] = useState<string>()

  useEffect(() => {
    hub.file
      .get(FileEnum.NewTabBgImg)
      .then((url) => setNewTabBgImg(url))
      .finally(() => setLoading(false))
  }, [])

  const onFinish = (data: any) => {
    hub.file.set(FileEnum.NewTabBgImg, data.file).then((url) => {
      setNewTabBgImg(url)
      popup.success()
    })
  }

  const NewTabBgImg = () => {
    return (
      <Upload.Dragger customRequest={(options) => onFinish(options)}>
        <Flex vertical align="center" justify="center" style={{ height: '35vw' }}>
          {loading ? (
            <Spin />
          ) : newTabBgImg ? (
            <Image src={newTabBgImg} />
          ) : (
            <>
              <UploadOutlined style={{ fontSize: '3rem' }} />
              <Typography.Title level={5}>点击上传</Typography.Title>
            </>
          )}
        </Flex>
      </Upload.Dragger>
    )
  }

  const items: CollapseProps['items'] = [{ label: '新标签页背景图', children: <NewTabBgImg /> }]

  return <Collapse defaultActiveKey={0} items={items} />
}
