import React from 'react';
import KakaoMap from './components/Map/KakaoMap';
import Sidebar from './components/Sidebar';
import ReviewModal from './components/ReviewModal';

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="map-wrapper">
        <KakaoMap />
      </div>
      <ReviewModal />
    </div>
  );
}

export default App;