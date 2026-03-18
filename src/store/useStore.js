import { create } from 'zustand';

export const useStore = create((set) => ({
  reviews: {},
  selectedPlace: null,
  isModalOpen: false,
  
  // 1. 위치 및 검색 영역 상태
  userLocation: { lat: 37.6152, lng: 127.0132 }, // 거리 계산의 기준점이 될 내 위치
  viewBounds: null,   // 현재 지도가 보여주는 화면 영역 (드래그할 때마다 바뀜)
  searchBounds: null, // 마지막으로 API 검색을 실행한 영역 (버튼을 누를 때만 바뀜)
  
  // 2. 검색 필터 상태 (기본값: 음식점)
  category: 'FD6', 
  keyword: '',

  setUserLocation: (loc) => set({ userLocation: loc }),
  setSelectedPlace: (place) => set({ selectedPlace: place }),
  setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
  
  setViewBounds: (bounds) => set({ viewBounds: bounds }),
  setSearchBounds: (bounds) => set({ searchBounds: bounds }),
  
  // 카테고리를 누르면 키워드 초기화, 키워드를 검색하면 카테고리 초기화
  setCategory: (category) => set({ category, keyword: '' }),
  setKeyword: (keyword) => set({ keyword, category: '' }),
  
  addReview: (placeId, review) => set((state) => ({
    reviews: {
      ...state.reviews,
      [placeId]: [...(state.reviews[placeId] || []), review],
    },
  })),
}));