import { useState, useEffect } from 'react'
import { Flex } from 'antd'
import Image from '@/components/Image'
import hub, { FileEnum } from '@/utils/hub'
import { store, StoreEnum } from '@/utils/browser'

export default () => {
  const [newTabBgImg, setNewTabBgImg] = useState<string>()

  useEffect(() => {
    store.get(StoreEnum.File).then((files) => {
      console.log(files)
      setNewTabBgImg(files[FileEnum.NewTabBgImg])
    })
  }, [])

  useEffect(() => {
    hub.file.get(FileEnum.NewTabBgImg).then((url) => {
      if (url !== newTabBgImg) {
        setNewTabBgImg(url)
        store.set(StoreEnum.File, { [FileEnum.NewTabBgImg]: url })
      }
    })
  }, [])

  return (
    <Flex vertical align="center" justify="center" style={{ height: '100%' }}>
      <Image src={newTabBgImg} fallback="" />
    </Flex>
  )
}
