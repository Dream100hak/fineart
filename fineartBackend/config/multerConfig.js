const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 공통 저장소 설정 (날짜별 폴더 생성)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const folderPath = path.join('uploads', year + '-' + month + '-' + day);

    // 폴더가 없는 경우 생성
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    cb(null, folderPath); // 파일이 저장될 경로
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // 고유 파일명 생성
  },
});

// 이미지 업로드용 multer
const imageUpload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB로 제한
  fileFilter: function (req, file, cb) {
    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'), false);
    }
  },
});

// 동영상 업로드용 multer
const videoUpload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB로 제한
  fileFilter: function (req, file, cb) {
    const allowedExtensions = ['.mp4', '.mov', '.avi'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('동영상 파일만 업로드 가능합니다.'), false);
    }
  },
});

module.exports = { imageUpload, videoUpload };
