const { promisePool } = require('../db/dbConnection');
const bcrypt = require('bcrypt');

// 사용자 회원가입 처리
async function signup(req, res) {
  const { email, password, name } = req.body;

  try {
    // 비밀번호 해싱 처리
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 데이터 삽입 쿼리
    const sql = 'INSERT INTO Users (email, password, name) VALUES (?, ?, ?)';
    const [result] = await promisePool.query(sql, [email, hashedPassword, name]);

    res.status(201).json({ message: '사용자 추가 성공', userId: result.insertId });
  } catch (err) {
    console.error('회원가입 실패:', err);
    res.status(500).json({ error: 'DB 저장 실패' });
  }
}
// 사용자 이름 조회 (이메일을 기준으로)
async function getUserByEmail(req, res) {
  const { email } = req.params;

  try {
    const sql = 'SELECT name FROM users WHERE email = ?';
    const [rows] = await promisePool.query(sql, [email]);

    if (rows.length > 0) {
      res.status(200).json({ name: rows[0].name });
    } else {
      res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
  } catch (err) {
    console.error('사용자 닉네임 조회 실패:', err);
    res.status(500).json({ error: '사용자 닉네임 조회 중 오류가 발생했습니다.' });
  }
}

// 두 개의 함수를 한 번에 내보내기
module.exports = { signup, getUserByEmail };