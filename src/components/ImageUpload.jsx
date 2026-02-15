import React from 'react'
import { Upload, Button, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import useStore from '../store/store'

const ImageUpload = () => {
  const { setCurrentImage } = useStore()

  const handleFileChange = (info) => {
    if (info.file.status === 'done') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new window.Image()
        img.onload = () => {
          setCurrentImage(e.target.result, { width: img.width, height: img.height })
          message.success('图片加载成功')
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(info.file.originFileObj)
    }
  }

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('只能上传图片文件')
      return false
    }
    const isLt10M = file.size / 1024 / 1024 < 10
    if (!isLt10M) {
      message.error('图片大小不能超过10MB')
      return false
    }
    return true
  }

  const uploadProps = {
    name: 'file',
    accept: 'image/*',
    showUploadList: false,
    beforeUpload,
    customRequest: ({ onSuccess, file }) => {
      setTimeout(() => {
        onSuccess('ok')
      }, 0)
    },
    onChange: handleFileChange,
  }

  return (
    <Upload {...uploadProps}>
      <Button type="primary" icon={<UploadOutlined />}>
        上传图片
      </Button>
    </Upload>
  )
}

export default ImageUpload