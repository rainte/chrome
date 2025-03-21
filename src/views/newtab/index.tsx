import { useState, useEffect } from 'react'
import { Flex } from 'antd'
import { db } from '@rainte/js'
import { StorageEnum } from '@/services/storage'
import { NEWTAB_BGIMG_KEY, NewTabBgImgProps } from '@/views/options/tab/components/NewTabBgImg'

export default function App() {
  const [newtab, setNewtab] = useState<NewTabBgImgProps>()

  useEffect(() => {
    db.get(StorageEnum.Tab)
      .then((res) => res[NEWTAB_BGIMG_KEY])
      .then(setNewtab)
  }, [])

  return (
    <Flex
      style={{
        height: '100%',
        backgroundImage: `url(${URL.createObjectURL(newtab?.files?.[0] ?? new Blob([]))})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover'
      }}
    >
      {' '}
    </Flex>
  )
}
