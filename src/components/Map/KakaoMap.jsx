import React, { useEffect, useRef } from 'react';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useKakaoSearch } from '../../hooks/useKakaoSearch';
import { useStore } from '../../store/useStore';

const KakaoMap = () => {
  const mapContainerRef = useRef(null);
  const mapInstance = useRef(null);
  const overlaysRef = useRef([]); 
  
  const { location } = useGeolocation();
  
  // 전역 상태(Zustand)에서 상태와 액션 가져오기
  const { bounds, setBounds, setSelectedPlace, setModalOpen } = useStore();
  
  // 이제 전역 bounds를 사용해 데이터를 패칭합니다
  const { data: restaurants = [] } = useKakaoSearch(bounds);

  useEffect(() => {
    const { kakao } = window;
    if (!kakao || !kakao.maps) return;

    if (!mapContainerRef.current.hasChildNodes()) {
      const options = {
        center: new kakao.maps.LatLng(location.lat, location.lng),
        level: 4,
      };
      const map = new kakao.maps.Map(mapContainerRef.current, options);
      mapInstance.current = map;

      // 지도가 멈출 때마다 전역 Zustand 스토어에 bounds 값을 저장
      const updateBounds = () => {
        const mapBounds = map.getBounds();
        const sw = mapBounds.getSouthWest();
        const ne = mapBounds.getNorthEast();
        setBounds(`${sw.getLat()},${sw.getLng()},${ne.getLat()},${ne.getLng()}`);
      };

      kakao.maps.event.addListener(map, 'idle', updateBounds);
      updateBounds(); // 최초 로드 시 한 번 실행
    }
  }, [location, setBounds]);

  useEffect(() => {
    const { kakao } = window;
    if (!mapInstance.current || !restaurants.length) {
      overlaysRef.current.forEach(overlay => overlay.setMap(null));
      overlaysRef.current = [];
      return;
    }

    overlaysRef.current.forEach(overlay => overlay.setMap(null));
    overlaysRef.current = [];

    restaurants.forEach(place => {
      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(place.y, place.x),
        map: mapInstance.current
      });

      const content = document.createElement('div');
      content.className = 'custom-overlay';
      content.innerHTML = `
        <div class="overlay-info">
          <strong>${place.place_name}</strong>
          <span class="category">${place.category_name.split('>').pop()}</span>
          <button class="review-btn">리뷰 보기/작성</button>
        </div>
      `;

      content.querySelector('.review-btn').addEventListener('click', () => {
        setSelectedPlace(place);
        setModalOpen(true);
      });

      const overlay = new kakao.maps.CustomOverlay({
        position: marker.getPosition(),
        content: content,
        yAnchor: 1.5 
      });

      kakao.maps.event.addListener(marker, 'click', () => {
        overlaysRef.current.forEach(ov => ov.setMap(null));
        overlay.setMap(mapInstance.current);
      });

      kakao.maps.event.addListener(mapInstance.current, 'click', () => {
        overlay.setMap(null);
      });

      overlaysRef.current.push(overlay);
    });

    return () => {
      overlaysRef.current.forEach(overlay => overlay.setMap(null));
    };
  }, [restaurants, setModalOpen, setSelectedPlace]);

  return <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />;
};

export default KakaoMap;