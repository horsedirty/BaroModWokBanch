import React from 'react'
import { Upload, Button, message, Modal, List, Spin, Descriptions, Tabs, Tag, Collapse } from 'antd'
import { FileZipOutlined, FileImageOutlined, FileTextOutlined } from '@ant-design/icons'
import JSZip from 'jszip'
import useStore from '../store/store'

const { TabPane } = Tabs
const { Panel } = Collapse

const ModImporter = () => {
  const [modalVisible, setModalVisible] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [modFiles, setModFiles] = React.useState([])
  const [selectedMod, setSelectedMod] = React.useState(null)
  const [previewImage, setPreviewImage] = React.useState(null)
  const [previewXml, setPreviewXml] = React.useState(null)
  const { 
    setModInfo, 
    setCurrentImage, 
    sprites, 
    addSprite, 
    components, 
    addComponentToSprite,
    resetProject,
    setModFiles: setStoreModFiles 
  } = useStore()

  const handleFileUpload = async (info) => {
    if (info.file.status === 'done') {
      setLoading(true)
      try {
        const zip = await JSZip.loadAsync(info.file.originFileObj)
        const files = Object.keys(zip.files)
        
        const modData = {
          filelist: null,
          modInfo: null,
          itemFiles: [],
          imageFiles: [],
          allFiles: [],
        }

        for (const filename of files) {
          const file = zip.files[filename]
          
          if (filename.toLowerCase().endsWith('filelist.xml') || filename.toLowerCase().includes('filelist.xml')) {
            const content = await file.async('string')
            modData.filelist = content
            
            const parser = new DOMParser()
            const xmlDoc = parser.parseFromString(content, 'text/xml')
            const contentPackage = xmlDoc.getElementsByTagName('contentpackage')[0]
            
            if (contentPackage) {
              modData.modInfo = {
                name: contentPackage.getAttribute('name') || '未知模组',
                modVersion: contentPackage.getAttribute('modversion') || '1.0',
                corePackage: contentPackage.getAttribute('corepackage') === 'True',
                steamWorkshopId: contentPackage.getAttribute('steamworkshopid'),
                gameVersion: contentPackage.getAttribute('gameversion'),
              }
            }
          } else if (filename.toLowerCase().endsWith('.xml')) {
            const content = await file.async('string')
            modData.itemFiles.push({
              filename,
              content,
            })
          } else if (filename.toLowerCase().endsWith('.png') || filename.toLowerCase().endsWith('.xcf')) {
            const blob = await file.async('blob')
            const url = URL.createObjectURL(blob)
            modData.imageFiles.push({
              filename,
              url,
              blob,
            })
          }
          
          modData.allFiles.push(filename)
        }

        setModFiles([modData])
        setLoading(false)
        message.success(`模组解析成功，找到 ${modData.itemFiles.length} 个XML文件和 ${modData.imageFiles.length} 个图片文件`)
      } catch (error) {
        setLoading(false)
        message.error('模组解析失败: ' + error.message)
      }
    }
  }

  const handleImagePreview = (imageFile) => {
    setPreviewImage(imageFile)
  }

  const handleXmlPreview = (itemFile) => {
    setPreviewXml(itemFile)
  }

  const handleImportMod = async (modData) => {
    try {
      setLoading(true)
      
      resetProject()
      setStoreModFiles([modData])
      
      if (modData.modInfo) {
        setModInfo({
          name: modData.modInfo.name,
          id: modData.modInfo.name.toLowerCase().replace(/\s+/g, '_'),
          modVersion: modData.modInfo.modVersion,
          gameVersion: modData.modInfo.gameVersion,
          steamWorkshopId: modData.modInfo.steamWorkshopId,
          corePackage: modData.modInfo.corePackage,
        })
      }

      const spritePromises = []
      const spriteCount = { total: 0, withImage: 0, withoutImage: 0 }

      const findImageFile = (texture) => {
        if (!texture) return null
        
        const textureLower = texture.toLowerCase()
        const textureName = textureLower.split('/').pop().split('.').shift()
        
        return modData.imageFiles.find(f => {
          const filenameLower = f.filename.toLowerCase()
          const filenameName = filenameLower.split('/').pop().split('.').shift()
          
          return filenameLower === textureLower ||
                 filenameLower.endsWith(textureLower) ||
                 filenameLower.includes(textureLower) ||
                 filenameName === textureName ||
                 filenameLower.includes(textureName)
        })
      }

      for (const itemFile of modData.itemFiles) {
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(itemFile.content, 'text/xml')
        const items = xmlDoc.getElementsByTagName('Item')
        
        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          const identifier = item.getAttribute('identifier')
          const name = item.getAttribute('name') || identifier
          
          if (!identifier) continue

          const spriteElements = item.getElementsByTagName('Sprite')
          
          for (let s = 0; s < spriteElements.length; s++) {
            const spriteElement = spriteElements[s]
            const texture = spriteElement.getAttribute('texture')
            const sourcerect = spriteElement.getAttribute('sourcerect')
            const origin = spriteElement.getAttribute('origin')
            const state = spriteElement.getAttribute('state') || 'Normal'
            
            if (!sourcerect) continue
            
            spriteCount.total++
            
            const [x, y, width, height] = sourcerect.split(',').map(Number)
            const [originX, originY] = origin ? origin.split(',').map(Number) : [0.5, 0.5]
            
            const imageFile = findImageFile(texture)
            
            const spriteName = spriteElements.length > 1 
              ? `${name}_${state}` 
              : name
            
            if (imageFile) {
              spriteCount.withImage++
              const spritePromise = new Promise((resolve) => {
                const img = new window.Image()
                img.onload = () => {
                  const spriteId = Date.now() + Math.random()
                  addSprite({
                    id: spriteId,
                    name: spriteName,
                    identifier: identifier,
                    sourceRect: { x, y, width, height },
                    origin: { x: originX, y: originY },
                    state: state,
                    imageUrl: imageFile.url,
                    texture: texture,
                    xmlFile: itemFile.filename,
                    xmlContent: itemFile.content,
                  })
                  resolve({ spriteId, item, identifier })
                }
                img.onerror = () => {
                  const spriteId = Date.now() + Math.random()
                  addSprite({
                    id: spriteId,
                    name: spriteName,
                    identifier: identifier,
                    sourceRect: { x, y, width, height },
                    origin: { x: originX, y: originY },
                    state: state,
                    texture: texture,
                    xmlFile: itemFile.filename,
                    xmlContent: itemFile.content,
                  })
                  resolve({ spriteId, item, identifier })
                }
                img.src = imageFile.url
              })
              spritePromises.push(spritePromise)
            } else {
              spriteCount.withoutImage++
              const spriteId = Date.now() + Math.random()
              addSprite({
                id: spriteId,
                name: spriteName,
                identifier: identifier,
                sourceRect: { x, y, width, height },
                origin: { x: originX, y: originY },
                state: state,
                texture: texture,
                xmlFile: itemFile.filename,
                xmlContent: itemFile.content,
              })
              spritePromises.push(Promise.resolve({ spriteId, item, identifier }))
            }
          }
        }
      }

      const spriteResults = await Promise.all(spritePromises)

      const componentTypes = ['Holdable', 'MeleeWeapon', 'RangedWeapon', 'Wearable', 'ItemContainer']
      
      for (const { spriteId, item, identifier } of spriteResults) {
        for (const componentType of componentTypes) {
          const elements = item.getElementsByTagName(componentType)
          for (let j = 0; j < elements.length; j++) {
            const element = elements[j]
            const properties = {}
            
            for (let k = 0; k < element.attributes.length; k++) {
              const attr = element.attributes[k]
              properties[attr.name] = attr.value
            }
            
            addComponentToSprite(spriteId, {
              type: componentType,
              properties,
            })
          }
        }
      }

      setLoading(false)
      setModalVisible(false)
      message.success(`模组导入完成！共找到 ${spriteCount.total} 个精灵，其中 ${spriteCount.withImage} 个已匹配图片，${spriteCount.withoutImage} 个缺少图片`)
    } catch (error) {
      setLoading(false)
      message.error('模组导入失败: ' + error.message)
    }
  }

  return (
    <>
      <Button icon={<FileZipOutlined />} onClick={() => setModalVisible(true)}>
        导入模组
      </Button>
      
      <Modal
        title="导入现有模组"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          setModFiles([])
          setPreviewImage(null)
          setPreviewXml(null)
        }}
        footer={null}
        width={900}
      >
        <div style={{ marginBottom: 16 }}>
          <Upload
            accept=".zip"
            showUploadList={false}
            beforeUpload={(file) => {
              const isZip = file.name.endsWith('.zip')
              if (!isZip) {
                message.error('请上传ZIP格式的模组文件')
                return false
              }
              return true
            }}
            customRequest={({ onSuccess, file }) => {
              setTimeout(() => {
                onSuccess('ok')
              }, 0)
            }}
            onChange={handleFileUpload}
          >
            <Button loading={loading}>
              {loading ? '解析中...' : '选择模组ZIP文件'}
            </Button>
          </Upload>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16 }}>正在解析模组文件...</p>
          </div>
        )}

        {!loading && modFiles.length > 0 && (
          <div>
            <h4 style={{ marginBottom: 16 }}>检测到的模组:</h4>
            <List
              dataSource={modFiles}
              renderItem={(mod) => (
                <List.Item
                  actions={[
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => handleImportMod(mod)}
                    >
                      导入此模组
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <span style={{ fontSize: 16, fontWeight: 600 }}>
                        {mod.modInfo?.name || '未知模组'}
                      </span>
                    }
                    description={
                      <div>
                        <Descriptions size="small" column={2} style={{ marginTop: 8 }}>
                          <Descriptions.Item label="模组ID">
                            <Tag color="blue">{mod.modInfo?.name?.toLowerCase().replace(/\s+/g, '_') || 'N/A'}</Tag>
                          </Descriptions.Item>
                          <Descriptions.Item label="版本">
                            <Tag color="green">{mod.modInfo?.modVersion || '1.0'}</Tag>
                          </Descriptions.Item>
                          <Descriptions.Item label="游戏版本">
                            {mod.modInfo?.gameVersion || 'N/A'}
                          </Descriptions.Item>
                          <Descriptions.Item label="Steam Workshop">
                            {mod.modInfo?.steamWorkshopId ? (
                              <Tag color="orange">{mod.modInfo.steamWorkshopId}</Tag>
                            ) : (
                              <Tag color="default">无</Tag>
                            )}
                          </Descriptions.Item>
                          <Descriptions.Item label="核心包">
                            {mod.modInfo?.corePackage ? (
                              <Tag color="red">是</Tag>
                            ) : (
                              <Tag color="default">否</Tag>
                            )}
                          </Descriptions.Item>
                          <Descriptions.Item label="总文件数">
                            {mod.allFiles.length}
                          </Descriptions.Item>
                        </Descriptions>
                        
                        <Collapse style={{ marginTop: 12 }} size="small">
                          <Panel header={`文件详情 (${mod.allFiles.length} 个文件)`} key="files">
                            <Tabs defaultActiveKey="overview">
                              <TabPane tab="概览" key="overview">
                                <div style={{ display: 'flex', gap: 24 }}>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ marginBottom: 8, fontWeight: 600 }}>
                                      <FileTextOutlined /> XML文件 ({mod.itemFiles.length})
                                    </div>
                                    <List
                                      size="small"
                                      dataSource={mod.itemFiles}
                                      renderItem={(item) => (
                                        <List.Item
                                          style={{ padding: '4px 0' }}
                                          actions={[
                                            <Button
                                              type="link"
                                              size="small"
                                              onClick={() => handleXmlPreview(item)}
                                            >
                                              预览
                                            </Button>,
                                          ]}
                                        >
                                          <List.Item.Meta
                                            avatar={<FileTextOutlined style={{ color: '#1890ff' }} />}
                                            description={item.filename}
                                          />
                                        </List.Item>
                                      )}
                                    />
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ marginBottom: 8, fontWeight: 600 }}>
                                      <FileImageOutlined /> 图片文件 ({mod.imageFiles.length})
                                    </div>
                                    <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                                      {mod.imageFiles.map((img, idx) => (
                                        <div
                                          key={idx}
                                          style={{
                                            display: 'inline-block',
                                            margin: 4,
                                            cursor: 'pointer',
                                            border: '1px solid #d9d9d9',
                                            borderRadius: 4,
                                            padding: 4,
                                          }}
                                          onClick={() => handleImagePreview(img)}
                                        >
                                          <img
                                            src={img.url}
                                            alt={img.filename}
                                            style={{
                                              width: 60,
                                              height: 60,
                                              objectFit: 'contain',
                                              display: 'block',
                                            }}
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </TabPane>
                              <TabPane tab="文件列表" key="files">
                                <List
                                  size="small"
                                  dataSource={mod.allFiles}
                                  renderItem={(filename) => (
                                    <List.Item style={{ padding: '4px 0' }}>
                                      <List.Item.Meta
                                        description={filename}
                                      />
                                    </List.Item>
                                  )}
                                />
                              </TabPane>
                            </Tabs>
                          </Panel>
                        </Collapse>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        )}

        {!loading && modFiles.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
            <p>请上传模组ZIP文件开始导入</p>
            <p style={{ fontSize: 12, marginTop: 8 }}>
              支持标准的潜渊症模组格式
            </p>
          </div>
        )}
      </Modal>

      <Modal
        title="图片预览"
        open={!!previewImage}
        onCancel={() => setPreviewImage(null)}
        footer={null}
        width={600}
      >
        {previewImage && (
          <div style={{ textAlign: 'center' }}>
            <img
              src={previewImage.url}
              alt={previewImage.filename}
              style={{ maxWidth: '100%', maxHeight: '500px' }}
            />
            <div style={{ marginTop: 16, fontSize: 12, color: '#666' }}>
              {previewImage.filename}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="XML预览"
        open={!!previewXml}
        onCancel={() => setPreviewXml(null)}
        footer={null}
        width={800}
      >
        {previewXml && (
          <div>
            <div style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>
              {previewXml.filename}
            </div>
            <pre
              style={{
                background: '#f5f5f5',
                padding: 16,
                borderRadius: 4,
                maxHeight: 500,
                overflow: 'auto',
                fontSize: 12,
                fontFamily: 'monospace',
              }}
            >
              {previewXml.content}
            </pre>
          </div>
        )}
      </Modal>
    </>
  )
}

export default ModImporter