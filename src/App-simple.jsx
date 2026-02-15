import React from 'react'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'

const App = () => {
  const [isDarkMode, setIsDarkMode] = React.useState(true)

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#d4a017',
        },
      }}
    >
      <div style={{ 
        width: '100vw', 
        height: '100vh', 
        backgroundColor: isDarkMode ? '#0a0a0a' : '#f5f5f5',
        color: isDarkMode ? '#e0e0e0' : '#333333',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px'
      }}>
        <h1 style={{ color: '#d4a017' }}>BaroMod Workbench</h1>
        <p>测试页面 - Ant Design 加载成功</p>
      </div>
    </ConfigProvider>
  )
}

export default App
