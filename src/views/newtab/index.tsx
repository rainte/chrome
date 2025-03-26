import { useState, useEffect } from 'react'
import { Flex } from 'antd'
import { db, file } from '@rainte/js'
import { StorageEnum } from '@/services/storage'
import { NEWTAB_BGIMG_KEY } from '@/views/options/tab/components/NewTabBgImg'

export default function App() {
  const [newtab, setNewtab] = useState<string>(URL.createObjectURL(new Blob([])))

  useEffect(() => {
    db.get(StorageEnum.Tab)
      .then((res) => res[NEWTAB_BGIMG_KEY])
      .then((res) => {
        if (res.status) {
          const blob = file.toBlob(res.files.pop().base64)
          setNewtab(URL.createObjectURL(blob))
        }
      })
  }, [])

  return (
    <Flex
      style={{
        height: '100vh',
        backgroundImage: `url(${newtab})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover'
      }}
    >
      {' '}
    </Flex>
  )
}
