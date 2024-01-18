import { Space, Input, Button, Typography } from 'antd'

type FormItemLinkProps = {
  name: string
  url: string
}

export default (props: FormItemLinkProps) => {
  const { name, url, ...attrs } = props

  return (
    <Space.Compact>
      <Input {...attrs} />
      <Typography.Link href={url} target="_blank">
        <Button>{name}</Button>
      </Typography.Link>
    </Space.Compact>
  )
}
