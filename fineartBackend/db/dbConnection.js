// db/dbConnection.js
const mysql = require('mysql2');
require('dotenv').config();  // .env 파일 로드

// MySQL 연결 풀 생성
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Promise 기반으로 전환하여 쿼리 처리
const promisePool = pool.promise();

module.exports = { promisePool };
