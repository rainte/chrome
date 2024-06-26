import { Space, Input, Button, Typography, InputProps } from 'antd'

export type FormItemLinkProps = InputProps & {
  name?: string
  url?: string
}

export default function FormItemLink(props: FormItemLinkProps) {
  const { name, url, ...more } = props

  return (
    <Space.Compact style={{ width: '100%' }}>
      <Input {...more} />
      <Typography.Link href={url} target="_blank">
        <Button>{name}</Button>
      </Typography.Link>
    </Space.Compact>
  )
}
