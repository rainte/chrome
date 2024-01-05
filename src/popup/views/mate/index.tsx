import { Row, Col, Button } from 'antd'
import { useNavigate } from 'react-router-dom'

export default () => {
  const navigate = useNavigate()
  const items = [
    { url: 'availableParallelism', name: 'bbb' },
    { url: 'availableParallelism', name: 'bbb' },
    { url: 'availableParallelism', name: 'bbb' },
    { url: 'availableParallelism', name: 'bbb' },
    { url: 'availableParallelism', name: 'bbb' },
    { url: 'availableParallelism', name: 'bbb' },
    { url: 'availableParallelism', name: 'bbb' },
    { url: 'availableParallelism', name: 'bbb' },
    { url: 'availableParallelism', name: 'bbb' },
    {
      url: 'availableParallelism',
      name: 'availableParallelismavailableParallelismavailableParallelismavailableParallelismavailableParallelismavailableParallelism'
    }
  ]

  const grid = items.map((item, index) => (
    <Col onClick={() => navigate(item.url)} span={6} key={index}>
      <Button  block>
        {item.name}
      </Button>
    </Col>
  ))

  return <Row gutter={[16, 16]}>{grid}</Row>
}
