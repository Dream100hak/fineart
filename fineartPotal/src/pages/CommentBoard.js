import React, { useState, useEffect } from 'react';
import '../css/CommentBoard.css';

const CommentBoard = () => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [writer, setWriter] = useState('');

  useEffect(() => {
    fetchComments();
  }, []);

  // 댓글 가져오기
  const fetchComments = async () => {
    try {
      const response = await fetch('/api/simple_board');
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('댓글을 불러오는 중 오류 발생:', error);
    }
  };

  // 댓글 작성
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newComment.trim() === '' || writer.trim() === '') {
      return alert('내용과 작성자를 입력해주세요.');
    }

    try {
      const response = await fetch('/api/simple_board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment, writer }),
      });
      if (response.ok) {
        fetchComments(); // 댓글 새로고침
        setNewComment(''); // 입력창 비우기
        setWriter('');
      }
    } catch (error) {
      console.error('댓글 작성 중 오류 발생:', error);
    }
  };

  return (
    <div className="comment-board">
      <h3>코멘트</h3>
      <div className="comments-list">
        {comments.map((comment) => (
          <div key={comment.id} className="comment">
            <p className="comment-content">{comment.content}</p>
            <span className="comment-writer">{comment.writer}</span>
            <span className="comment-date">{comment.date}</span>
          </div>
        ))}
      </div>
      <form className="comment-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="작성자"
          value={writer}
          onChange={(e) => setWriter(e.target.value)}
          className="writer-input"
        />
        <textarea
          placeholder="코멘트를 입력하세요"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="comment-input"
        />
        <button type="submit" className="submit-button">등록</button>
      </form>
    </div>
  );
};

export default CommentBoard;
