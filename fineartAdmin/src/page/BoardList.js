import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BoardList.css'

function BoardList() {
  const { boardType } = useParams(); // URL 경로에서 boardType을 가져옴
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get(`/api/board/${boardType}/articles`);
        setArticles(response.data);
      } catch (error) {
        console.error('게시글 목록 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [boardType]);

  const handleEdit = (articleId) => {
    navigate(`/board/${boardType}/${articleId}`);
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="board-list">
      <h2>{boardType === 'free_board' ? '자유게시판' : boardType === 'job_board' ? '구인구직' : 'Q&A 게시판'}</h2>
      <table>
        <thead>
          <tr>
            <th>제목</th>
            <th>작성자</th>
            <th>작성일</th>
            <th>조회수</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => (
            <tr key={article.id}>
              <td>{article.title}</td>
              <td>{article.writer}</td>
              <td>{new Date(article.date).toLocaleString()}</td>
              <td>{article.views}</td>
              <td>
                <button onClick={() => handleEdit(article.id)}>수정</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BoardList;
