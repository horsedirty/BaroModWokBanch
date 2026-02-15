import { create } from 'zustand'

const useStore = create((set, get) => ({
  modInfo: {
    name: '',
    id: '',
    modVersion: '',
    gameVersion: '',
    steamWorkshopId: '',
    corePackage: false,
  },
  modFiles: [],
  selectedFile: null,
  openFiles: [],
  activeFile: null,
  currentImage: null,
  imageDimensions: { width: 0, height: 0 },
  sprites: [],
  selectedSpriteId: null,
  components: [],
  modifiedFiles: new Set(),
  spriteXmlMap: new Map(),

  setModInfo: (modInfo) => set({ 
    modInfo: { ...get().modInfo, ...modInfo }
  }),

  setModFiles: (modFiles) => set({ modFiles }),

  setSelectedFile: (file) => {
    const { openFiles, activeFile } = get()
    const existingFileIndex = openFiles.findIndex(f => f.filename === file.filename)
    
    if (file && existingFileIndex === -1) {
      set({ 
        selectedFile: file,
        openFiles: [...openFiles, file],
        activeFile: file.filename
      })
    } else if (file && existingFileIndex !== -1) {
      const newOpenFiles = [...openFiles]
      const existingFile = newOpenFiles[existingFileIndex]
      newOpenFiles[existingFileIndex] = { 
        ...existingFile, 
        ...file,
        content: file.content || existingFile.content
      }
      set({ 
        selectedFile: newOpenFiles[existingFileIndex],
        openFiles: newOpenFiles,
        activeFile: file.filename
      })
    } else {
      set({ selectedFile: null })
    }
  },

  setActiveFile: (filename) => set({ activeFile: filename }),

  closeFile: (filename) => {
    const { openFiles, activeFile } = get()
    const newOpenFiles = openFiles.filter(f => f.filename !== filename)
    let newActiveFile = activeFile
    
    if (activeFile === filename && newOpenFiles.length > 0) {
      newActiveFile = newOpenFiles[newOpenFiles.length - 1].filename
    } else if (activeFile === filename) {
      newActiveFile = null
    }
    
    set({ 
      openFiles: newOpenFiles,
      activeFile: newActiveFile,
      selectedFile: newActiveFile ? openFiles.find(f => f.filename === newActiveFile) : null
    })
  },
  
  setCurrentImage: (image, dimensions) => set({ 
    currentImage: image, 
    imageDimensions: dimensions,
    sprites: [],
    selectedSpriteId: null,
  }),
  
  addSprite: (sprite) => set((state) => ({
    sprites: [...state.sprites, { ...sprite, id: sprite.id || Date.now() }],
  })),
  
  updateSprite: (id, updates) => set((state) => {
    const updatedSprites = state.sprites.map((s) => 
      s.id === id ? { ...s, ...updates } : s
    )
    const sprite = updatedSprites.find(s => s.id === id)
    if (sprite && sprite.xmlFile) {
      const newModifiedFiles = new Set(state.modifiedFiles)
      newModifiedFiles.add(sprite.xmlFile)
      return {
        sprites: updatedSprites,
        modifiedFiles: newModifiedFiles
      }
    }
    return { sprites: updatedSprites }
  }),
  
  deleteSprite: (id) => set((state) => ({
    sprites: state.sprites.filter((s) => s.id !== id),
    selectedSpriteId: state.selectedSpriteId === id ? null : state.selectedSpriteId,
  })),
  
  setSelectedSpriteId: (id) => set({ selectedSpriteId: id }),
  
  addComponent: (component) => set((state) => ({
    components: [...state.components, { ...component, id: Date.now() }],
  })),
  
  addComponentToSprite: (spriteId, component) => set((state) => ({
    components: [...state.components, { ...component, id: Date.now(), spriteId }],
  })),
  
  updateComponent: (id, updates) => set((state) => ({
    components: state.components.map((c) => 
      c.id === id ? { ...c, ...updates } : c
    ),
  })),
  
  deleteComponent: (id) => set((state) => ({
    components: state.components.filter((c) => c.id !== id),
  })),

  updateXmlFileContent: (filename, content) => {
    const { modFiles, openFiles, modifiedFiles } = get()
    const newModFiles = modFiles.map(mod => {
      const newMod = { ...mod }
      newMod.itemFiles = newMod.itemFiles.map(file => 
        file.filename === filename ? { ...file, content } : file
      )
      return newMod
    })
    
    const newOpenFiles = openFiles.map(file =>
      file.filename === filename ? { ...file, content } : file
    )
    
    const newModifiedFiles = new Set(modifiedFiles)
    newModifiedFiles.add(filename)
    
    set({ 
      modFiles: newModFiles,
      openFiles: newOpenFiles,
      modifiedFiles: newModifiedFiles
    })
  },

  markFileAsSaved: (filename) => {
    const { modifiedFiles } = get()
    const newModifiedFiles = new Set(modifiedFiles)
    newModifiedFiles.delete(filename)
    set({ modifiedFiles: newModifiedFiles })
  },

  setSpriteXmlMap: (spriteId, xmlFile, xmlContent) => {
    const { spriteXmlMap } = get()
    const newMap = new Map(spriteXmlMap)
    newMap.set(spriteId, { xmlFile, xmlContent })
    set({ spriteXmlMap: newMap })
  },
  
  resetProject: () => set({
    modInfo: { name: '', id: '', modVersion: '', gameVersion: '', steamWorkshopId: '', corePackage: false },
    modFiles: [],
    selectedFile: null,
    openFiles: [],
    activeFile: null,
    currentImage: null,
    imageDimensions: { width: 0, height: 0 },
    sprites: [],
    selectedSpriteId: null,
    components: [],
    modifiedFiles: new Set(),
    spriteXmlMap: new Map(),
  }),
}))

export default useStore
