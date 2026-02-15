import React from 'react'
import { Button, Dropdown, message, Modal } from 'antd'
import { 
  SaveOutlined, 
  ExportOutlined,
  FileZipOutlined,
  FileTextOutlined 
} from '@ant-design/icons'
import JSZip from 'jszip'
import useStore from '../store/store'

const SaveExport = () => {
  const { 
    modFiles, 
    openFiles, 
    activeFile, 
    modifiedFiles, 
    markFileAsSaved 
  } = useStore()

  const saveCurrentFile = () => {
    if (!activeFile) {
      message.warning('没有打开的文件')
      return
    }

    const currentFile = openFiles.find(f => f.filename === activeFile)
    if (!currentFile || !currentFile.content) {
      message.warning('当前文件没有内容')
      return
    }

    const blob = new Blob([currentFile.content], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = activeFile.split('/').pop()
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    markFileAsSaved(activeFile)
    message.success(`文件 ${activeFile.split('/').pop()} 已保存`)
  }

  const exportModZip = async () => {
    if (!modFiles || modFiles.length === 0) {
      message.warning('没有可导出的模组')
      return
    }

    const zip = new JSZip()

    modFiles.forEach(mod => {
      if (mod.filelist) {
        zip.file('filelist.xml', mod.filelist)
      }

      if (mod.itemFiles) {
        mod.itemFiles.forEach(file => {
          zip.file(file.filename, file.content)
        })
      }

      if (mod.imageFiles) {
        mod.imageFiles.forEach(file => {
          if (file.blob) {
            zip.file(file.filename, file.blob)
          }
        })
      }
    })

    try {
      const content = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(content)
      const link = document.createElement('a')
      link.href = url
      link.download = `${modFiles[0]?.modInfo?.name || 'mod'}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      message.success('模组导出成功')
    } catch (error) {
      message.error('导出失败: ' + error.message)
    }
  }

  const menuItems = [
    {
      key: 'save-current',
      icon: <FileTextOutlined />,
      label: '保存当前文件',
      onClick: saveCurrentFile,
      disabled: !activeFile
    },
    {
      key: 'export-zip',
      icon: <FileZipOutlined />,
      label: '导出为ZIP',
      onClick: exportModZip,
      disabled: !modFiles || modFiles.length === 0
    }
  ]

  const hasModifiedFiles = modifiedFiles && modifiedFiles.size > 0

  return (
    <Dropdown
      menu={{ items: menuItems }}
      placement="bottomRight"
    >
      <Button 
        icon={<ExportOutlined />}
        type={hasModifiedFiles ? 'primary' : 'default'}
      >
        保存/导出
        {hasModifiedFiles && ` (${modifiedFiles.size})`}
      </Button>
    </Dropdown>
  )
}

export default SaveExport
