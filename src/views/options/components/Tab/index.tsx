import { useState, useEffect } from 'react'
import { Collapse, Upload, Flex, Typography, CollapseProps } from 'antd'
import Image from '@/components/Image'
import { UploadOutlined } from '@ant-design/icons'
import { popup } from '@/utils/show'
import hub, { FileEnum } from '@/services/hub'

export default () => {
  const [newTabBgImg, setNewTabBgImg] = useState<string>()

  useEffect(() => {
    hub.url(FileEnum.NewTabBgImg).then((url) => {
      console.log('aaa', url)
      url && setNewTabBgImg(url)
    })
  }, [])

  const onFinish = (data: any) => {
    hub.upload(FileEnum.NewTabBgImg, data.file).then((url) => {
      setNewTabBgImg(url)
      popup.success()
    })
  }

  const NewTabBgImg = () => {
    return (
      <Upload.Dragger customRequest={(options) => onFinish(options)}>
        <Flex vertical align="center" justify="center" style={{ height: '35vw' }}>
          {newTabBgImg ? (
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
