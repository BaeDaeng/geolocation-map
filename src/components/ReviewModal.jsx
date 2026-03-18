import React, { useState } from 'react';
import { useStore } from '../store/useStore';

export default function ReviewModal() {
  const { isModalOpen, setModalOpen, selectedPlace, reviews, addReview } = useStore();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');

  if (!isModalOpen || !selectedPlace) return null;

  const placeReviews = reviews[selectedPlace.id] || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    addReview(selectedPlace.id, { rating, text });
    setText('');
  };

  return (
    <div className="modal-overlay" onClick={() => setModalOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{selectedPlace.place_name}</h2>
        <p className="modal-category">{selectedPlace.category_name}</p>
        
        <div className="reviews-list">
          {placeReviews.length === 0 ? <p>첫 리뷰를 남겨주세요!</p> : null}
          {placeReviews.map((r, i) => (
            <div key={i} className="review-item">
              <span>⭐ {r.rating}</span>
              <p>{r.text}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="review-form">
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
            {[5,4,3,2,1].map(num => <option key={num} value={num}>{num}점</option>)}
          </select>
          <input 
            type="text" 
            placeholder="리뷰를 작성해보세요" 
            value={text} 
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit">등록</button>
        </form>
        <button className="close-btn" onClick={() => setModalOpen(false)}>닫기</button>
      </div>
    </div>
  );
}