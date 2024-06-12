import { useState, useEffect } from 'react'
import { Flex } from 'antd'
import db from '@/utils/db'
import { StoreEnum } from '@/utils/storage'
import { gist, HubEnum } from '@/services/octokit'
import { TabEnum } from '@/views/options/components/Tab'
import { NewTabBgImgProps } from '@/views/options/components/Tab/components/NewTabBgImg'

export default function App() {
  const [url, setUrl] = useState('')
  const [newtab, setNewtab] = useState<NewTabBgImgProps>()

  useEffect(() => {
    getCache()
      .then(show)
      .finally(() => {
        setCache().then(show)
      })
  }, [])

  useEffect(() => {
    setUrl(URL.createObjectURL(newtab?.blob || new Blob([])))
  }, [newtab?.url])

  const getCache = () => {
    return db.get(StoreEnum.Tab).then((res) => res[TabEnum.NewTabBgImg])
  }

  const setCache = () => {
    return gist
      .getJson(HubEnum.Tab)
      .then(async (res) => {
        const url = res[TabEnum.NewTabBgImg]?.url
        if (url) {
          res[TabEnum.NewTabBgImg].blob = await fetch(url).then((res) => res.blob())
        }

        db.set(StoreEnum.Tab, res)
        return res
      })
      .then((res) => res[TabEnum.NewTabBgImg])
  }

  const show = (data: any) => {
    if (data && data.status) {
      setNewtab(data)
    } else {
      setNewtab(undefined)
    }
  }

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
