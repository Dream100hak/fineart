const express = require('express');
const {
  createArticle,
  getArticles,
  getArticleById,
  incrementArticleViews,
  deleteArticle,
  uploadImage,
  uploadVideo,
  uploadThumbnail,
} = require('../controllers/boardController'); // 공통 컨트롤러 사용
const { imageUpload, videoUpload } = require('../config/multerConfig');


const router = express.Router();

const dynamicRoute = (req, res, next) => {
  const { boardType } = req.params; // 경로에서 boardType을 추출
  console.log('boardType:', boardType); // boardType 값을 콘솔에 출력
  req.boardType = boardType; // 추출한 boardType을 req에 저장
  next();
};

// 게시글 작성 라우트
router.post('/:boardType/articles', dynamicRoute, createArticle);

// 이미지 업로드 라우트
router.post('/:boardType/upload/image', imageUpload.single('image'), uploadImage);

// 동영상 업로드 라우트
router.post('/:boardType/upload/video', dynamicRoute, videoUpload.single('video'), uploadVideo);


// 썸네일 업로드 라우트 (이미지 업로드로 처리)
router.post('/:boardType/upload/thumbnail', imageUpload.single('thumbnail'), uploadThumbnail);

// 게시글 목록 조회 라우트
router.get('/:boardType/articles', dynamicRoute, getArticles);

// 특정 게시글 조회 라우트
router.get('/:boardType/articles/:id', dynamicRoute, getArticleById);

// 조회수 증가 라우트
router.put('/:boardType/articles/:id/views', dynamicRoute, incrementArticleViews);

// 게시글 삭제 라우트
router.delete('/:boardType/articles/:id', dynamicRoute, deleteArticle);

module.exports = router;


