import React, { useEffect, useRef, useState } from 'react';
import { useGeolocation } from '../../hooks/useGeolocation';
import { mockRestaurants } from '../../data/mockRestaurants';

const KakaoMap = () => {
  const mapContainerRef = useRef(null);
  const mapInstance = useRef(null);
  const clustererInstance = useRef(null);
  const { location } = useGeolocation();
  
  // 현재 지도의 경계 영역 상태 (API 연동 시 이 값으로 서버에 요청)
  const [bounds, setBounds] = useState(null);

  useEffect(() => {
    const { kakao } = window;
    
    // 카카오맵 스크립트가 로드되지 않았으면 실행 중지
    if (!kakao || !kakao.maps) return;

    // 1. 지도 초기화 (최초 1회만 실행되도록 방어 코드 추가)
    if (!mapInstance.current) {
      const options = {
        center: new kakao.maps.LatLng(location.lat, location.lng),
        level: 4, // 확대 레벨
      };
      const map = new kakao.maps.Map(mapContainerRef.current, options);
      mapInstance.current = map;

      // 2. 마커 클러스터러 초기화
      const clusterer = new kakao.maps.MarkerClusterer({
        map: map,
        averageCenter: true, 
        minLevel: 5, // 이 레벨 이상 축소될 때만 클러스터링 적용
      });
      clustererInstance.current = clusterer;

      // 3. 지도 이동(드래그) 완료 시 Bounds 값 업데이트 이벤트 등록
      kakao.maps.event.addListener(map, 'idle', () => {
        const currentBounds = map.getBounds();
        setBounds({
          sw: currentBounds.getSouthWest().toString(),
          ne: currentBounds.getNorthEast().toString()
        });
        console.log("새로운 영역 데이터 페칭 필요:", currentBounds.toString());
      });
    } else {
      // 내 위치가 업데이트되면 지도의 중심을 이동시킴
      const newCenter = new kakao.maps.LatLng(location.lat, location.lng);
      mapInstance.current.setCenter(newCenter);
    }
  }, [location]);

  // 목업 데이터를 기반으로 마커 및 클러스터링 생성
  useEffect(() => {
    const { kakao } = window;
    if (!mapInstance.current || !clustererInstance.current) return;

    // 기존 마커 초기화
    clustererInstance.current.clear();

    // 새 마커 배열 생성
    const markers = mockRestaurants.map((restaurant) => {
      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(restaurant.lat, restaurant.lng),
        title: restaurant.name,
      });

      // 마커 클릭 이벤트 (추후 오버레이나 사이드바 연동 시 사용)
      kakao.maps.event.addListener(marker, 'click', () => {
        console.log(`${restaurant.name} 클릭됨!`);
      });

      return marker;
    });

    // 클러스터러에 마커들 추가
    clustererInstance.current.addMarkers(markers);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {/* 지도 컨테이너 */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      
      {/* 디버깅용 UI - 화면에 보이는 영역 좌표 */}
      {bounds && (
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 2, background: 'rgba(0,0,0,0.7)', color: 'white', padding: '10px', borderRadius: '5px', fontSize: '12px' }}>
          <div>SW: {bounds.sw}</div>
          <div>NE: {bounds.ne}</div>
        </div>
      )}
    </div>
  );
};

export default KakaoMap;