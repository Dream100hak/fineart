// server.js

const express = require('express');
const cors = require('cors');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const boardRoutes = require('./routes/boardRoutes'); 
const artworkRoutes = require('./routes/artworkRoutes'); 
const artistRoutes = require('./routes/artistRoutes'); 
const simpleBoardRoutes = require('./routes/simpleBoardRoutes'); 

const app = express();
const PORT = 5000;

// CORS 설정
app.use(cors());

// 요청 본문 크기 제한을 늘립니다. 예: 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 정적 파일 제공 설정 (이미지 및 동영상 업로드 폴더)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 라우터 설정
app.use('/api/users', userRoutes);
app.use('/api/board', boardRoutes);  // 동적 경로로 게시판 처리
app.use('/api/artworks', artworkRoutes);  
app.use('/api/artists', artistRoutes); 
app.use('/api/simple_board', simpleBoardRoutes); 

// 기본 라우트
app.get('/', (req, res) => {
  res.send('백엔드 서버가 실행 중입니다!');
});

// 에러 핸들링 미들웨어 추가
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer 관련 에러 처리
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: '파일 크기가 너무 큽니다. 최대 100MB까지 업로드 가능합니다.' });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    // 기타 에러 처리
    return res.status(500).json({ error: err.message });
  }
  next();
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
});
