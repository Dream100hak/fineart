// src/components/Article.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import parse, { domToReact } from 'html-react-parser';
import DOMPurify from 'dompurify';
import dayjs from 'dayjs';
import '../css/Global/Article.css';
import VideoPlayer from '../components/VideoPlayer.js'; 

function Article() {
  const { id } = useParams();
  const location = useLocation();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 게시판 유형을 경로에서 추출
  const pathSegments = location.pathname.split('/');
  const boardType = pathSegments[1]; // 예: free_board, qna_board, job_board

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/board/${boardType}/articles/${id}`);
        if (!response.ok) {
          throw new Error('게시글을 불러오는 데 실패했습니다.');
        }
        const data = await response.json();
        setPost(data);
        setLoading(false);
      } catch (error) {
        console.error('게시글 조회 실패:', error);
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, boardType]);

  const handleDelete = async () => {
    const confirmDelete = window.confirm('이 게시글을 삭제하시겠습니까?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/board/${boardType}/articles/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('게시글이 삭제되었습니다.');
        navigate(`/${boardType}`);
      } else {
        throw new Error('게시글 삭제 실패');
      }
    } catch (error) {
      console.error('게시글 삭제 중 오류:', error);
      alert('게시글 삭제 중 문제가 발생했습니다.');
    }
  };

  if (loading) {
    return <p>로딩 중...</p>;
  }

  if (!post) {
    return <p>게시글을 불러오는 데 실패했습니다.</p>;
  }

  const options = {
    replace: ({ name, attribs, children }) => {
      if (name === 'div' && attribs && attribs.class === 'video-container') {
        const videoUrl = attribs['data-video-url'];
        const imgElement = children.find(child => child.name === 'img');
        const thumbnailUrl = imgElement ? imgElement.attribs.src : '';

        return <VideoPlayer videoUrl={videoUrl} thumbnailUrl={thumbnailUrl} />;
      }
    },
  };

  return (
    <div className="article-container">
      <h1 className="article-title">{post.title}</h1>
      <div className="article-meta">
        <span className="article-writer">작성자: {post.writer}</span>
        <span className="article-date">
          작성일: {dayjs(post.date).format('YYYY년 MM월 DD일 HH:mm')}
        </span>
        <span className="article-views">조회수: {post.views}</span>
      </div>
      <hr className="article-divider" />
      <div className="article-content">
        {parse(DOMPurify.sanitize(post.content), options)}
      </div>
      <hr className="article-divider" />
      <div className="article-actions">
        <button onClick={handleDelete} className="delete-button">
          게시글 삭제
        </button>
        <button onClick={() => navigate(`/${boardType}`)} className="back-button">
          목록으로 돌아가기
        </button>
      </div>
    </div>
  );
}

export default Article;
