import React, { useEffect, useRef } from 'react';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useKakaoSearch } from '../../hooks/useKakaoSearch';
import { useStore } from '../../store/useStore';

const KakaoMap = () => {
  const mapContainerRef = useRef(null);
  const mapInstance = useRef(null);
  
  // 클러스터러와 오버레이 추적을 위한 Ref 분리
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

    // 🚀 마커 클러스터러 생성 (레벨 5 이상 축소 시 뭉침)
    const clusterer = new kakao.maps.MarkerClusterer({
      map: map,
      averageCenter: true,
      minLevel: 5, 
    });
    clustererInstance.current = clusterer;

    setTimeout(() => map.relayout(), 100);

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
  }, [location.lat, location.lng, setViewBounds, setSearchBounds]);

  useEffect(() => {
    const { kakao } = window;
    if (mapInstance.current && location.lat) {
      const moveLatLon = new kakao.maps.LatLng(location.lat, location.lng);
      mapInstance.current.panTo(moveLatLon); 
    }
  }, [location]);

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

  // 3. 맛집 마커, 오버레이 및 클러스터링 렌더링
  useEffect(() => {
    const { kakao } = window;
    if (!mapInstance.current || !clustererInstance.current) return;

    // 기존 오버레이 삭제 및 클러스터러 초기화
    overlaysRef.current.forEach(ov => ov.setMap(null));
    overlaysRef.current = [];
    clustererInstance.current.clear();

    const newMarkers = []; // 클러스터러에 한 번에 넣을 마커 배열

    restaurants.forEach(place => {
      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(place.y, place.x)
        // map 속성을 빼서 클러스터러가 관리하게 만듭니다.
      });

      // 📍 카카오맵 외부 링크 (도착지: 식당 이름, 좌표)
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

    // 🚀 완성된 마커들을 클러스터러에 한 번에 집어넣습니다
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