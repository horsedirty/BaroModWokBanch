import React from 'react'
import { Button, Modal, Input, message } from 'antd'
import { ImportOutlined } from '@ant-design/icons'
import useStore from '../store/store'

const { TextArea } = Input

const XMLImporter = () => {
  const [modalVisible, setModalVisible] = React.useState(false)
  const [xmlContent, setXmlContent] = React.useState('')
  const { modInfo, setModInfo, sprites, addSprite, components, addComponentToSprite } = useStore()

  const handleImport = () => {
    if (!xmlContent.trim()) {
      message.error('请输入XML内容')
      return
    }

    try {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml')

      const items = xmlDoc.getElementsByTagName('Item')
      if (items.length === 0) {
        message.error('未找到Item元素')
        return
      }

      const item = items[0]
      const identifier = item.getAttribute('identifier')
      const tags = item.getAttribute('tags') || item.getAttribute('Tags')

      if (identifier) {
        setModInfo({
          name: identifier,
          id: tags || identifier.toLowerCase(),
        })
      }

      const sprites = item.getElementsByTagName('Sprite')
      Array.from(sprites).forEach((sprite) => {
        const sourcerect = sprite.getAttribute('sourcerect')
        const origin = sprite.getAttribute('origin')
        
        if (sourcerect) {
          const [x, y, width, height] = sourcerect.split(',').map(Number)
          const [originX, originY] = origin ? origin.split(',').map(Number) : [0.5, 0.5]
          
          addSprite({
            name: identifier,
            sourceRect: { x, y, width, height },
            origin: { x: originX, y: originY },
            state: 'Normal',
          })
        }
      })

      const componentTypes = ['Holdable', 'Engine', 'Hull', 'Gun', 'Container', 'Wearable', 'MeleeWeapon', 'Medical']
      const newSprites = useStore.getState().sprites
      
      componentTypes.forEach((type) => {
        const elements = item.getElementsByTagName(type)
        Array.from(elements).forEach((element) => {
          const properties = {}
          for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i]
            properties[attr.name] = attr.value
          }
          
          if (newSprites.length > 0) {
            const lastSprite = newSprites[newSprites.length - 1]
            addComponentToSprite(lastSprite.id, {
              type,
              properties,
            })
          }
        })
      })

      message.success('XML导入成功')
      setModalVisible(false)
      setXmlContent('')
    } catch (error) {
      message.error('XML解析失败: ' + error.message)
    }
  }

  return (
    <>
      <Button icon={<ImportOutlined />} onClick={() => setModalVisible(true)}>
        导入XML
      </Button>
      
      <Modal
        title="导入XML"
        open={modalVisible}
        onOk={handleImport}
        onCancel={() => {
          setModalVisible(false)
          setXmlContent('')
        }}
        width={800}
        okText="导入"
        cancelText="取消"
      >
        <TextArea
          rows={15}
          value={xmlContent}
          onChange={(e) => setXmlContent(e.target.value)}
          placeholder="粘贴XML内容..."
          style={{ fontFamily: 'monospace' }}
        />
        <div style={{ marginTop: 12, fontSize: 12, color: '#666' }}>
          注意：导入将覆盖当前项目数据，请确保已保存重要内容
        </div>
      </Modal>
    </>
  )
}

export default XMLImporter