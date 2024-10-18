const express = require('express');
const { getArtworks, getArtworkById, getArtworksByArtistId, addArtwork, uploadArtworkImage } = require('../controllers/artworkController');

const router = express.Router();

// 갤러리 작품 목록 조회
router.get('/', getArtworks);

// 특정 작품 조회
router.get('/:id', getArtworkById);

// 특정 작가의 모든 작품 조회
router.get('/artist/:artist_id/artworks', getArtworksByArtistId);

// 작품 추가
router.post('/', addArtwork);

// 이미지 업로드
router.post('/upload', uploadArtworkImage);

module.exports = router;
