import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 디바운스 훅: 값이 빠르게 변할 때 마지막 변화 이후 delay만큼 지나야 값을 리턴
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export const useKakaoSearch = (bounds) => {
  // 지도가 움직일 때마다 들어오는 bounds 값을 500ms 지연시킴
  const debouncedBounds = useDebounce(bounds, 500);

  return useQuery({
    // 캐시 키: 바운더리가 바뀔 때만 새로운 API 요청
    queryKey: ['restaurants', debouncedBounds],
    queryFn: () => {
      return new Promise((resolve) => {
        if (!debouncedBounds || !window.kakao || !window.kakao.maps.services) {
          return resolve([]);
        }

        const ps = new window.kakao.maps.services.Places();
        
        // 문자열로 된 bounds를 카카오 객체로 변환
        const [swLat, swLng, neLat, neLng] = debouncedBounds.split(',');
        const kakaoBounds = new window.kakao.maps.LatLngBounds(
          new window.kakao.maps.LatLng(swLat, swLng),
          new window.kakao.maps.LatLng(neLat, neLng)
        );

        // FD6 = 음식점 카테고리
        ps.categorySearch('FD6', (data, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            resolve(data);
          } else {
            resolve([]); // 결과가 없거나 에러면 빈 배열 리턴
          }
        }, { bounds: kakaoBounds, useMapBounds: true });
      });
    },
    enabled: !!debouncedBounds, // 바운더리 값이 있을 때만 요청
  });
};