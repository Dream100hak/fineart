const { promisePool } = require('../db/dbConnection');

// 코멘트 작성
async function createComment(req, res) {
  const { content, writer } = req.body;

  try {
    const sql = 'INSERT INTO artists_simple_board (content, writer, date) VALUES (?, ?, NOW())';
    const [result] = await promisePool.query(sql, [content, writer]);

    res.status(201).json({ message: '코멘트 작성 성공', commentId: result.insertId });
  } catch (err) {
    console.error('코멘트 작성 실패:', err);
    res.status(500).json({ error: '코멘트 작성 중 오류가 발생했습니다.' });
  }
}

// 코멘트 목록 조회
async function getComments(req, res) {
  try {
    const sql = 'SELECT * FROM artists_simple_board ORDER BY created_at DESC';
    const [rows] = await promisePool.query(sql);

    res.status(200).json(rows);
  } catch (err) {
    console.error('코멘트 조회 실패:', err);
    res.status(500).json({ error: '코멘트 조회 중 오류가 발생했습니다.' });
  }
}

// 특정 코멘트 조회
async function getCommentById(req, res) {
  const { id } = req.params;

  try {
    const sql = 'SELECT * FROM artists_simple_board WHERE id = ?';
    const [rows] = await promisePool.query(sql, [id]);

    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ message: '코멘트를 찾을 수 없습니다.' });
    }
  } catch (err) {
    console.error('코멘트 조회 실패:', err);
    res.status(500).json({ error: '코멘트 조회 중 오류가 발생했습니다.' });
  }
}

// 코멘트 삭제
async function deleteComment(req, res) {
  const { id } = req.params;

  try {
    const sql = 'DELETE FROM artists_simple_board WHERE id = ?';
    const [result] = await promisePool.query(sql, [id]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: '코멘트 삭제 성공' });
    } else {
      res.status(404).json({ message: '코멘트를 찾을 수 없습니다.' });
    }
  } catch (err) {
    console.error('코멘트 삭제 실패:', err);
    res.status(500).json({ error: '코멘트 삭제 중 오류가 발생했습니다.' });
  }
}

module.exports = {
  createComment,
  getComments,
  getCommentById,
  deleteComment,
};
