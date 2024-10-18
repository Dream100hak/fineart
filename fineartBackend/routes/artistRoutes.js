const express = require('express');
const { getArtists, getArtistById, addArtist , updateArtist , deleteArtist } = require('../controllers/artistController');
const router = express.Router();

// 작가 목록 조회 라우트
router.get('/', getArtists);

// 특정 작가 정보 조회 라우트
router.get('/:id', getArtistById);

// 작가 추가 라우트
router.post('/', addArtist);

// 작가 업데이트 라우트 
router.put('/:id', updateArtist);

//작기 삭제 라우트
router.delete('/:id', deleteArtist);

module.exports = router;