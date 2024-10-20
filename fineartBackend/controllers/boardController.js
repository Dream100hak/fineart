const { promisePool } = require('../db/dbConnection');
const path = require('path');

// 게시글 작성
async function createArticle(req, res) {
  const { title, content, writer } = req.body;
  const boardType = req.boardType;  // 경로에서 전달된 boardType

  try {
    const sql = `INSERT INTO ${boardType} (title, content, writer, date, views) VALUES (?, ?, ?, NOW(), 0)`;
    const [result] = await promisePool.query(sql, [title, content, writer]);

    res.status(201).json({ message: '게시글 작성 성공', postId: result.insertId });
  } catch (err) {
    console.error('게시글 작성 실패:', err);
    res.status(500).json({ error: '게시글 작성 중 오류가 발생했습니다.' });
  }
}

// 게시글 목록 조회
async function getArticles(req, res) {
  const boardType = req.boardType;  // 경로에서 전달된 boardType

  try {
    const sql = `SELECT * FROM ${boardType} ORDER BY date DESC`;
    const [rows] = await promisePool.query(sql);

    res.status(200).json(rows);
  } catch (err) {
    console.error('게시글 조회 실패:', err);
    res.status(500).json({ error: '게시글 조회 중 오류가 발생했습니다.' });
  }
}

// 특정 게시글 조회
async function getArticleById(req, res) {
  const { id } = req.params;
  const boardType = req.boardType;  // 경로에서 전달된 boardType

  try {
    const sql = `SELECT * FROM ${boardType} WHERE id = ?`;
    const [rows] = await promisePool.query(sql, [id]);

    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }
  } catch (err) {
    console.error('게시글 조회 실패:', err);
    res.status(500).json({ error: '게시글 조회 중 오류가 발생했습니다.' });
  }
}

// 조회수 증가
async function incrementArticleViews(req, res) {
  const { id } = req.params;
  const boardType = req.boardType;  // 경로에서 전달된 boardType

  try {
    const sql = `UPDATE ${boardType} SET views = views + 1 WHERE id = ?`;
    const [result] = await promisePool.query(sql, [id]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: '조회수 증가 성공' });
    } else {
      res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }
  } catch (err) {
    console.error('조회수 업데이트 실패:', err);
    res.status(500).json({ error: '조회수 업데이트 중 오류가 발생했습니다.' });
  }
}

// 게시글 삭제
async function deleteArticle(req, res) {
  const { id } = req.params;
  const boardType = req.boardType;  // 경로에서 전달된 boardType

  try {
    const sql = `DELETE FROM ${boardType} WHERE id = ?`;
    const [result] = await promisePool.query(sql, [id]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: '게시글 삭제 성공' });
    } else {
      res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }
  } catch (err) {
    console.error('게시글 삭제 실패:', err);
    res.status(500).json({ error: '게시글 삭제 중 오류가 발생했습니다.' });
  }
}

// 이미지 업로드
async function uploadImage(req, res) {
  const file = req.file;

  if (file) {
    const url = `http://localhost:5000/uploads/${file.filename}`;
    res.status(200).json({ url });
  } else {
    res.status(400).json({ error: '이미지 업로드 실패' });
  }
}

// 동영상 업로드
async function uploadVideo(req, res) {
  const file = req.file;

  if (file) {
    const url = `http://localhost:5000/uploads/${file.filename}`;
    res.status(200).json({ url });
  } else {
    res.status(400).json({ error: '동영상 업로드 실패' });
  }
}

// 썸네일 업로드
async function uploadThumbnail(req, res) {
  const file = req.file;

  if (file) {
    const url = `http://localhost:5000/uploads/${file.filename}`;
    res.status(200).json({ url });
  } else {
    res.status(400).json({ error: '썸네일 업로드 실패' });
  }
}

module.exports = {
  createArticle,
  getArticles,
  getArticleById,
  incrementArticleViews,
  deleteArticle,
  uploadImage,
  uploadVideo,
  uploadThumbnail,
};
