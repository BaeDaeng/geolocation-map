import React, { useEffect, useRef } from 'react';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useKakaoSearch } from '../../hooks/useKakaoSearch';
import { useStore } from '../../store/useStore';

const KakaoMap = () => {
  const mapContainerRef = useRef(null);
  const mapInstance = useRef(null);
  
  const clustererInstance = useRef(null); 
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

  // 1. 지도 & 마커 클러스터러 초기화
  useEffect(() => {
    const { kakao } = window;
    
    if (!kakao || !kakao.maps || mapInstance.current) return;

    const container = mapContainerRef.current;
    if (container.hasChildNodes()) {
      container.innerHTML = ''; 
    }

    const options = {
      center: new kakao.maps.LatLng(location.lat, location.lng),
      level: 4,
    };
    
    const map = new kakao.maps.Map(container, options);
    mapInstance.current = map;

    const clusterer = new kakao.maps.MarkerClusterer({
      map: map,
      averageCenter: true,
      minLevel: 5, 
    });
    clustererInstance.current = clusterer;

    // ⭐ 핵심 해결 코드: ResizeObserver를 달아서 지도가 잘리는 현상 완벽 방어
    const resizeObserver = new ResizeObserver(() => {
      // 1. 현재 보고 있던 중심 좌표를 기억합니다.
      const currentCenter = map.getCenter();
      // 2. 바뀐 화면 크기에 맞춰 지도를 꽉 차게 다시 그립니다.
      map.relayout();
      // 3. 지도를 다시 그린 후, 아까 기억해둔 중심 좌표로 카메라를 원상복구합니다.
      map.setCenter(currentCenter);
    });
    
    // 맵 컨테이너의 크기 변화를 계속 감시합니다.
    resizeObserver.observe(container);

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
    
    // 컴포넌트가 꺼질 때 메모리 누수 방지를 위해 감시자를 끕니다.
    return () => resizeObserver.disconnect();
  }, [location.lat, location.lng, setViewBounds, setSearchBounds]);

  // 2. 내 위치(GPS) 변경 시 지도 부드럽게 이동
  useEffect(() => {
    const { kakao } = window;
    if (mapInstance.current && location.lat) {
      const moveLatLon = new kakao.maps.LatLng(location.lat, location.lng);
      mapInstance.current.panTo(moveLatLon); 
    }
  }, [location]);

  // 3. 내 위치 파란색 마커 띄우기
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

    return () => overlay.setMap(null); 
  }, [location]);

  // 4. 맛집 마커, 오버레이 및 클러스터링 렌더링
  useEffect(() => {
    const { kakao } = window;
    if (!mapInstance.current || !clustererInstance.current) return;

    overlaysRef.current.forEach(ov => ov.setMap(null));
    overlaysRef.current = [];
    clustererInstance.current.clear();

    const newMarkers = []; 

    restaurants.forEach(place => {
      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(place.y, place.x)
      });

      const naviUrl = `https://map.kakao.com/link/to/${place.place_name},${place.y},${place.x}`;

      const content = document.createElement('div');
      content.className = 'custom-overlay';
      content.innerHTML = `
        <div class="overlay-info">
          <strong>${place.place_name}</strong>
          <span class="category">${place.category_name.split('>').pop()}</span>
          <div class="overlay-buttons">
            <button class="review-btn">리뷰</button>
            <a href="${naviUrl}" target="_blank" rel="noreferrer" class="nav-btn">길찾기</a>
          </div>
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
      
      newMarkers.push(marker);
      overlaysRef.current.push(overlay);
    });

    clustererInstance.current.addMarkers(newMarkers);

    kakao.maps.event.addListener(mapInstance.current, 'click', () => {
      overlaysRef.current.forEach(ov => ov.setMap(null));
    });

    return () => {
      overlaysRef.current.forEach(ov => ov.setMap(null));
      if (clustererInstance.current) {
        clustererInstance.current.clear();
      }
    };
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
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
    </div>
  );
};

export default KakaoMap;