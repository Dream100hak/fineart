const express = require('express');
const {
  createComment,
  getComments,
  getCommentById,
  deleteComment,
} = require('../controllers/simpleBoardController');

const router = express.Router();

// 코멘트 작성 라우트
router.post('/', createComment);

// 코멘트 목록 조회 라우트
router.get('/', getComments);

// 특정 코멘트 조회 라우트
router.get('/:id', getCommentById);

// 코멘트 삭제 라우트
router.delete('/:id', deleteComment);

module.exports = router;
