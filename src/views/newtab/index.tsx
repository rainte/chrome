import { useState, useEffect } from 'react'
import { Flex } from 'antd'
import { db } from '@rainte/js'
import { StoreEnum } from '@/utils/storage'
import { gist, HubEnum } from '@/services/octokit'
import { NewTabBgImgProps, NEWTAB_BGIMG_KEY } from '@/views/options/tab/components/NewTabBgImg'

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
  }, [newtab])

  const getCache = () => {
    return db.get(StoreEnum.Tab).then((res) => res[NEWTAB_BGIMG_KEY])
  }

  const setCache = () => {
    return gist
      .getJson(HubEnum.Tab)
      .then(async (res) => {
        const url = res[NEWTAB_BGIMG_KEY]?.url
        if (url) {
          res[NEWTAB_BGIMG_KEY].blob = await fetch(url).then((res) => res.blob())
        }

        db.set(StoreEnum.Tab, res)
        return res
      })
      .then((res) => res[NEWTAB_BGIMG_KEY])
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
