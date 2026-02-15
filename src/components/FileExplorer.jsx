import React from 'react'
import { Tree, Input, Empty, Tag, Space, Badge } from 'antd'
import { 
  FileOutlined, 
  FolderOutlined, 
  FolderOpenOutlined,
  FileImageOutlined,
  FileTextOutlined,
  FileZipOutlined,
  EditOutlined 
} from '@ant-design/icons'
import useStore from '../store/store'
import './FileExplorer.css'

const { DirectoryTree } = Tree
const { Search } = Input

const FileExplorer = () => {
  const { modFiles, selectedFile, setSelectedFile, modifiedFiles } = useStore()
  const [expandedKeys, setExpandedKeys] = React.useState([])
  const [searchValue, setSearchValue] = React.useState('')
  const [autoExpandParent, setAutoExpandParent] = React.useState(true)

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase()
    if (ext === 'png' || ext === 'xcf') {
      return <FileImageOutlined style={{ color: '#1890ff' }} />
    } else if (ext === 'xml') {
      return <FileTextOutlined style={{ color: '#52c41a' }} />
    } else if (ext === 'zip') {
      return <FileZipOutlined style={{ color: '#fa8c16' }} />
    }
    return <FileOutlined />
  }

  const buildTreeData = (files) => {
    const tree = {}
    
    files.forEach(file => {
      const parts = file.filename.split('/')
      let current = tree
      
      parts.forEach((part, index) => {
        const fullPath = parts.slice(0, index + 1).join('/')
        
        if (!current[part]) {
          current[part] = {
            key: fullPath,
            title: part,
            isLeaf: index === parts.length - 1,
            children: {},
            file: index === parts.length - 1 ? file : null
          }
        }
        current = current[part].children
      })
    })

    const convertToArray = (node) => {
      return Object.values(node).map(item => {
        const isModified = item.isLeaf && modifiedFiles && modifiedFiles.has(item.key)
        
        return {
          key: item.key,
          title: item.title,
          icon: item.isLeaf ? getFileIcon(item.title) : null,
          isLeaf: item.isLeaf,
          children: item.isLeaf ? undefined : convertToArray(item.children),
          file: item.file,
          isModified: isModified
        }
      })
    }

    return convertToArray(tree)
  }

  const treeData = React.useMemo(() => {
    if (!modFiles || modFiles.length === 0) return []
    
    const allFiles = []
    modFiles.forEach(mod => {
      if (mod.itemFiles) {
        allFiles.push(...mod.itemFiles)
      }
      if (mod.imageFiles) {
        allFiles.push(...mod.imageFiles)
      }
    })

    return buildTreeData(allFiles)
  }, [modFiles, modifiedFiles])

  const handleSelect = (selectedKeys, info) => {
    if (info.node.isLeaf && info.node.file) {
      const file = info.node.file
      if (!file.content && file.filename) {
        const { modFiles } = useStore.getState()
        for (const mod of modFiles) {
          if (mod.itemFiles) {
            const foundFile = mod.itemFiles.find(f => f.filename === file.filename)
            if (foundFile && foundFile.content) {
              setSelectedFile({ ...file, content: foundFile.content })
              return
            }
          }
        }
      }
      setSelectedFile(file)
    }
  }

  const handleExpand = (expandedKeys) => {
    setExpandedKeys(expandedKeys)
    setAutoExpandParent(false)
  }

  const titleRender = (node) => {
    return (
      <span className="file-tree-title">
        {node.title}
        {node.isModified && (
          <Badge 
            status="warning" 
            style={{ marginLeft: 4 }}
            title="已修改"
          />
        )}
      </span>
    )
  }

  const filterTreeData = (data, searchValue) => {
    if (!searchValue) return data

    return data.reduce((acc, node) => {
      const isMatch = node.title.toLowerCase().includes(searchValue.toLowerCase())
      const filteredChildren = node.children ? filterTreeData(node.children, searchValue) : []

      if (isMatch || filteredChildren.length > 0) {
        acc.push({
          ...node,
          children: filteredChildren.length > 0 ? filteredChildren : node.children
        })
      }

      return acc
    }, [])
  }

  const filteredTreeData = filterTreeData(treeData, searchValue)

  return (
    <div className="file-explorer">
      <div className="file-explorer-header">
        <div className="file-explorer-title">
          <FileOutlined />
          <span>文件浏览器</span>
        </div>
        <Search
          placeholder="搜索文件"
          allowClear
          size="small"
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value)
            setAutoExpandParent(true)
          }}
          style={{ width: '100%' }}
        />
      </div>

      <div className="file-explorer-content">
        {filteredTreeData.length > 0 ? (
          <DirectoryTree
            showIcon
            expandedKeys={expandedKeys}
            autoExpandParent={autoExpandParent}
            onExpand={handleExpand}
            onSelect={handleSelect}
            treeData={filteredTreeData}
            selectedKeys={selectedFile ? [selectedFile.filename] : []}
            className="file-tree"
            titleRender={titleRender}
          />
        ) : (
          <Empty
            description={
              modFiles && modFiles.length > 0
                ? '暂无文件'
                : '请先导入模组'
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ marginTop: 40 }}
          />
        )}
      </div>

      {selectedFile && (
        <div className="file-explorer-footer">
          <div className="selected-file-info">
            <Space size={4}>
              <Tag color="blue">{selectedFile.filename.split('.').pop().toUpperCase()}</Tag>
              <span className="selected-file-name">{selectedFile.filename}</span>
            </Space>
          </div>
        </div>
      )}
    </div>
  )
}

export default FileExplorer