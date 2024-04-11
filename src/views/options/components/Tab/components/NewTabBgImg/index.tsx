import Form, { FormProps, useForm } from '@/components/Form'
import { gist, HubEnum } from '@/services/octokit'
import { db } from '@/utils/db'
import { popup } from '@/utils/show'
import { StoreEnum } from '@/utils/storage'

export type NewTabBgImgProps = {
  status?: boolean
  newTabBgImg?: string
  blob?: Blob
}

const dbAdd = async (res: NewTabBgImgProps) => {
  if (res.newTabBgImg) {
    res.blob = await fetch(res.newTabBgImg).then((res) => res.blob())
  }
  const ok = await db.rows.where({ key: StoreEnum.Tab }).first()
  if (ok) {
    await db.rows.where({ key: StoreEnum.Tab }).modify({ value: res })
  } else {
    await db.rows.add({ key: StoreEnum.Tab, value: res })
  }
  return res
}

export default function () {
  const props: FormProps = {
    form: useForm(),
    request: () => gist.getJson(HubEnum.Tab).then(dbAdd),
    onFinish: (data) =>
      gist
        .setJson(HubEnum.Tab, data)
        .then(() => dbAdd(data))
        .then(() => popup.success()),
    wrapperCol: { span: 12 },
    columns: [
      {
        title: '开启',
        dataIndex: 'status',
        valueType: 'switch'
      },
      {
        title: '背景图 URL',
        dataIndex: 'newTabBgImg'
      }
    ]
  }

  return <Form {...props} />
}
