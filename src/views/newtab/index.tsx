import { useState, useEffect } from 'react'
import { Flex } from 'antd'
import Image from '@/components/Image'
import hub, { FileEnum } from '@/utils/hub'
import { store } from '@/utils/browser'
import { toBlob } from '@/utils/file'

export default () => {
  const [newTabBgImg, setNewTabBgImg] = useState<string>()

  useEffect(() => {
    store.get(FileEnum.NewTabBgImg).then((file) => {
      setNewTabBgImg(file.url)
    })
  }, [])

  useEffect(() => {
    hub.file.get(FileEnum.NewTabBgImg).then((base64) => {
      const url = URL.createObjectURL(toBlob(base64))
      if (url !== newTabBgImg) {
        setNewTabBgImg(url)
        store.set(FileEnum.NewTabBgImg, { url })
      }
    })
  }, [])

  return (
    <Flex vertical align="center" justify="center" style={{ height: '100%' }}>
      <Image src={newTabBgImg} fallback="" />
    </Flex>
  )
}
