export const generateXML = (modInfo, sprites, components) => {
  let xml = `<?xml version="1.0" encoding="utf-8"?>\n`
  xml += `<Items xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="../../../../schemas/Items.xsd">\n`

  sprites.forEach((sprite) => {
    xml += `  <Item identifier="${sprite.name}" category="Equipment" Tags="${modInfo.id}" cargocontaineridentifier="${modInfo.id}">\n`
    
    xml += `    <Sprite texture="${modInfo.id}.png" sourcerect="${sprite.sourceRect.x},${sprite.sourceRect.y},${sprite.sourceRect.width},${sprite.sourceRect.height}" origin="${sprite.origin?.x || 0.5},${sprite.origin?.y || 0.5}" />\n`

    const spriteComponents = components.filter(c => c.spriteId === sprite.id)
    
    spriteComponents.forEach((component) => {
      xml += `    <${component.type}\n`
      
      const props = component.properties
      Object.entries(props).forEach(([key, value]) => {
        xml += `      ${key}="${value}"\n`
      })
      
      xml += `    />\n`
    })

    xml += `  </Item>\n`
  })

  xml += `</Items>`

  return xml
}