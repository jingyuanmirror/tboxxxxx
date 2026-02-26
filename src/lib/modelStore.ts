'use client';

import create from 'zustand';

type Model = { key: string; name: string; avatar?: string };

interface ModelState {
  selectedModel: Model;
  setSelectedModel: (m: Model) => void;
}

const defaultModel: Model = { key: 'tbox', name: 'Tbox', avatar: '/mascot.png' };

export const useModelStore = create<ModelState>((set) => ({
  selectedModel: defaultModel,
  setSelectedModel: (m: Model) => set({ selectedModel: m }),
}));

export default useModelStore;
