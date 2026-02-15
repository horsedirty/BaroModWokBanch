import React from 'react'
import { Card, Button, message } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import useStore from '../store/store'
import { generateXML } from '../utils/xmlGenerator'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import './CodePreview.css'

const CodePreview = () => {
  const { modInfo, sprites, components, currentImage } = useStore()

  const handleExport = async () => {
    if (!modInfo.name || !modInfo.id) {
      message.error('请填写Mod名称和ID')
      return
    }

    if (sprites.length === 0) {
      message.error('请至少创建一个Sprite')
      return
    }

    try {
      const zip = new JSZip()

      const xmlContent = generateXML(modInfo, sprites, components)
      
      const filelistXml = `<?xml version="1.0" encoding="utf-8"?>
<files>
  <file name="${modInfo.id}.xml" />
  <file name="${modInfo.id}.png" />
</files>`

      const contentXml = `<?xml version="1.0" encoding="utf-8"?>
<ContentPackage>
  <Item file="${modInfo.id}.xml" />
</ContentPackage>`

      zip.file('filelist.xml', filelistXml)
      zip.file('Content.xml', contentXml)
      zip.file(`${modInfo.id}.xml`, xmlContent)

      if (currentImage) {
        const response = await fetch(currentImage)
        const blob = await response.blob()
        zip.file(`${modInfo.id}.png`, blob)
      }

      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, `${modInfo.name}.zip`)
      message.success('Mod导出成功！')
    } catch (error) {
      message.error('导出失败: ' + error.message)
    }
  }

  const xmlContent = generateXML(modInfo, sprites, components)

  return (
    <div className="code-preview">
      <Card
        title="XML预览"
        extra={
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExport}
          >
            导出Mod
          </Button>
        }
      >
        <pre className="xml-content">{xmlContent}</pre>
      </Card>
    </div>
  )
}

export default CodePreview