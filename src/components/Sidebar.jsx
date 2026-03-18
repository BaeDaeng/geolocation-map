import React from 'react';
import { useKakaoSearch } from '../hooks/useKakaoSearch';
import { useStore } from '../store/useStore';

export default function Sidebar() {
  const { category, setCategory, reviews, setSelectedPlace, setModalOpen } = useStore();
  const { data: restaurants = [], isFetching } = useKakaoSearch(); 

  const SkeletonCard = () => (
    <div className="skeleton-card">
      <div className="skeleton-line"></div>
      <div className="skeleton-line short"></div>
      <div className="skeleton-line short" style={{ width: '30%' }}></div>
    </div>
  );

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="category-filters">
          <button className={category === 'FD6' ? 'active' : ''} onClick={() => setCategory('FD6')}>🍚 식당</button>
          <button className={category === 'CE7' ? 'active' : ''} onClick={() => setCategory('CE7')}>☕ 카페</button>
          <button className={category === 'CS2' ? 'active' : ''} onClick={() => setCategory('CS2')}>🏪 편의점</button>
        </div>
      </div>

      <div className="list-container">
        {isFetching ? (
          Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : restaurants.length === 0 ? (
          <p className="empty-msg">조건에 맞는 장소가 없습니다.</p>
        ) : (
          restaurants.map((place) => {
            const placeReviews = reviews[place.id] || [];
            const avgRating = placeReviews.length
              ? (placeReviews.reduce((sum, r) => sum + r.rating, 0) / placeReviews.length).toFixed(1)
              : '평가 없음';

            return (
              <div key={place.id} className="place-card">
                <h3>{place.place_name}</h3>
                <p>{place.road_address_name || place.address_name}</p>
                <div className="card-footer">
                  <div>
                    <span className="rating">⭐ {avgRating}</span>
                    {place.distance && <span className="distance">📍 {place.distance}m</span>}
                  </div>
                  <button onClick={() => { setSelectedPlace(place); setModalOpen(true); }}>리뷰</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}