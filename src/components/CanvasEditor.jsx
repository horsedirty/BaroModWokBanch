import React from 'react'
import { Stage, Layer, Rect, Image as KonvaImage, Transformer, Line, Circle, Group } from 'react-konva'
import { Button, Space, Slider, Tooltip, Divider } from 'antd'
import { 
  ZoomInOutlined, 
  ZoomOutOutlined, 
  DragOutlined,
  BorderOutlined,
  AimOutlined,
  ExpandOutlined,
  CompressOutlined
} from '@ant-design/icons'
import useStore from '../store/store'
import './CanvasEditor.css'

const CanvasEditor = () => {
  const {
    currentImage,
    imageDimensions,
    sprites,
    selectedSpriteId,
    addSprite,
    updateSprite,
    setSelectedSpriteId,
    setSelectedFile,
    updateXmlFileContent,
  } = useStore()

  const [stageSize, setStageSize] = React.useState({ width: 800, height: 600 })
  const [imageObj, setImageObj] = React.useState(null)
  const [spriteImages, setSpriteImages] = React.useState({})
  const [isDrawing, setIsDrawing] = React.useState(false)
  const [startPos, setStartPos] = React.useState({ x: 0, y: 0 })
  const [newRect, setNewRect] = React.useState(null)
  const [isDraggingOrigin, setIsDraggingOrigin] = React.useState(false)
  const [zoomLevel, setZoomLevel] = React.useState(100)
  const [stagePos, setStagePos] = React.useState({ x: 0, y: 0 })
  const [tool, setTool] = React.useState('select')
  const transformerRef = React.useRef()
  const stageRef = React.useRef()
  const layerRef = React.useRef()

  React.useEffect(() => {
    if (currentImage) {
      const img = new window.Image()
      img.src = currentImage
      img.onload = () => {
        setImageObj(img)
        const maxWidth = stageSize.width - 40
        const maxHeight = stageSize.height - 40
        const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1)
        setStageSize({
          width: Math.max(img.width * scale, 800),
          height: Math.max(img.height * scale, 600),
        })
      }
    }
  }, [currentImage])

  React.useEffect(() => {
    const loadSpriteImages = async () => {
      const images = {}
      for (const sprite of sprites) {
        if (sprite.imageUrl && !spriteImages[sprite.id]) {
          const img = new window.Image()
          img.src = sprite.imageUrl
          await new Promise((resolve) => {
            img.onload = () => {
              images[sprite.id] = img
              resolve()
            }
            img.onerror = () => {
              resolve()
            }
          })
        }
      }
      if (Object.keys(images).length > 0) {
        setSpriteImages(prev => ({ ...prev, ...images }))
      }
    }
    loadSpriteImages()
  }, [sprites])

  React.useEffect(() => {
    if (selectedSpriteId && sprites.length > 0) {
      const selectedSprite = sprites.find(s => s.id === selectedSpriteId)
      if (selectedSprite && selectedSprite.imageUrl && spriteImages[selectedSprite.id]) {
        const img = spriteImages[selectedSprite.id]
        const maxWidth = stageSize.width - 40
        const maxHeight = stageSize.height - 40
        const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1)
        setStageSize({
          width: Math.max(img.width * scale, 800),
          height: Math.max(img.height * scale, 600),
        })
      }
      
      if (selectedSprite && selectedSprite.xmlFile && selectedSprite.xmlContent) {
        setSelectedFile({
          filename: selectedSprite.xmlFile,
          content: selectedSprite.xmlContent,
        })
      }
    } else if (sprites.length > 0 && !currentImage) {
      const firstSpriteWithImage = sprites.find(s => s.imageUrl)
      if (firstSpriteWithImage && spriteImages[firstSpriteWithImage.id]) {
        const img = spriteImages[firstSpriteWithImage.id]
        const maxWidth = stageSize.width - 40
        const maxHeight = stageSize.height - 40
        const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1)
        setStageSize({
          width: Math.max(img.width * scale, 800),
          height: Math.max(img.height * scale, 600),
        })
      }
      
      if (firstSpriteWithImage && firstSpriteWithImage.xmlFile && firstSpriteWithImage.xmlContent) {
        setSelectedFile({
          filename: firstSpriteWithImage.xmlFile,
          content: firstSpriteWithImage.xmlContent,
        })
      }
    }
  }, [selectedSpriteId, sprites, currentImage, spriteImages])

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 400))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 25))
  }

  const handleZoomChange = (value) => {
    setZoomLevel(value)
  }

  const handleFitToScreen = () => {
    setZoomLevel(100)
    setStagePos({ x: 0, y: 0 })
  }

  const handleWheel = (e) => {
    e.evt.preventDefault()
    const delta = e.evt.deltaY > 0 ? -10 : 10
    setZoomLevel(prev => Math.max(25, Math.min(400, prev + delta)))
  }

  const handleStageClick = (e) => {
    if (e.target === e.target.getStage()) {
      setSelectedSpriteId(null)
    }
  }

  const handleMouseDown = (e) => {
    if (tool !== 'draw') return
    if (e.target !== e.target.getStage()) return
    
    const stage = e.target.getStage()
    const pos = stage.getPointerPosition()
    const scale = zoomLevel / 100
    
    setIsDrawing(true)
    setStartPos({
      x: (pos.x - stagePos.x) / scale,
      y: (pos.y - stagePos.y) / scale
    })
    setNewRect({
      x: (pos.x - stagePos.x) / scale,
      y: (pos.y - stagePos.y) / scale,
      width: 0,
      height: 0,
    })
  }

  const handleMouseMove = (e) => {
    if (!isDrawing) return
    
    const stage = e.target.getStage()
    const pos = stage.getPointerPosition()
    const scale = zoomLevel / 100
    
    const currentX = (pos.x - stagePos.x) / scale
    const currentY = (pos.y - stagePos.y) / scale
    
    setNewRect({
      x: Math.min(startPos.x, currentX),
      y: Math.min(startPos.y, currentY),
      width: Math.abs(currentX - startPos.x),
      height: Math.abs(currentY - startPos.y),
    })
  }

  const handleMouseUp = () => {
    if (!isDrawing || !newRect || newRect.width < 10 || newRect.height < 10) {
      setIsDrawing(false)
      setNewRect(null)
      return
    }

    const baseImage = imageObj || (sprites.length > 0 ? spriteImages[sprites[0].id] : null)
    if (!baseImage) {
      setIsDrawing(false)
      setNewRect(null)
      return
    }

    const scaleX = baseImage.width / stageSize.width
    const scaleY = baseImage.height / stageSize.height

    addSprite({
      name: `Sprite_${sprites.length + 1}`,
      sourceRect: {
        x: Math.round(newRect.x * scaleX),
        y: Math.round(newRect.y * scaleY),
        width: Math.round(newRect.width * scaleX),
        height: Math.round(newRect.height * scaleY),
      },
      origin: { x: 0.5, y: 0.5 },
    })

    setIsDrawing(false)
    setNewRect(null)
  }

  const handleTransformEnd = (e, id) => {
    const node = e.target
    const sprite = sprites.find(s => s.id === id)
    if (!sprite || !spriteImages[id]) return
    
    const spriteImg = spriteImages[id]
    const scaleX = spriteImg.width / stageSize.width
    const scaleY = spriteImg.height / stageSize.height

    const newSourceRect = {
      x: Math.round(node.x() / scaleX),
      y: Math.round(node.y() / scaleY),
      width: Math.round(node.width() / scaleX),
      height: Math.round(node.height() / scaleY),
    }

    updateSprite(id, {
      sourceRect: newSourceRect,
    })

    if (sprite.xmlFile && sprite.xmlContent) {
      updateXmlContent(sprite, newSourceRect, sprite.origin)
    }
  }

  const handleDragEnd = (e, id) => {
    const node = e.target
    const sprite = sprites.find(s => s.id === id)
    if (!sprite || !spriteImages[id]) return
    
    const spriteImg = spriteImages[id]
    const scaleX = spriteImg.width / stageSize.width
    const scaleY = spriteImg.height / stageSize.height

    const newSourceRect = {
      x: Math.round(node.x() / scaleX),
      y: Math.round(node.y() / scaleY),
      width: Math.round(node.width() / scaleX),
      height: Math.round(node.height() / scaleY),
    }

    updateSprite(id, {
      sourceRect: newSourceRect,
    })

    if (sprite.xmlFile && sprite.xmlContent) {
      updateXmlContent(sprite, newSourceRect, sprite.origin)
    }
  }

  const handleOriginDragMove = (e, sprite) => {
    const pos = e.target.getPointerPosition()
    const spriteImg = spriteImages[sprite.id]
    if (!spriteImg) return
    
    const scaleX = stageSize.width / spriteImg.width
    const scaleY = stageSize.height / spriteImg.height
    
    const rectX = sprite.sourceRect.x * scaleX
    const rectY = sprite.sourceRect.y * scaleY
    const rectWidth = sprite.sourceRect.width * scaleX
    const rectHeight = sprite.sourceRect.height * scaleY
    
    const originX = Math.max(0, Math.min(1, (pos.x - rectX) / rectWidth))
    const originY = Math.max(0, Math.min(1, (pos.y - rectY) / rectHeight))
    
    updateSprite(sprite.id, {
      origin: { x: originX, y: originY },
    })

    if (sprite.xmlFile && sprite.xmlContent) {
      updateXmlContent(sprite, sprite.sourceRect, { x: originX, y: originY })
    }
  }

  const updateXmlContent = (sprite, sourceRect, origin) => {
    const { modFiles, openFiles } = useStore.getState()
    
    let currentXmlContent = sprite.xmlContent
    
    const openFile = openFiles.find(f => f.filename === sprite.xmlFile)
    if (openFile && openFile.content) {
      currentXmlContent = openFile.content
    } else {
      for (const mod of modFiles) {
        if (mod.itemFiles) {
          const foundFile = mod.itemFiles.find(f => f.filename === sprite.xmlFile)
          if (foundFile && foundFile.content) {
            currentXmlContent = foundFile.content
            break
          }
        }
      }
    }
    
    if (!currentXmlContent) return

    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(currentXmlContent, 'text/xml')
    const items = xmlDoc.getElementsByTagName('Item')

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const identifier = item.getAttribute('identifier')
      
      if (identifier === sprite.identifier) {
        const spritesInItem = item.getElementsByTagName('Sprite')
        for (let j = 0; j < spritesInItem.length; j++) {
          const spriteElement = spritesInItem[j]
          const state = spriteElement.getAttribute('state') || 'Normal'
          
          if (state === sprite.state || (state === 'Normal' && !sprite.state)) {
            spriteElement.setAttribute('sourcerect', 
              `${sourceRect.x},${sourceRect.y},${sourceRect.width},${sourceRect.height}`)
            spriteElement.setAttribute('origin', 
              `${origin.x.toFixed(2)},${origin.y.toFixed(2)}`)
            break
          }
        }
        break
      }
    }

    const serializer = new XMLSerializer()
    const newXmlContent = serializer.serializeToString(xmlDoc)
    
    updateXmlFileContent(sprite.xmlFile, newXmlContent)
    
    updateSprite(sprite.id, {
      xmlContent: newXmlContent,
    })
  }

  const renderOriginCrosshair = (sprite, scaleX, scaleY) => {
    const rectX = sprite.sourceRect.x * scaleX
    const rectY = sprite.sourceRect.y * scaleY
    const rectWidth = sprite.sourceRect.width * scaleX
    const rectHeight = sprite.sourceRect.height * scaleY
    
    const originX = rectX + rectWidth * (sprite.origin?.x || 0.5)
    const originY = rectY + rectHeight * (sprite.origin?.y || 0.5)
    
    const crossSize = 15
    
    return (
      <Group key={`origin-${sprite.id}`}>
        <Line
          points={[originX - crossSize, originY, originX + crossSize, originY]}
          stroke="#ff0000"
          strokeWidth={2}
        />
        <Line
          points={[originX, originY - crossSize, originX, originY + crossSize]}
          stroke="#ff0000"
          strokeWidth={2}
        />
        <Circle
          x={originX}
          y={originY}
          radius={6}
          fill="#ff0000"
          stroke="#ffffff"
          strokeWidth={2}
          draggable
          onDragMove={(e) => handleOriginDragMove(e, sprite)}
          dragBoundFunc={(pos) => ({
            x: Math.max(rectX, Math.min(rectX + rectWidth, pos.x)),
            y: Math.max(rectY, Math.min(rectY + rectHeight, pos.y)),
          })}
        />
      </Group>
    )
  }

  const renderCurrentSprite = () => {
    if (!selectedSpriteId && sprites.length > 0) {
      const firstSpriteWithImage = sprites.find(s => s.imageUrl && spriteImages[s.id])
      if (firstSpriteWithImage) {
        return renderSprite(firstSpriteWithImage)
      }
    }
    
    if (selectedSpriteId) {
      const selectedSprite = sprites.find(s => s.id === selectedSpriteId)
      if (selectedSprite && spriteImages[selectedSprite.id]) {
        return renderSprite(selectedSprite)
      }
    }
    
    return null
  }

  const renderSprite = (sprite) => {
    const spriteImg = spriteImages[sprite.id]
    if (!spriteImg) return null
    
    const scaleX = stageSize.width / spriteImg.width
    const scaleY = stageSize.height / spriteImg.height
    
    return (
      <React.Fragment key={sprite.id}>
        <KonvaImage
          image={spriteImg}
          x={sprite.sourceRect.x * scaleX}
          y={sprite.sourceRect.y * scaleY}
          width={sprite.sourceRect.width * scaleX}
          height={sprite.sourceRect.height * scaleY}
          crop={{
            x: sprite.sourceRect.x,
            y: sprite.sourceRect.y,
            width: sprite.sourceRect.width,
            height: sprite.sourceRect.height,
          }}
          stroke={selectedSpriteId === sprite.id ? '#ff0000' : '#00ff00'}
          strokeWidth={2}
          draggable={tool === 'select'}
          onDragEnd={(e) => handleDragEnd(e, sprite.id)}
          onClick={() => setSelectedSpriteId(sprite.id)}
          onTap={() => setSelectedSpriteId(sprite.id)}
        />
        
        {(selectedSpriteId === sprite.id || (!selectedSpriteId && sprites[0]?.id === sprite.id)) && 
          renderOriginCrosshair(sprite, scaleX, scaleY)}
        
        {selectedSpriteId === sprite.id && (
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 10 || newBox.height < 10) {
                return oldBox
              }
              return newBox
            }}
            onTransformEnd={(e) => handleTransformEnd(e, sprite.id)}
          />
        )}
      </React.Fragment>
    )
  }

  const scale = zoomLevel / 100

  return (
    <div className="canvas-editor">
      <div className="canvas-toolbar">
        <Space size={4}>
          <Tooltip title="选择工具">
            <Button
              type={tool === 'select' ? 'primary' : 'default'}
              icon={<DragOutlined />}
              onClick={() => setTool('select')}
              size="small"
            />
          </Tooltip>
          <Tooltip title="框选工具">
            <Button
              type={tool === 'draw' ? 'primary' : 'default'}
              icon={<BorderOutlined />}
              onClick={() => setTool('draw')}
              size="small"
            />
          </Tooltip>
          <Tooltip title="定位工具">
            <Button
              type={tool === 'origin' ? 'primary' : 'default'}
              icon={<AimOutlined />}
              onClick={() => setTool('origin')}
              size="small"
            />
          </Tooltip>
        </Space>
        
        <Divider type="vertical" style={{ height: 20, margin: '0 8px' }} />
        
        <Space size={4}>
          <Tooltip title="放大">
            <Button
              icon={<ZoomInOutlined />}
              onClick={handleZoomIn}
              disabled={zoomLevel >= 400}
              size="small"
            />
          </Tooltip>
          <Slider
            min={25}
            max={400}
            value={zoomLevel}
            onChange={handleZoomChange}
            style={{ width: 80 }}
            tooltipFormatter={(value) => `${value}%`}
          />
          <Tooltip title="缩小">
            <Button
              icon={<ZoomOutOutlined />}
              onClick={handleZoomOut}
              disabled={zoomLevel <= 25}
              size="small"
            />
          </Tooltip>
          <Tooltip title="适应屏幕">
            <Button
              icon={<CompressOutlined />}
              onClick={handleFitToScreen}
              size="small"
            />
          </Tooltip>
        </Space>
        
        <div className="zoom-info">
          {zoomLevel}%
        </div>
      </div>
      
      <div className="canvas-container">
        {currentImage || (sprites.length > 0 && sprites.some(s => s.imageUrl)) ? (
          <Stage
            ref={stageRef}
            width={stageSize.width * scale}
            height={stageSize.height * scale}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onClick={handleStageClick}
            onWheel={handleWheel}
            style={{ cursor: tool === 'draw' ? 'crosshair' : 'default' }}
          >
            <Layer ref={layerRef} scaleX={scale} scaleY={scale}>
              {currentImage ? (
                <KonvaImage
                  image={imageObj}
                  width={stageSize.width}
                  height={stageSize.height}
                />
              ) : null}
              
              {renderCurrentSprite()}
              
              {newRect && (
                <Rect
                  x={newRect.x}
                  y={newRect.y}
                  width={newRect.width}
                  height={newRect.height}
                  fill="rgba(0, 255, 0, 0.2)"
                  stroke="#00ff00"
                  strokeWidth={2}
                />
              )}
            </Layer>
          </Stage>
        ) : (
          <div className="empty-state">
            <p>拖拽图片到此处或点击上传</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CanvasEditor
