import { useQuery } from '@tanstack/react-query';
import { useStore } from '../store/useStore';

export const useKakaoSearch = () => {
  // 전역 상태에서 검색에 필요한 모든 값 가져오기
  const { searchBounds, category, keyword, userLocation } = useStore();

  return useQuery({
    // queryKey 배열의 값이 하나라도 바뀌면 자동으로 API를 재호출합니다.
    queryKey: ['places', searchBounds, category, keyword],
    queryFn: () => {
      return new Promise((resolve) => {
        if (!searchBounds || !window.kakao || !window.kakao.maps.services) {
          return resolve([]);
        }

        const ps = new window.kakao.maps.services.Places();
        const [swLat, swLng, neLat, neLng] = searchBounds.split(',');
        const kakaoBounds = new window.kakao.maps.LatLngBounds(
          new window.kakao.maps.LatLng(swLat, swLng),
          new window.kakao.maps.LatLng(neLat, neLng)
        );

        // API 옵션: 바운더리 지정 및 거리 계산을 위한 내 좌표(x, y) 제공
        const searchOptions = {
          bounds: kakaoBounds,
          useMapBounds: true,
          x: userLocation.lng, // 경도
          y: userLocation.lat, // 위도
        };

        const callback = (data, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            resolve(data);
          } else {
            resolve([]);
          }
        };

        // 키워드가 있으면 키워드 검색, 없으면 카테고리 검색 실행
        if (keyword) {
          ps.keywordSearch(keyword, callback, searchOptions);
        } else {
          ps.categorySearch(category, callback, searchOptions);
        }
      });
    },
    // searchBounds 값이 설정된 이후에만 쿼리 실행 (초기 하얀 화면 에러 방지)
    enabled: !!searchBounds, 
  });
};