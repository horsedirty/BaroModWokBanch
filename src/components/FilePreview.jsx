import React from 'react'
import { Empty, Tabs, Tag, Space, Button, Slider, Tooltip, Input } from 'antd'
import { 
  FileTextOutlined, 
  FileImageOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ExpandOutlined,
  CompressOutlined,
  DragOutlined,
  EditOutlined,
  SaveOutlined 
} from '@ant-design/icons'
import useStore from '../store/store'
import './FilePreview.css'

const { TabPane } = Tabs
const { TextArea } = Input

const FilePreview = () => {
  const { selectedFile, openFiles, activeFile, setActiveFile, closeFile, modifiedFiles, updateXmlFileContent } = useStore()
  const [zoomLevel, setZoomLevel] = React.useState(100)
  const [panPosition, setPanPosition] = React.useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 })
  const [fitToScreen, setFitToScreen] = React.useState(true)
  const [isEditing, setIsEditing] = React.useState(false)
  const [editContent, setEditContent] = React.useState('')
  const imageRef = React.useRef(null)

  React.useEffect(() => {
    setZoomLevel(100)
    setPanPosition({ x: 0, y: 0 })
    setFitToScreen(true)
    setIsDragging(false)
    setIsEditing(false)
    setEditContent('')
  }, [activeFile])

  const handleStartEdit = () => {
    const currentFile = openFiles.find(f => f.filename === activeFile)
    if (currentFile && currentFile.content) {
      setEditContent(currentFile.content)
      setIsEditing(true)
    }
  }

  const handleSaveEdit = () => {
    if (activeFile && editContent) {
      updateXmlFileContent(activeFile, editContent)
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditContent('')
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 400))
    setFitToScreen(false)
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 25))
    setFitToScreen(false)
  }

  const handleZoomChange = (value) => {
    setZoomLevel(value)
    setFitToScreen(false)
  }

  const handleFitToScreen = () => {
    setFitToScreen(true)
    setZoomLevel(100)
    setPanPosition({ x: 0, y: 0 })
  }

  const handleMouseDown = (e) => {
    if (e.button === 0) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y })
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPanPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -25 : 25
    setZoomLevel(prev => {
      const newZoom = Math.max(25, Math.min(400, prev + delta))
      if (newZoom !== prev) {
        setFitToScreen(false)
      }
      return newZoom
    })
  }

  const renderXmlContent = (content, filename) => {
    if (isEditing) {
      return (
        <div className="xml-editor-container">
          <div className="xml-editor-toolbar">
            <Space>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSaveEdit}
                size="small"
              >
                保存
              </Button>
              <Button
                onClick={handleCancelEdit}
                size="small"
              >
                取消
              </Button>
            </Space>
          </div>
          <TextArea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="xml-textarea"
            autoSize={false}
          />
        </div>
      )
    }

    return (
      <div className="xml-preview-container">
        <div className="xml-preview-toolbar">
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={handleStartEdit}
              size="small"
            >
              编辑
            </Button>
          </Space>
        </div>
        <pre className="xml-content">
          {content}
        </pre>
      </div>
    )
  }

  const renderImageContent = (file) => {
    return (
      <div className="image-preview-container">
        <div className="image-toolbar">
          <Space size={8}>
            <Tooltip title="放大">
              <Button
                size="small"
                icon={<ZoomInOutlined />}
                onClick={handleZoomIn}
                disabled={zoomLevel >= 400}
              />
            </Tooltip>
            <Tooltip title="缩小">
              <Button
                size="small"
                icon={<ZoomOutOutlined />}
                onClick={handleZoomOut}
                disabled={zoomLevel <= 25}
              />
            </Tooltip>
            <Slider
              min={25}
              max={400}
              value={zoomLevel}
              onChange={handleZoomChange}
              style={{ width: 100 }}
              tooltipFormatter={(value) => `${value}%`}
            />
            <Tooltip title="适应屏幕">
              <Button
                size="small"
                icon={fitToScreen ? <CompressOutlined /> : <ExpandOutlined />}
                onClick={handleFitToScreen}
              />
            </Tooltip>
            <Tooltip title="拖拽移动图片">
              <Button
                size="small"
                icon={<DragOutlined />}
                disabled={fitToScreen}
              />
            </Tooltip>
          </Space>
        </div>
        <div
          className="image-preview-wrapper"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <img
            ref={imageRef}
            src={file.url}
            alt={file.filename}
            className="preview-image"
            style={{
              transform: fitToScreen 
                ? 'none' 
                : `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel / 100})`,
              transformOrigin: 'center center',
              maxWidth: fitToScreen ? '100%' : 'none',
              maxHeight: fitToScreen ? '100%' : 'none',
            }}
          />
        </div>
        <div className="image-info">
          <Space size={8}>
            <Tag color="blue">{file.filename.split('.').pop().toUpperCase()}</Tag>
            <span className="image-filename">{file.filename}</span>
            <Tag color="green">{zoomLevel}%</Tag>
          </Space>
        </div>
      </div>
    )
  }

  const renderFileContent = (file) => {
    const ext = file.filename.split('.').pop().toLowerCase()
    
    if (ext === 'xml' && file.content) {
      return renderXmlContent(file.content, file.filename)
    } else if ((ext === 'png' || ext === 'xcf') && file.url) {
      return renderImageContent(file)
    } else if (ext === 'xml') {
      return (
        <Empty
          description="XML文件内容为空"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )
    }
    
    return (
      <Empty
        description="无法预览此文件类型"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    )
  }

  const handleTabChange = (key) => {
    setActiveFile(key)
  }

  const handleTabClose = (e, file) => {
    e.stopPropagation()
    closeFile(file.filename)
  }

  return (
    <div className="file-preview">
      {openFiles.length > 0 ? (
        <>
          <Tabs
            activeKey={activeFile}
            onChange={handleTabChange}
            type="editable-card"
            hideAdd
            className="file-tabs"
            onEdit={(targetKey, action) => {
              if (action === 'remove') {
                const file = openFiles.find(f => f.filename === targetKey)
                if (file) {
                  closeFile(file.filename)
                }
              }
            }}
          >
            {openFiles.map(file => {
              const isModified = modifiedFiles && modifiedFiles.has(file.filename)
              return (
                <TabPane
                  key={file.filename}
                  tab={
                    <span className="tab-title">
                      {file.filename.split('.').pop().toLowerCase() === 'xml' ? (
                        <FileTextOutlined />
                      ) : (
                        <FileImageOutlined />
                      )}
                      <span className="tab-filename">
                        {file.filename.split('/').pop()}
                        {isModified && ' *'}
                      </span>
                    </span>
                  }
                >
                  {activeFile === file.filename && renderFileContent(file)}
                </TabPane>
              )
            })}
          </Tabs>
        </>
      ) : (
        <div className="empty-preview">
          <Empty
            description={
              <div>
                <p>选择一个文件开始编辑</p>
                <p style={{ fontSize: 12, color: '#666' }}>
                  在左侧文件浏览器中点击文件
                </p>
              </div>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      )}
    </div>
  )
}

export default FilePreview