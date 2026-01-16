import { create } from 'zustand'

interface SidebarState {
  // 侧边栏是否展开
  isOpen: boolean
  // 侧边栏宽度
  width: number

  // Actions
  toggle: () => void
  open: () => void
  close: () => void
  setWidth: (width: number) => void
}

export const useSidebarStore = create<SidebarState>()((set) => ({
  isOpen: true,
  width: 280,

  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setWidth: (width) => set({ width }),
}))
