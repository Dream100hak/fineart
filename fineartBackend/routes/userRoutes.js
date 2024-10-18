const express = require('express');
const { signup, getUserByEmail } = require('../controllers/userController');
const router = express.Router();

// 회원가입 라우트
router.post('/signup', signup);

// 사용자 이름 조회 라우트 (이메일을 기반으로)
router.get('/user/:email', getUserByEmail);

module.exports = router;
