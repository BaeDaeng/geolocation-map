import { useState, useEffect } from 'react';

export const useGeolocation = () => {
  const isSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  const [location, setLocation] = useState({
    lat: 37.6152, // 서경대 부근 (기본값)
    lng: 127.0132,
  });
  
  const [error, setError] = useState(isSupported ? '' : 'Geolocation is not supported by your browser');

  useEffect(() => {
    if (!isSupported) return;

    // 옵션 객체 추가: 고정밀도 사용, 5초 내 응답 없으면 시간 초과, 캐시된 이전 위치 사용 안 함
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => {
        console.warn("위치 에러:", err.message);
        setError('Unable to retrieve your location');
      },
      options // 옵션 적용
    );
  }, [isSupported]);

  return { location, error };
};