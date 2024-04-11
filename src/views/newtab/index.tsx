import { useState, useEffect } from 'react'
import { Flex } from 'antd'
import { db } from '@/utils/db'
import { StoreEnum } from '@/utils/storage'
import { gist, HubEnum } from '@/services/octokit'
import { NewTabBgImgProps } from '@/views/options/components/Tab/components/NewTabBgImg'

export default function () {
  const [url, setUrl] = useState('')

  const init = async () => {
    let cache = await db.rows
      .where({ key: StoreEnum.Tab })
      .first()
      .then((res) => res?.value)
      .then((res) => {
        res?.blob && (res.newTabBgImg = URL.createObjectURL(res?.blob))
        return res
      })
    cache || (cache = await gist.getJson<NewTabBgImgProps>(HubEnum.Tab))
    cache.status && cache.newTabBgImg && setUrl(cache.newTabBgImg)
  }

  useEffect(() => {
    init()
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
