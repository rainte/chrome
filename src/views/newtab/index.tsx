import { useState, useEffect } from 'react'
import { Flex } from 'antd'
import { gist, HubEnum } from '@/services/octokit'
import { NewTabBgImgProps } from '@/views/options/components/Tab/components/NewTabBgImg'

export default () => {
  const [url, setUrl] = useState('')

  useEffect(() => {
    gist.getJson<NewTabBgImgProps>(HubEnum.Tab).then((res) => {
      res.status && res.newTabBgImg && setUrl(res.newTabBgImg)
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
