// controllers/artworkController.js
const path = require('path');  // Node.js path 모듈 추가
const { v4: uuidv4 } = require('uuid');
const { promisePool } = require('../db/dbConnection');
const { imageUpload } = require('../config/multerConfig');

// 작품 코드 생성 함수 정의
function generateArtworkCode(artistId) {
  const shortCode = uuidv4().split('-')[0];
  return `ART-${artistId}-${shortCode}`;
}

// 전체 갤러리 작품 목록 조회 with 필터
async function getArtworks(req, res) {
  const { category, canvas_size, price, is_rentable, canvas_type } = req.query;

  let sql = 'SELECT * FROM artworks WHERE 1=1';
  const queryParams = [];

  if (category) {
    sql += ' AND category = ?';
    queryParams.push(category);
  }

  if (canvas_size) {
    const sizeRanges = {
      '1~5호': [1, 5],
      '6~10호': [6, 10],
      '~20호': [11, 20],
      '~30호': [21, 30],
      '~40호': [31, 40],
      '~60호': [41, 60],
      '~80호': [61, 80],
      '~150호': [100, 150],
      '~500호': [151, 500],
    };
    const [minSize, maxSize] = sizeRanges[canvas_size];
    if (minSize !== undefined && maxSize !== undefined) {
      sql += ' AND canvas_size BETWEEN ? AND ?';
      queryParams.push(minSize, maxSize);
    }
  }

  if (price && price !== '') {
    if (price === '0-0') {
      sql += ' AND price = 0';
    } else {
      const [minPrice, maxPrice] = price.split('-');
      if (minPrice !== undefined && maxPrice !== undefined) {
        sql += ' AND price BETWEEN ? AND ?';
        queryParams.push(minPrice, maxPrice);
      }
    }
  }

  if (is_rentable) {
    sql += ' AND is_rentable = ?';
    queryParams.push(is_rentable === '가능');
  }

  if (canvas_type) {
    sql += ' AND canvas_type = ?';
    queryParams.push(canvas_type);
  }

  sql += ' ORDER BY created_at DESC';

  try {
    const [rows] = await promisePool.query(sql, queryParams);
    res.status(200).json(rows);
  } catch (err) {
    console.error('작품 목록 조회 실패:', err);
    res.status(500).json({ error: '작품 목록 조회 중 오류가 발생했습니다.' });
  }
}

// 특정 작품 조회
async function getArtworkById(req, res) {
  const { id } = req.params;

  try {
    const sql = 'SELECT * FROM artworks WHERE id = ?';
    const [rows] = await promisePool.query(sql, [id]);

    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ message: '작품을 찾을 수 없습니다.' });
    }
  } catch (err) {
    console.error('작품 조회 실패:', err);
    res.status(500).json({ error: '작품 조회 중 오류가 발생했습니다.' });
  }
}

// 특정 작가의 모든 작품 조회
async function getArtworksByArtistId(req, res) {
  const { artist_id } = req.params;

  try {
    const sql = 'SELECT * FROM artworks WHERE artist_id = ? ORDER BY created_at DESC';
    const [rows] = await promisePool.query(sql, [artist_id]);

    if (rows.length > 0) {
      res.status(200).json(rows);
    } else {
      res.status(404).json({ message: '해당 작가의 작품을 찾을 수 없습니다.' });
    }
  } catch (err) {
    console.error('작가 작품 조회 실패:', err);
    res.status(500).json({ error: '작가 작품 조회 중 오류가 발생했습니다.' });
  }
}

// 작품 추가
async function addArtwork(req, res) {
  const { artist_id, name, price, is_rentable, image_url, category, description, canvas_type, canvas_size } = req.body;

  try {
    const code = generateArtworkCode(artist_id);
    const sql = `
      INSERT INTO artworks (artist_id, code, name, price, is_rentable, image_url, category, description, canvas_type, canvas_size)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await promisePool.query(sql, [
      artist_id,
      code,
      name,
      price,
      is_rentable,
      image_url,
      category,
      description,
      canvas_type,
      canvas_size,
    ]);
    res.status(201).json({ message: '작품 추가 성공', artworkId: result.insertId, code });
  } catch (err) {
    console.error('작품 추가 중 오류 발생:', err);
    res.status(500).json({ error: '작품 추가 중 오류가 발생했습니다.' });
  }
}

//작품이미지업로드
async function uploadArtworkImage(req, res) {
  try {
    imageUpload.single('image')(req, res, (err) => {
      if (err) {
        console.error('이미지 업로드 실패:', err);
        return res.status(400).json({ error: '이미지 업로드 실패: ' + err.message });
      }
      if (!req.file) {
        return res.status(400).json({ error: '업로드된 파일이 없습니다.' });
      }

      // 파일 업로드 관련 경로 로그 출력
      console.log('업로드된 파일 이름:', req.file.filename);
      console.log('업로드된 파일 원본 경로:', req.file.path);

      // 올바른 URL 경로 생성
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      const day = String(new Date().getDate()).padStart(2, '0');
      
      // 클라이언트에서 접근 가능한 URL 생성 (Nginx alias 설정에 맞게)
      const imageUrl = `/uploads/${year}-${month}-${day}/${req.file.filename}`;
      console.log('최종 이미지 URL:', imageUrl);
      
      res.status(200).json({ imageUrl });
    });
  } catch (err) {
    console.error('이미지 업로드 중 오류 발생:', err);
    res.status(500).json({ error: '이미지 업로드 중 오류가 발생했습니다.' });
  }
}

module.exports = {
  getArtworks,
  getArtworkById,
  getArtworksByArtistId,
  addArtwork,
  uploadArtworkImage,
};