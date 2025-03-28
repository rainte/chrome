import { useEffect, useState } from 'react'
import { Flex } from 'antd'
import { database, blob } from '@rainte/js'
import { DbEnum } from '@/utils/crx'
import { NEWTAB_BGIMG_KEY } from '@/views/options/tab/components/NewTabBgImg'

export default function App() {
  const [newtab, setNewtab] = useState<Blob>(new Blob([]))

  useEffect(() => {
    database
      .get(DbEnum.Tab)
      .then((res) => res[NEWTAB_BGIMG_KEY])
      .then((res) => (res.status ? res.files.pop().base64 : ''))
      .then((res) => setNewtab(blob.toBlob(res)))
  }, [])

  return (
    <Flex
      style={{
        height: '100vh',
        backgroundImage: `url(${URL.createObjectURL(newtab)})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover'
      }}
    >
      {' '}
    </Flex>
  )
}
