import { useState, useEffect } from 'react'
import { Flex } from 'antd'
import hub, { FileEnum } from '@/utils/hub'
import { store } from '@/utils/browser'
import { toBlob } from '@/utils/file'

export default () => {
  const [url, setUrl] = useState('')

  useEffect(() => {
    store.get(FileEnum.NewTabBgImg).then((file) => setUrl(file.url))
  }, [])

  useEffect(() => {
    hub.file.get(FileEnum.NewTabBgImg).then((base64) => {
      const url = URL.createObjectURL(toBlob(base64))
      setUrl(url)
      store.set(FileEnum.NewTabBgImg, { url })
    })
  }, [])

  return (
    <Flex
      style={{
        height: '100%',
        backgroundSize: 'cover',
        backgroundImage: `url(${url})`
      }}
    >
      {' '}
    </Flex>
  )
}
