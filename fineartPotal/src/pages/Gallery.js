// Gallery.js
import React, { useState, useEffect } from 'react';
import '../css/Gallery.css';
import axios from 'axios';
import { getCanvasSizes } from 'Common';
import { useNavigate } from 'react-router-dom';

function Gallery() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    canvas_type: '',
    canvas_size: '',
    category: '',
    price: '',
    is_rentable: '',
  });

  const [activeFilters, setActiveFilters] = useState({});
  const [canvasSizes, setCanvasSizes] = useState({});
  const [artists, setArtists] = useState({});

  const navigate = useNavigate();

  useEffect(() => {

    const fetchCanvasSizes = async () => {
      const sizes = await getCanvasSizes();
      setCanvasSizes(sizes);
    };

    const fetchArtworks = async () => {
      let query = `/api/artworks/?`;
      for (const key in filters) {
        if (filters[key] && filters[key] !== '') query += `${key}=${filters[key]}&`;
      }

      try {
        const response = await axios.get(query);
        if (response.status !== 200) throw new Error('작품을 불러오지 못했습니다.');
        const data = response.data;
        
        // Artist 정보 추가
        const artistIds = [...new Set(data.map(artwork => artwork.artist_id))];
        const artistResponses = await Promise.all(artistIds.map(id => axios.get(`/api/artists/${id}`)));
        const artistsData = artistResponses.reduce((acc, res) => {
          acc[res.data.id] = res.data;
          return acc;
        }, {});
        setArtists(artistsData);
        
        // 작품 데이터에 작가 이름 추가
        const artworksWithArtistNames = data.map(artwork => ({
          ...artwork,
          artist_name: artistsData[artwork.artist_id]?.name || 'Unknown Artist'
        }));
        setArtworks(artworksWithArtistNames);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCanvasSizes();
    fetchArtworks();
  }, [filters]);

  const filtersOptions = {
    price: [
      { label: '30만~50만', value: '300000-500000' },
      { label: '50만~100만', value: '500000-1000000' },
      { label: '100만~200만', value: '1000000-2000000' },
      { label: '200만~300만', value: '2000000-3000000' },
      { label: '300만~500만', value: '3000000-5000000' },
      { label: '500만~1000만', value: '5000000-10000000' },
      { label: '미판매', value: '0-0' },
    ]
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setActiveFilters({ ...activeFilters, [key]: key === 'price' ? filtersOptions.price.find(option => option.value === value)?.label : value });
  };

  const handleRemoveFilter = (key) => {
    const updatedFilters = { ...filters, [key]: '' };
    setFilters(updatedFilters);
    setActiveFilters({ ...activeFilters, [key]: '' });
  };

  const handleClearAllFilters = () => {
    setFilters({
      canvas_type: '',
      canvas_size: '',
      category: '',
      price: '',
      is_rentable: '',
    });
    setActiveFilters({});
  };

  const handleArtworkClick = (artwork) => {
    navigate(`/artwork/${artwork.id}`, { state: { artistName: artwork.artist_name } });
  };

  return (
    <div className="gallery-container">
      <h1>Art Gallery</h1>

      {/* Active Filters */}
      <div className="active-filters">
        {Object.keys(activeFilters).map((key) =>
          activeFilters[key] ? (
            <span key={key} className="filter-tag">
              {activeFilters[key]} <button onClick={() => handleRemoveFilter(key)}>x</button>
            </span>
          ) : null
        )}
        {Object.values(activeFilters).some((value) => value) && (
          <button className="clear-filters" onClick={handleClearAllFilters}>전체 필터 삭제</button>
        )}
      </div>

      {/* Filters Section */}
      <div className="filters-container">
        <div className="filter-group">
          <h2>캔버스 종류</h2>
          <div className="filter-buttons">
            {['F', 'P', 'M'].map((type) => (
              <button
                key={type}
                className={filters.canvas_type === type ? 'active' : ''}
                onClick={() => handleFilterChange('canvas_type', type)}
                aria-pressed={filters.canvas_type === type}
              >
                {type}형
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <h2>사이즈</h2>
          <div className="filter-buttons">
            {[
              '1~5호',
              '6~10호',
              '~20호',
              '~30호',
              '~40호',
              '~60호',
              '~80호',
              '~150호',
              '~500호',
            ].map((size) => (
              <button
                key={size}
                className={filters.canvas_size === size ? 'active' : ''}
                onClick={() => handleFilterChange('canvas_size', size)}
                aria-pressed={filters.canvas_size === size}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <h2>카테고리</h2>
          <div className="filter-buttons">
            {['인물화', '풍경화', '정물화', '동물화', '상상화', '추상화'].map((category) => (
              <button
                key={category}
                className={filters.category === category ? 'active' : ''}
                onClick={() => handleFilterChange('category', category)}
                aria-pressed={filters.category === category}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <h2>가격</h2>
          <div className="filter-buttons">
            {[
              { label: '30만~50만', value: '300000-500000' },
              { label: '50만~100만', value: '500000-1000000' },
              { label: '100만~200만', value: '1000000-2000000' },
              { label: '200만~300만', value: '2000000-3000000' },
              { label: '300만~500만', value: '3000000-5000000' },
              { label: '500만~1000만', value: '5000000-10000000' },
              { label: '미판매', value: '0-0' },
            ].map((price) => (
              <button
                key={price.value}
                className={filters.price === price.value ? 'active' : ''}
                onClick={() => handleFilterChange('price', price.value)}
                aria-pressed={filters.price === price.value}
              >
                {price.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <h2>렌탈 가능 여부</h2>
          <div className="filter-buttons">
            {['가능', '불가능'].map((rentable) => (
              <button
                key={rentable}
                className={filters.is_rentable === rentable ? 'active' : ''}
                onClick={() => handleFilterChange('is_rentable', rentable)}
                aria-pressed={filters.is_rentable === rentable}
              >
                {rentable}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <p>로딩 중...</p>
      ) : (
        <div className="gallery-grid">
        {artworks.map((artwork) => (
          <div key={artwork.id} className="gallery-item" onClick={() => handleArtworkClick(artwork)}>
            <img src={`${artwork.image_url}`} alt={artwork.title} />
            <div className="overlay">
              <h2>{artwork.name}</h2>
              <p>{artwork.artist_name}</p>
              <p>{artwork.category}</p>
              <p>{artwork.canvas_type}형 {artwork.canvas_size}호 ({canvasSizes[artwork.canvas_type]?.[artwork.canvas_size]}cm)</p>
              <p>렌탈 가능 여부: {artwork.is_rentable ? '가능' : '불가능'}</p>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}

export default Gallery;