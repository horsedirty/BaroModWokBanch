import React from 'react'
import { Input, Form, Card, Space, Button, Select, Divider, InputNumber, Switch } from 'antd'
import useStore from '../store/store'
import './PropertyPanel.css'

const { TextArea } = Input

const PropertyPanel = () => {
  const {
    modInfo,
    setModInfo,
    sprites,
    selectedSpriteId,
    components,
    addComponentToSprite,
    updateComponent,
    deleteComponent,
  } = useStore()

  const selectedSprite = sprites.find((s) => s.id === selectedSpriteId)
  const spriteComponents = components.filter((c) => c.spriteId === selectedSpriteId)

  const handleModInfoChange = (field, value) => {
    setModInfo({ ...modInfo, [field]: value })
  }

  const handleSpriteChange = (field, value) => {
    if (selectedSprite) {
      useStore.getState().updateSprite(selectedSprite.id, { [field]: value })
    }
  }

  const handleAddComponent = (type) => {
    if (selectedSpriteId) {
      addComponentToSprite(selectedSpriteId, {
        type,
        properties: {},
      })
    }
  }

  const handleComponentPropertyChange = (componentId, property, value) => {
    updateComponent(componentId, {
      properties: {
        ...components.find((c) => c.id === componentId)?.properties,
        [property]: value,
      },
    })
  }

  const renderComponentProperties = (component) => {
    switch (component.type) {
      case 'Holdable':
        return (
          <>
            <Form.Item label="CanBePicked">
              <Select
                value={component.properties.canBePicked !== undefined ? component.properties.canBePicked : 'true'}
                onChange={(value) => handleComponentPropertyChange(component.id, 'canBePicked', value)}
                options={[
                  { label: '是', value: 'true' },
                  { label: '否', value: 'false' },
                ]}
              />
            </Form.Item>
            <Form.Item label="Slots">
              <Select
                value={component.properties.slots || 'Any'}
                onChange={(value) => handleComponentPropertyChange(component.id, 'slots', value)}
                options={[
                  { label: 'Any', value: 'Any' },
                  { label: 'RightHand', value: 'RightHand' },
                  { label: 'LeftHand', value: 'LeftHand' },
                  { label: 'Head', value: 'Head' },
                  { label: 'Back', value: 'Back' },
                  { label: 'InnerSuit', value: 'InnerSuit' },
                  { label: 'OuterSuit', value: 'OuterSuit' },
                  { label: 'Headset', value: 'Headset' },
                  { label: 'Card', value: 'Card' },
                  { label: 'Bag', value: 'Bag' },
                ]}
              />
            </Form.Item>
            <Form.Item label="Movable">
              <Select
                value={component.properties.movable !== undefined ? component.properties.movable : 'true'}
                onChange={(value) => handleComponentPropertyChange(component.id, 'movable', value)}
                options={[
                  { label: '是', value: 'true' },
                  { label: '否', value: 'false' },
                ]}
              />
            </Form.Item>
            <Form.Item label="PickUpDistance">
              <InputNumber
                style={{ width: '100%' }}
                value={component.properties.pickUpDistance || 100}
                onChange={(value) => handleComponentPropertyChange(component.id, 'pickUpDistance', value)}
                min={0}
              />
            </Form.Item>
          </>
        )

      case 'Engine':
        return (
          <>
            <Form.Item label="Force">
              <InputNumber
                style={{ width: '100%' }}
                value={component.properties.force || 0}
                onChange={(value) => handleComponentPropertyChange(component.id, 'force', value)}
              />
            </Form.Item>
            <Form.Item label="MaxForce">
              <InputNumber
                style={{ width: '100%' }}
                value={component.properties.maxForce || 0}
                onChange={(value) => handleComponentPropertyChange(component.id, 'maxForce', value)}
              />
            </Form.Item>
            <Form.Item label="FuelConsumption">
              <InputNumber
                style={{ width: '100%' }}
                value={component.properties.fuelConsumption || 0.5}
                onChange={(value) => handleComponentPropertyChange(component.id, 'fuelConsumption', value)}
                min={0}
                step={0.1}
              />
            </Form.Item>
            <Form.Item label="PowerConsumption">
              <InputNumber
                style={{ width: '100%' }}
                value={component.properties.powerConsumption || 0}
                onChange={(value) => handleComponentPropertyChange(component.id, 'powerConsumption', value)}
                min={0}
              />
            </Form.Item>
          </>
        )

      case 'Hull':
        return (
          <>
            <Form.Item label="HullHealth">
              <InputNumber
                style={{ width: '100%' }}
                value={component.properties.hullHealth || 100}
                onChange={(value) => handleComponentPropertyChange(component.id, 'hullHealth', value)}
                min={0}
              />
            </Form.Item>
            <Form.Item label="Submarine">
              <Select
                value={component.properties.submarine !== undefined ? component.properties.submarine : 'true'}
                onChange={(value) => handleComponentPropertyChange(component.id, 'submarine', value)}
                options={[
                  { label: '是', value: 'true' },
                  { label: '否', value: 'false' },
                ]}
              />
            </Form.Item>
            <Form.Item label="WallThickness">
              <InputNumber
                style={{ width: '100%' }}
                value={component.properties.wallThickness || 20}
                onChange={(value) => handleComponentPropertyChange(component.id, 'wallThickness', value)}
                min={0}
              />
            </Form.Item>
          </>
        )

      case 'Gun':
        return (
          <>
            <Form.Item label="Damage">
              <InputNumber
                style={{ width: '100%' }}
                value={component.properties.damage || 10}
                onChange={(value) => handleComponentPropertyChange(component.id, 'damage', value)}
                min={0}
              />
            </Form.Item>
            <Form.Item label="Range">
              <InputNumber
                style={{ width: '100%' }}
                value={component.properties.range || 500}
                onChange={(value) => handleComponentPropertyChange(component.id, 'range', value)}
                min={0}
              />
            </Form.Item>
            <Form.Item label="FireRate">
              <InputNumber
                style={{ width: '100%' }}
                value={component.properties.fireRate || 0.1}
                onChange={(value) => handleComponentPropertyChange(component.id, 'fireRate', value)}
                min={0}
                step={0.01}
              />
            </Form.Item>
            <Form.Item label="Spread">
              <InputNumber
                style={{ width: '100%' }}
                value={component.properties.spread || 0.1}
                onChange={(value) => handleComponentPropertyChange(component.id, 'spread', value)}
                min={0}
                max={1}
                step={0.01}
              />
            </Form.Item>
            <Form.Item label="ProjectileType">
              <Select
                value={component.properties.projectileType || 'Bullet'}
                onChange={(value) => handleComponentPropertyChange(component.id, 'projectileType', value)}
                options={[
                  { label: 'Bullet', value: 'Bullet' },
                  { label: 'Laser', value: 'Laser' },
                  { label: 'Plasma', value: 'Plasma' },
                  { label: 'Railgun', value: 'Railgun' },
                ]}
              />
            </Form.Item>
          </>
        )

      case 'Container':
        return (
          <>
            <Form.Item label="Capacity">
              <InputNumber
                style={{ width: '100%' }}
                value={component.properties.capacity || 10}
                onChange={(value) => handleComponentPropertyChange(component.id, 'capacity', value)}
                min={1}
              />
            </Form.Item>
            <Form.Item label="MaxStackSize">
              <InputNumber
                style={{ width: '100%' }}
                value={component.properties.maxStackSize || 10}
                onChange={(value) => handleComponentPropertyChange(component.id, 'maxStackSize', value)}
                min={1}
              />
            </Form.Item>
            <Form.Item label="HideItems">
              <Select
                value={component.properties.hideItems !== undefined ? component.properties.hideItems : 'false'}
                onChange={(value) => handleComponentPropertyChange(component.id, 'hideItems', value)}
                options={[
                  { label: '是', value: 'true' },
                  { label: '否', value: 'false' },
                ]}
              />
            </Form.Item>
            <Form.Item label="CanBeCombined">
              <Select
                value={component.properties.canBeCombined !== undefined ? component.properties.canBeCombined : 'true'}
                onChange={(value) => handleComponentPropertyChange(component.id, 'canBeCombined', value)}
                options={[
                  { label: '是', value: 'true' },
                  { label: '否', value: 'false' },
                ]}
              />
            </Form.Item>
          </>
        )

      case 'Wearable':
        return (
          <>
            <Form.Item label="SlotType">
              <Select
                value={component.properties.slotType || 'Any'}
                onChange={(value) => handleComponentPropertyChange(component.id, 'slotType', value)}
                options={[
                  { label: 'Head', value: 'Head' },
                  { label: 'InnerSuit', value: 'InnerSuit' },
                  { label: 'OuterSuit', value: 'OuterSuit' },
                  { label: 'Headset', value: 'Headset' },
                  { label: 'Card', value: 'Card' },
                  { label: 'Bag', value: 'Bag' },
                ]}
              />
            </Form.Item>
            <Form.Item label="Protection">
              <InputNumber
                style={{ width: '100%' }}
                value={component.properties.protection || 0}
                onChange={(value) => handleComponentPropertyChange(component.id, 'protection', value)}
                min={0}
              />
            </Form.Item>
            <Form.Item label="SpeedMultiplier">
              <InputNumber
                style={{ width: '100%' }}
                value={component.properties.speedMultiplier || 1.0}
                onChange={(value) => handleComponentPropertyChange(component.id, 'speedMultiplier', value)}
                min={0}
                step={0.1}
              />
            </Form.Item>
          </>
        )

      case 'MeleeWeapon':
        return (
          <>
            <Form.Item label="Damage">
              <InputNumber
                style={{ width: '100%' }}
                value={component.properties.damage || 10}
                onChange={(value) => handleComponentPropertyChange(component.id, 'damage', value)}
                min={0}
              />
            </Form.Item>
            <Form.Item label="Range">
              <InputNumber
                style={{ width: '100%' }}
                value={component.properties.range || 50}
                onChange={(value) => handleComponentPropertyChange(component.id, 'range', value)}
                min={0}
              />
            </Form.Item>
            <Form.Item label="AttackSpeed">
              <InputNumber
                style={{ width: '100%' }}
                value={component.properties.attackSpeed || 1.0}
                onChange={(value) => handleComponentPropertyChange(component.id, 'attackSpeed', value)}
                min={0}
                step={0.1}
              />
            </Form.Item>
            <Form.Item label="Stun">
              <InputNumber
                style={{ width: '100%' }}
                value={component.properties.stun || 0}
                onChange={(value) => handleComponentPropertyChange(component.id, 'stun', value)}
                min={0}
              />
            </Form.Item>
          </>
        )

      case 'Medical':
        return (
          <>
            <Form.Item label="HealAmount">
              <InputNumber
                style={{ width: '100%' }}
                value={component.properties.healAmount || 10}
                onChange={(value) => handleComponentPropertyChange(component.id, 'healAmount', value)}
                min={0}
              />
            </Form.Item>
            <Form.Item label="ApplyTime">
              <InputNumber
                style={{ width: '100%' }}
                value={component.properties.applyTime || 1.0}
                onChange={(value) => handleComponentPropertyChange(component.id, 'applyTime', value)}
                min={0}
                step={0.1}
              />
            </Form.Item>
            <Form.Item label="CureAfflictions">
              <Input
                value={component.properties.cureAfflictions || ''}
                onChange={(e) => handleComponentPropertyChange(component.id, 'cureAfflictions', e.target.value)}
                placeholder="输入疾病ID，用逗号分隔"
              />
            </Form.Item>
          </>
        )

      default:
        return <p>该组件类型暂无配置选项</p>
    }
  }

  return (
    <div className="property-panel">
      <div className="panel-section">
        <h3>Mod信息</h3>
        <Form layout="vertical">
          <Form.Item label="Mod名称">
            <Input
              value={modInfo.name}
              onChange={(e) => handleModInfoChange('name', e.target.value)}
              placeholder="输入Mod名称"
            />
          </Form.Item>
          <Form.Item label="Mod ID">
            <Input
              value={modInfo.id}
              onChange={(e) => handleModInfoChange('id', e.target.value)}
              placeholder="输入Mod ID"
            />
          </Form.Item>
        </Form>
      </div>

      <Divider />

      {selectedSprite && (
        <>
          <div className="panel-section">
            <h3>Sprite属性</h3>
            <Form layout="vertical">
              <Form.Item label="名称">
                <Input
                  value={selectedSprite.name}
                  onChange={(e) => handleSpriteChange('name', e.target.value)}
                />
              </Form.Item>
              <Form.Item label="SourceRect">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Input
                    addonBefore="X"
                    value={selectedSprite.sourceRect.x}
                    type="number"
                    onChange={(e) => handleSpriteChange('sourceRect', {
                      ...selectedSprite.sourceRect,
                      x: parseInt(e.target.value) || 0,
                    })}
                  />
                  <Input
                    addonBefore="Y"
                    value={selectedSprite.sourceRect.y}
                    type="number"
                    onChange={(e) => handleSpriteChange('sourceRect', {
                      ...selectedSprite.sourceRect,
                      y: parseInt(e.target.value) || 0,
                    })}
                  />
                  <Input
                    addonBefore="宽度"
                    value={selectedSprite.sourceRect.width}
                    type="number"
                    onChange={(e) => handleSpriteChange('sourceRect', {
                      ...selectedSprite.sourceRect,
                      width: parseInt(e.target.value) || 0,
                    })}
                  />
                  <Input
                    addonBefore="高度"
                    value={selectedSprite.sourceRect.height}
                    type="number"
                    onChange={(e) => handleSpriteChange('sourceRect', {
                      ...selectedSprite.sourceRect,
                      height: parseInt(e.target.value) || 0,
                    })}
                  />
                </Space>
              </Form.Item>
              <Form.Item label="Origin X">
                <InputNumber
                  style={{ width: '100%' }}
                  step={0.01}
                  min={0}
                  max={1}
                  value={selectedSprite.origin?.x || 0.5}
                  onChange={(value) => handleSpriteChange('origin', {
                    ...selectedSprite.origin,
                    x: value || 0.5,
                  })}
                />
              </Form.Item>
              <Form.Item label="Origin Y">
                <InputNumber
                  style={{ width: '100%' }}
                  step={0.01}
                  min={0}
                  max={1}
                  value={selectedSprite.origin?.y || 0.5}
                  onChange={(value) => handleSpriteChange('origin', {
                    ...selectedSprite.origin,
                    y: value || 0.5,
                  })}
                />
              </Form.Item>
            </Form>
          </div>

          <Divider />

          <div className="panel-section">
            <h3>组件</h3>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Select
                placeholder="添加组件"
                style={{ width: '100%' }}
                onChange={handleAddComponent}
                options={[
                  { label: 'Holdable (可手持)', value: 'Holdable' },
                  { label: 'Engine (引擎)', value: 'Engine' },
                  { label: 'Hull (船体)', value: 'Hull' },
                  { label: 'Gun (枪械)', value: 'Gun' },
                  { label: 'Container (容器)', value: 'Container' },
                  { label: 'Wearable (可穿戴)', value: 'Wearable' },
                  { label: 'MeleeWeapon (近战武器)', value: 'MeleeWeapon' },
                  { label: 'Medical (医疗物品)', value: 'Medical' },
                ]}
              />
              
              {spriteComponents.map((component) => (
                <Card
                  key={component.id}
                  size="small"
                  title={component.type}
                  extra={
                    <Button
                      type="text"
                      danger
                      size="small"
                      onClick={() => deleteComponent(component.id)}
                    >
                      删除
                    </Button>
                  }
                >
                  <Form layout="vertical" size="small">
                    {renderComponentProperties(component)}
                  </Form>
                </Card>
              ))}
            </Space>
          </div>
        </>
      )}

      {!selectedSprite && (
        <div className="panel-section">
          <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
            请先选择一个Sprite以编辑属性和添加组件
          </p>
        </div>
      )}
    </div>
  )
}

export default PropertyPanel