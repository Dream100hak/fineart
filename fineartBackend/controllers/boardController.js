const { promisePool } = require('../db/dbConnection');
const path = require('path');

// 게시글 작성
async function createArticle(req, res) {
  const { title, content, writer } = req.body;
  const boardType = req.boardType;  // 경로에서 전달된 boardType

  try {
    const sql = `INSERT INTO ${boardType} (title, content, writer, date, views) VALUES (?, ?, ?, NOW(), 0)`;
    const [result] = await promisePool.query(sql, [title, content, writer]);
    console.log(`게시글 작성 성공 id: ${result.insertId}`);

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
      console.log(`게시글 삭제 성공: ${boardType}, id: ${id}`); 
      res.status(200).json({ message: '게시글 삭제 성공' });
    } else {
      res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }
  } catch (err) {
    console.error('게시글 삭제 실패:', err);
    res.status(500).json({ error: '게시글 삭제 중 오류가 발생했습니다.' });
  }
}

// 게시글 수정
async function updateArticle(req, res) {
  const { id } = req.params;
  const boardType = req.boardType; 
  const { title, content } = req.body;

  try {
    const sql = `UPDATE ${boardType} SET title = ?, content = ?, date = NOW() WHERE id = ?`;
    const [result] = await promisePool.query(sql, [title, content, id]);

    if (result.affectedRows > 0) {
      console.log(`게시글 수정 성공: ${boardType}, id: ${id}`);
      res.status(200).json({ message: '게시글 수정 성공' });
    } else {
      res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }
  } catch (err) {
    console.error('게시글 수정 실패:', err);
    res.status(500).json({ error: '게시글 수정 중 오류가 발생했습니다.' });
  }
}


// 이미지 업로드
async function uploadImage(req, res) {
  const file = req.file;

  if (file) {
    // 파일이 저장된 경로에 날짜별 폴더를 포함
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
    const url = `${req.protocol}://${req.get('host')}/uploads/${currentDate}/${file.filename}`;
    console.log(`이미지 업로드 성공: ${url}`);
    res.status(200).json({ url });
  } else {
    console.error('이미지 업로드 실패: 파일이 없습니다.');
    res.status(400).json({ error: '이미지 업로드 실패: 파일이 없습니다.' });
  }
}

// 동영상 업로드
async function uploadVideo(req, res) {
  const file = req.file;

  if (file) {
    // 파일이 저장된 경로에 날짜별 폴더를 포함
    const currentDate = new Date().toISOString().split('T')[0];
    const url = `${req.protocol}://${req.get('host')}/uploads/${currentDate}/${file.filename}`;
    console.log(`동영상 업로드 성공: ${url}`);
    res.status(200).json({ url });
  } else {
    console.error('동영상 업로드 실패: 파일이 없습니다.');
    res.status(400).json({ error: '동영상 업로드 실패: 파일이 없습니다.' });
  }
}

// 썸네일 업로드
async function uploadThumbnail(req, res) {
  const file = req.file;

  if (file) {
    // 파일이 저장된 경로에 날짜별 폴더를 포함
    const currentDate = new Date().toISOString().split('T')[0];
    const url = `${req.protocol}://${req.get('host')}/uploads/${currentDate}/${file.filename}`;
    console.log(`썸네일 업로드 성공: ${url}`);
    res.status(200).json({ url });
  } else {
    console.error('썸네일 업로드 실패: 파일이 없습니다.');
    res.status(400).json({ error: '썸네일 업로드 실패: 파일이 없습니다.' });
  }
}


module.exports = {
  createArticle,
  getArticles,
  getArticleById,
  incrementArticleViews,
  deleteArticle,
  updateArticle,
  uploadImage,
  uploadVideo,
  uploadThumbnail,
};
