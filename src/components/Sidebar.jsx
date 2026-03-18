import React from 'react';
import { useKakaoSearch } from '../hooks/useKakaoSearch';
import { useStore } from '../store/useStore';

export default function Sidebar() {
  // 👈 이제 Sidebar도 지도의 현재 위치(bounds)를 알 수 있습니다!
  const { bounds, reviews, setSelectedPlace, setModalOpen } = useStore();
  
  // bounds 값을 넣어서 API를 호출합니다 (지도와 완벽하게 동기화됨)
  const { data: restaurants = [] } = useKakaoSearch(bounds); 

  return (
    <div className="sidebar">
      <h2>현재 화면 맛집 ({restaurants.length})</h2>
      <div className="list-container">
        {/* 결과가 없을 때 보여줄 안내 문구 추가 */}
        {restaurants.length === 0 && (
          <p style={{textAlign: 'center', marginTop: '30px', color: '#888'}}>
            주변에 맛집이 없거나<br/>지도를 이동해보세요!
          </p>
        )}
        
        {restaurants.map((place) => {
          const placeReviews = reviews[place.id] || [];
          const avgRating = placeReviews.length
            ? (placeReviews.reduce((sum, r) => sum + r.rating, 0) / placeReviews.length).toFixed(1)
            : '평가 없음';

          return (
            <div key={place.id} className="place-card">
              <h3>{place.place_name}</h3>
              <p>{place.road_address_name || place.address_name}</p>
              <div className="card-footer">
                <span className="rating">⭐ {avgRating} ({placeReviews.length})</span>
                <button onClick={() => { setSelectedPlace(place); setModalOpen(true); }}>
                  리뷰
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}