import { useState, useEffect } from 'react';

export const useGeolocation = () => {
  // 1. 브라우저 지원 여부를 먼저 확인합니다. 
  // (안전성을 위해 typeof navigator 체크를 추가했습니다)
  const isSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  const [location, setLocation] = useState({
    lat: 37.6152, // 서경대 부근 초기 좌표
    lng: 127.0132,
  });
  
  // 2. 지원하지 않는다면 초기 상태값부터 곧바로 에러 메시지를 세팅합니다.
  const [error, setError] = useState(isSupported ? '' : 'Geolocation is not supported by your browser');

  useEffect(() => {
    // 3. 미지원 브라우저라면 동기적인 setError 호출 없이 여기서 바로 이펙트를 종료합니다.
    if (!isSupported) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setError('Unable to retrieve your location');
      }
    );
  }, [isSupported]);

  return { location, error };
};