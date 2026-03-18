import { create } from 'zustand';

export const useStore = create((set) => ({
  reviews: {}, 
  selectedPlace: null,
  isModalOpen: false,
  bounds: null, // 👈 지도의 현재 영역을 저장할 전역 상태 추가

  setSelectedPlace: (place) => set({ selectedPlace: place }),
  setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
  setBounds: (bounds) => set({ bounds }), // 👈 bounds 업데이트 함수 추가
  
  addReview: (placeId, review) => set((state) => ({
    reviews: {
      ...state.reviews,
      [placeId]: [...(state.reviews[placeId] || []), review],
    },
  })),
}));