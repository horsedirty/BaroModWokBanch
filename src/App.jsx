import React from 'react'
import { Layout, ConfigProvider, theme, Switch, Menu, Dropdown } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { 
  FileOutlined, 
  FolderOutlined, 
  SettingOutlined,
  FileAddOutlined,
  ImportOutlined 
} from '@ant-design/icons'
import CanvasEditor from './components/CanvasEditor'
import PropertyPanel from './components/PropertyPanel'
import FilePreview from './components/FilePreview'
import FileExplorer from './components/FileExplorer'
import ImageUpload from './components/ImageUpload'
import SpriteList from './components/SpriteList'
import XMLImporter from './components/XMLImporter'
import ModImporter from './components/ModImporter'
import SaveExport from './components/SaveExport'
import useStore from './store/store'
import './App.css'

const { Header, Sider, Content, Footer } = Layout

const App = () => {
  const [isDarkMode, setIsDarkMode] = React.useState(true)
  const [activeView, setActiveView] = React.useState('files')
  const { modInfo } = useStore()

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const menuItems = [
    {
      key: 'files',
      icon: <FolderOutlined />,
      label: '文件浏览器',
    },
    {
      key: 'sprites',
      icon: <FileOutlined />,
      label: '精灵列表',
    },
  ]

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#d4a017',
          colorBgBase: isDarkMode ? '#0a0a0a' : '#f5f5f5',
          colorBgContainer: isDarkMode ? '#1a1a1a' : '#ffffff',
          colorBorder: isDarkMode ? '#333333' : '#d9d9d9',
          colorText: isDarkMode ? '#e0e0e0' : '#333333',
          colorTextSecondary: isDarkMode ? '#a0a0a0' : '#666666',
        },
      }}
    >
      <div className={`app-layout ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        <Header className="app-header">
          <div className="logo">BaroMod Workbench</div>
          {modInfo.name && (
            <div className="mod-info">
              <span className="mod-name">{modInfo.name}</span>
              <span className="mod-id">ID: {modInfo.id}</span>
            </div>
          )}
          <div className="header-actions">
            <div className="theme-toggle">
              <Switch
                checked={isDarkMode}
                onChange={toggleTheme}
                checkedChildren="暗色"
                unCheckedChildren="亮色"
              />
            </div>
            <ImageUpload />
            <XMLImporter />
            <ModImporter />
            <SaveExport />
          </div>
        </Header>
        
        <div className="main-layout">
          <div className="explorer-sider">
            <Menu
              mode="horizontal"
              selectedKeys={[activeView]}
              items={menuItems}
              onClick={({ key }) => setActiveView(key)}
              className="view-menu"
            />
            {activeView === 'files' && <FileExplorer />}
            {activeView === 'sprites' && <SpriteList />}
          </div>
          
          <div className="editor-content">
            <CanvasEditor />
          </div>
          
          <div className="preview-sider">
            <FilePreview />
          </div>
          
          <div className="property-sider">
            <PropertyPanel />
          </div>
        </div>
      </div>
    </ConfigProvider>
  )
}

export default App