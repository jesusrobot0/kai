import { create } from "zustand";

interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
  selectedDayId: string | null;
  pinnedSectionCollapsed: boolean;

  toggleSidebar: () => void;
  toggleCollapse: () => void;
  selectDay: (id: string | null) => void;
  togglePinnedSection: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true,
  isCollapsed: false,
  selectedDayId: null,
  pinnedSectionCollapsed: false,

  toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
  toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  selectDay: (id) => set({ selectedDayId: id }),
  togglePinnedSection: () =>
    set((state) => ({
      pinnedSectionCollapsed: !state.pinnedSectionCollapsed,
    })),
  setSidebarOpen: (open) => set({ isOpen: open }),
}));
