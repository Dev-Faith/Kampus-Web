import { create } from "zustand";

interface PropertyInteractionState {
  hoveredPropertyId: string | null;
  selectedPropertyId: string | null;
  activeMediaIndex: Record<string, number>;
  isMobileDrawerOpen: boolean;
  activeTab: "overview" | "staging" | "floorplan" | "panorama";
  setHoveredPropertyId: (id: string | null) => void;
  setSelectedPropertyId: (id: string | null) => void;
  setMediaIndex: (propertyId: string, index: number) => void;
  setMobileDrawerOpen: (open: boolean) => void;
  setActiveTab: (tab: "overview" | "staging" | "floorplan" | "panorama") => void;
}

export const usePropertyInteractionStore = create<PropertyInteractionState>((set) => ({
  hoveredPropertyId: null,
  selectedPropertyId: null,
  activeMediaIndex: {},
  isMobileDrawerOpen: false,
  activeTab: "overview",
  setHoveredPropertyId: (id) => set({ hoveredPropertyId: id }),
  setSelectedPropertyId: (id) => set({ selectedPropertyId: id }),
  setMediaIndex: (propertyId, index) =>
    set((state) => ({
      activeMediaIndex: {
        ...state.activeMediaIndex,
        [propertyId]: index,
      },
    })),
  setMobileDrawerOpen: (open) => set({ isMobileDrawerOpen: open }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
