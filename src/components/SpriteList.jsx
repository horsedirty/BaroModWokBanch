import React from 'react'
import { List, Card, Button, Input, Space, Tag, Popconfirm, Modal, Form, Select } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import useStore from '../store/store'
import './SpriteList.css'

const SpriteList = () => {
  const {
    sprites,
    selectedSpriteId,
    setSelectedSpriteId,
    updateSprite,
    deleteSprite,
    currentImage,
    imageDimensions,
  } = useStore()

  const [editModalVisible, setEditModalVisible] = React.useState(false)
  const [editingSprite, setEditingSprite] = React.useState(null)
  const [form] = Form.useForm()

  const getSpriteThumbnail = (sprite) => {
    if (sprite.imageUrl) {
      return (
        <div className="sprite-thumbnail">
          <img
            src={sprite.imageUrl}
            alt={sprite.name}
            style={{
              width: 60,
              height: 60,
              objectFit: 'contain',
              imageRendering: 'pixelated',
            }}
          />
        </div>
      )
    }
    return null
  }

  const handleEdit = (sprite) => {
    setEditingSprite(sprite)
    form.setFieldsValue({
      name: sprite.name,
      state: sprite.state || 'Normal',
    })
    setEditModalVisible(true)
  }

  const handleEditSave = () => {
    form.validateFields().then((values) => {
      updateSprite(editingSprite.id, {
        name: values.name,
        state: values.state,
      })
      setEditModalVisible(false)
      setEditingSprite(null)
    })
  }

  const handleDelete = (id) => {
    deleteSprite(id)
  }

  const stateColors = {
    Normal: 'green',
    Damaged: 'red',
    Broken: 'orange',
    Active: 'blue',
    Inactive: 'gray',
  }

  return (
    <div className="sprite-list">
      <div className="sprite-list-header">
        <h3>Sprite列表 ({sprites.length})</h3>
      </div>

      <List
        dataSource={sprites}
        renderItem={(sprite) => (
          <List.Item
            className={`sprite-item ${selectedSpriteId === sprite.id ? 'selected' : ''}`}
            onClick={() => setSelectedSpriteId(sprite.id)}
          >
            <Card
              size="small"
              className="sprite-card"
              hoverable
              actions={[
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEdit(sprite)
                  }}
                />,
                <Popconfirm
                  title="确定删除这个Sprite吗？"
                  onConfirm={(e) => {
                    e?.stopPropagation()
                    handleDelete(sprite.id)
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                  />
                </Popconfirm>,
              ]}
            >
              <div className="sprite-info">
                {getSpriteThumbnail(sprite)}
                <div className="sprite-name">{sprite.name}</div>
                <Space size={4}>
                  <Tag color={stateColors[sprite.state] || 'default'}>
                    {sprite.state || 'Normal'}
                  </Tag>
                  <Tag>
                    {sprite.sourceRect.width}×{sprite.sourceRect.height}
                  </Tag>
                </Space>
              </div>
            </Card>
          </List.Item>
        )}
      />

      {sprites.length === 0 && (
        <div className="empty-list">
          <p>暂无Sprite</p>
          <p style={{ fontSize: 12, color: '#999' }}>
            在Canvas上拖拽框选区域创建Sprite
          </p>
        </div>
      )}

      <Modal
        title="编辑Sprite"
        open={editModalVisible}
        onOk={handleEditSave}
        onCancel={() => {
          setEditModalVisible(false)
          setEditingSprite(null)
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="名称"
            name="name"
            rules={[{ required: true, message: '请输入Sprite名称' }]}
          >
            <Input placeholder="输入Sprite名称" />
          </Form.Item>
          <Form.Item
            label="状态"
            name="state"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select
              options={[
                { label: 'Normal (正常)', value: 'Normal' },
                { label: 'Damaged (损坏)', value: 'Damaged' },
                { label: 'Broken (破碎)', value: 'Broken' },
                { label: 'Active (激活)', value: 'Active' },
                { label: 'Inactive (未激活)', value: 'Inactive' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default SpriteList