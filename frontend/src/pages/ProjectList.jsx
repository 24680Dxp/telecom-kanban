import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Modal, Form, Input, message, Popconfirm, Space, Row, Col } from 'antd'
import { PlusOutlined, DeleteOutlined, ProjectOutlined } from '@ant-design/icons'
import { getProjects, createProject, deleteProject } from '../api'

export default function ProjectList() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()
  const navigate = useNavigate()

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getProjects()
      setProjects(data)
    } catch (e) {
      message.error('加载项目列表失败')
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const handleCreate = async () => {
    try {
      const values = await form.validateFields()
      await createProject(values)
      message.success('项目创建成功')
      setModalOpen(false)
      form.resetFields()
      fetchProjects()
    } catch (e) {
      if (e.errorFields) return
      message.error('创建失败')
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteProject(id)
      message.success('已删除')
      fetchProjects()
    } catch (e) {
      message.error('删除失败')
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>项目管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          新建项目
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {projects.map(p => (
          <Col key={p.id} xs={24} sm={12} md={8}>
            <Card
              hoverable
              loading={loading}
              actions={[
                <Button type="link" onClick={() => navigate(`/projects/${p.id}`)}>
                  进入看板
                </Button>,
                <Popconfirm title="确定删除？" onConfirm={() => handleDelete(p.id)}>
                  <Button type="link" danger icon={<DeleteOutlined />} />
                </Popconfirm>,
              ]}
            >
              <Card.Meta
                avatar={<ProjectOutlined style={{ fontSize: 32, color: '#1890ff' }} />}
                title={p.name}
                description={
                  <div>
                    <div>{p.description || '暂无描述'}</div>
                    <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                      {p.access_point_count} 个接入点
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
        {!loading && projects.length === 0 && (
          <Col span={24}>
            <div style={{ textAlign: 'center', padding: 80, color: '#999' }}>
              <ProjectOutlined style={{ fontSize: 48 }} />
              <div style={{ marginTop: 16 }}>暂无项目，点击"新建项目"开始</div>
            </div>
          </Col>
        )}
      </Row>

      <Modal
        title="新建项目"
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => { setModalOpen(false); form.resetFields() }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="项目名称" rules={[{ required: true, message: '请输入项目名称' }]}>
            <Input placeholder="如：白云区6月批次" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="如：9个接入点" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
