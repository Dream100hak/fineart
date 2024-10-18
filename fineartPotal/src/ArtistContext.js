// ArtistContext.js
import React, { createContext, useState } from 'react';

// Context 생성
export const ArtistContext = createContext();

// Provider 컴포넌트 생성
export const ArtistProvider = ({ children }) => {
  const [artists, setArtists] = useState([]); // 작가 목록 상태
  const [totalArtists, setTotalArtists] = useState(0); // 총 작가 수 상태

  return (
    <ArtistContext.Provider value={{ artists, setArtists, totalArtists, setTotalArtists }}>
      {children}
    </ArtistContext.Provider>
  );
};
