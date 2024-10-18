import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // useLocation 추가
import '../css/Global/BasicBoard.css';
import { auth } from '../firebase/firebaseConfig';
import { FaPen } from 'react-icons/fa';

function QnaBoard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation(); // 현재 경로 정보를 가져오기 위해 사용

  // 현재 경로에서 게시판 유형을 추출
  const pathSegments = location.pathname.split('/');
  const boardType = pathSegments[1]; // freeboard, qnaboard, jobboard 등

  // DB에서 게시글 목록 불러오기
  useEffect(() => {
    console.log(boardType);  // 이 부분이 두 번 호출됨
    const fetchPosts = async () => {
      try {
        const response = await fetch(`/api/board/${boardType}/articles`);
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('게시글 목록 불러오기 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [boardType]);  // boardType이 변경될 때만 호출됨

  // 조회수 증가 함수
  const handlePostClick = async (id) => {
    try {
      // 조회수 증가 요청  
      await fetch(`/api/board/${boardType}/articles/${id}/views`, {
        method: 'PUT',
      });

      // 게시글 상세 페이지로 이동
      navigate(`/${boardType}/article/${id}`);
    } catch (error) {
      console.error('조회수 증가 실패:', error);
    }
  };

  // 페이지네이션 관련 상태
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  // 현재 페이지에 해당하는 게시글 필터링
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  // 페이지 변경 함수
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // 총 페이지 수
  const totalPages = Math.ceil(posts.length / postsPerPage);
  const currentUser = auth.currentUser;

  return (
    <div className="basicboard-container">
      <h1>질문 게시판</h1>
      <hr className="title-divider" /> {/* 구분선 추가 */}
      {currentUser && (
        <div className="write-post-button">
          <button onClick={() => navigate(`/${boardType}/boardWrite`)}>
            <FaPen style={{ marginRight: '5px' }} />
            글 쓰기
          </button>
        </div>
      )}

      {/* 로딩 중일 때 */}
      {loading ? (
        <p>로딩 중...</p>
      ) : (
        <>
          {/* 게시글이 없을 때 */}
          {posts.length === 0 ? (
            <p>작성된 게시글이 없습니다.</p>
          ) : (
            <>
              {/* 게시글 목록 표 형식 */}
              <table className="post-table">
                <thead>
                  <tr>
                    <th className="post-number">번호</th>
                    <th className="post-title">제목</th>
                    <th className="post-writer">글쓴이</th>
                    <th className="post-date">작성일</th>
                    <th className="post-views">조회</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPosts.map((post, index) => (
                    <tr key={post.id} onClick={() => handlePostClick(post.id)}>
                      <td>{posts.length - (indexOfFirstPost + index)}</td>
                      <td className="title-cell"> {/* 제목 셀에 클래스 적용 */}
                        <span className="title-text">{post.title}</span>
                      </td>
                      <td>{post.writer}</td>
                      <td>
                        {new Date(post.date).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })}
                      </td>
                      <td>{post.views}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* 페이지네이션 */}
              <div className="pagination">
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    className={currentPage === index + 1 ? 'active' : ''}
                    onClick={() => paginate(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default QnaBoard;
