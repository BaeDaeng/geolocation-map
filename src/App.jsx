import React from 'react';
import KakaoMap from './components/Map/KakaoMap';
import Sidebar from './components/Sidebar';
import ReviewModal from './components/ReviewModal';
import SearchBar from './components/SearchBar';

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="map-wrapper">
        <SearchBar /> {/* 지도 상단에 검색창 배치 */}
        <KakaoMap />
      </div>
      <ReviewModal />
    </div>
  );
}

export default App;