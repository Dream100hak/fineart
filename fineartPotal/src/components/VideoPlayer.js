// src/components/VideoPlayer.js
import React, { useState } from 'react';
import '../css/Global/VideoPlayer.css'; // 스타일 파일

function VideoPlayer({ videoUrl, thumbnailUrl }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleClick = () => {
    setIsPlaying(true);
  };

  return (
    <div className="video-player-container">
      {isPlaying ? (
        <video src={videoUrl} controls autoPlay style={{ maxWidth: '100%' }} />
      ) : (
        <div className="video-container" onClick={handleClick}>
          <img src={thumbnailUrl} alt="동영상 썸네일" className="video-thumbnail" />
          <div className="video-overlay">
            <div className="play-icon"></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;
