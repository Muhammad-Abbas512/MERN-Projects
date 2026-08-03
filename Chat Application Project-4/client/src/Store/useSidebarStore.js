import { create } from "zustand";

export const useSidebarStore = create((set) => ({
  // ============================
  // State
  // ============================

  isDropdownOpen: false,

  // ============================
  // Actions
  // ============================

  toggleDropdown: () =>
    set((state) => ({
      isDropdownOpen: !state.isDropdownOpen,
    })),

  closeDropdown: () =>
    set({
      isDropdownOpen: false,
    }),
}));