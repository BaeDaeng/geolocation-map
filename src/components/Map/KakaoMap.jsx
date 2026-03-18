import React, { useEffect, useRef } from 'react';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useKakaoSearch } from '../../hooks/useKakaoSearch';
import { useStore } from '../../store/useStore';

const KakaoMap = () => {
  const mapContainerRef = useRef(null);
  const mapInstance = useRef(null);
  const overlaysRef = useRef([]); 
  
  const { location } = useGeolocation();
  const { 
    viewBounds, searchBounds, 
    setViewBounds, setSearchBounds, 
    setUserLocation, setSelectedPlace, setModalOpen 
  } = useStore();
  
  const { data: restaurants = [] } = useKakaoSearch();

  useEffect(() => {
    setUserLocation(location);
  }, [location, setUserLocation]);

  // 1. 지도 초기화 및 바운더리 감지
  useEffect(() => {
    const { kakao } = window;
    if (!kakao || !kakao.maps || mapContainerRef.current.hasChildNodes()) return;

    const options = {
      center: new kakao.maps.LatLng(location.lat, location.lng),
      level: 4,
    };
    const map = new kakao.maps.Map(mapContainerRef.current, options);
    mapInstance.current = map;

    const updateBounds = () => {
      const mapBounds = map.getBounds();
      const sw = mapBounds.getSouthWest();
      const ne = mapBounds.getNorthEast();
      const boundsStr = `${sw.getLat()},${sw.getLng()},${ne.getLat()},${ne.getLng()}`;
      
      setViewBounds(boundsStr); 
      if (!useStore.getState().searchBounds) {
        setSearchBounds(boundsStr);
      }
    };

    kakao.maps.event.addListener(map, 'idle', updateBounds);
    updateBounds(); 
  }, [location, setViewBounds, setSearchBounds]);

  // 2. ⭐ 내 위치 파란색 마커 띄우기 (신규 추가) ⭐
  useEffect(() => {
    const { kakao } = window;
    if (!mapInstance.current || !location.lat) return;

    const content = document.createElement('div');
    content.className = 'current-location-marker';

    const overlay = new kakao.maps.CustomOverlay({
      position: new kakao.maps.LatLng(location.lat, location.lng),
      content: content,
      map: mapInstance.current
    });

    return () => overlay.setMap(null); // 클린업
  }, [location]);

  // 3. 맛집 마커 및 오버레이 렌더링
  useEffect(() => {
    const { kakao } = window;
    if (!mapInstance.current) return;

    overlaysRef.current.forEach(ov => ov.setMap(null));
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
          <button class="review-btn">리뷰 보기</button>
        </div>
      `;

      content.querySelector('.review-btn').addEventListener('click', () => {
        setSelectedPlace(place);
        setModalOpen(true);
      });

      const overlay = new kakao.maps.CustomOverlay({
        position: marker.getPosition(), content: content, yAnchor: 1.5 
      });

      kakao.maps.event.addListener(marker, 'click', () => {
        overlaysRef.current.forEach(ov => ov.setMap(null));
        overlay.setMap(mapInstance.current);
      });
      kakao.maps.event.addListener(mapInstance.current, 'click', () => overlay.setMap(null));
      overlaysRef.current.push(overlay);
    });

    return () => overlaysRef.current.forEach(ov => ov.setMap(null));
  }, [restaurants, setModalOpen, setSelectedPlace]);

  const showSearchButton = viewBounds && searchBounds && viewBounds !== searchBounds;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {showSearchButton && (
        <button 
          className="search-here-btn" 
          onClick={() => setSearchBounds(viewBounds)}
        >
          ↻ 현 지도에서 검색
        </button>
      )}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default KakaoMap;