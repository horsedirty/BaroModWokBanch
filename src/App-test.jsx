import React from 'react'

const App = () => {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#0a0a0a',
      color: '#e0e0e0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px'
    }}>
      <div>
        <h1 style={{ color: '#d4a017' }}>BaroMod Workbench</h1>
        <p>测试页面 - 如果你看到这个，说明基本渲染正常</p>
      </div>
    </div>
  )
}

export default App
