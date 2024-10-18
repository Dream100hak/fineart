import React, { createContext, useState } from 'react';

// Context 생성
export const ArtistContext = createContext();

// Provider 컴포넌트 생성
export const ArtistProvider = ({ children }) => {
  const [artists, setArtists] = useState([]); // 작가 목록 상태
  const [totalArtists, setTotalArtists] = useState(0); // 총 작가 수 상태
  const [artistGroups, setArtistGroups] = useState({  // 그룹별 작가 목록 상태
    "고전작가": [],
    "역대작가": [],
    "현대작가": [],
    "수상작가": [],
    "MZ작가": [],
    "화제작가": [],
    "스타작가": []
  });

  return (
    <ArtistContext.Provider value={{ artists, setArtists, totalArtists, setTotalArtists, artistGroups, setArtistGroups }}>
      {children}
    </ArtistContext.Provider>
  );
};
