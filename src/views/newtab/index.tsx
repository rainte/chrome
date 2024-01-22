import { useState, useEffect } from 'react'
import { Flex } from 'antd'
import { HubEnum, gist } from '@/utils/octokit'
import { FileEnum, store } from '@/utils/storage'
import { toBase64 } from '@/utils/file'

export default () => {
  const [url, setUrl] = useState('')

  useEffect(() => {
    store.get(FileEnum.NewTabBgImg).then((file) => setUrl(file?.url))
  }, [])

  useEffect(() => {
    gist.getJson(HubEnum.Tab).then((res) => {
      res?.newTabBgImg &&
        fetch(res.newTabBgImg)
          .then((res) => res.blob())
          .then((blob) => {
            setUrl(URL.createObjectURL(blob))
            return blob
          })
          .then((blob) => toBase64(blob))
          .then((base64) => store.set(FileEnum.NewTabBgImg, { url: base64 }))
    })
  }, [])

  return (
    <Flex
      style={{
        height: '100%',
        backgroundImage: `url(${url})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover'
      }}
    >
      {' '}
    </Flex>
  )
}
