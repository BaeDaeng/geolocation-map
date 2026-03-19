import React, { useState } from 'react';
import { useStore } from '../store/useStore';

export default function SearchBar() {
  const { setKeyword } = useStore();
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      setKeyword(input);
    }
  };

  return (
    <div className="top-search-bar">
      <form onSubmit={handleSubmit} className="search-form-floating">
        <input
          type="text"
          placeholder="장소, 식당, 카페 검색색색"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">🔍</button>
      </form>
    </div>
  );
}