import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import './BoardDetails.css';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// 커스텀 비디오 블롯 정의 및 등록
const BlockEmbed = Quill.import('blots/block/embed');

class CustomVideoBlot extends BlockEmbed {
  static create(value) {
    const node = super.create();
    const container = document.createElement('div');
    container.setAttribute('class', 'video-container');

    const img = document.createElement('img');
    img.setAttribute('src', value.thumbnailUrl);
    img.setAttribute('alt', '동영상 썸네일');
    img.setAttribute('class', 'video-thumbnail');

    const overlay = document.createElement('div');
    overlay.setAttribute('class', 'video-overlay');

    const playIcon = document.createElement('div');
    playIcon.setAttribute('class', 'play-icon');

    container.setAttribute('data-video-url', value.videoUrl);

    container.addEventListener('click', () => {
      const videoUrl = container.getAttribute('data-video-url');
      const video = document.createElement('video');
      video.setAttribute('src', videoUrl);
      video.setAttribute('controls', 'controls');
      video.setAttribute('autoplay', 'autoplay');
      video.setAttribute('style', 'max-width: 100%;');
      node.innerHTML = '';
      node.appendChild(video);
    });

    overlay.appendChild(playIcon);
    container.appendChild(img);
    container.appendChild(overlay);
    node.appendChild(container);

    return node;
  }

  static value(node) {
    const container = node.querySelector('.video-container');
    return {
      thumbnailUrl: container.querySelector('.video-thumbnail').getAttribute('src'),
      videoUrl: container.getAttribute('data-video-url'),
    };
  }
}

CustomVideoBlot.blotName = 'customVideo';
CustomVideoBlot.tagName = 'div';
Quill.register(CustomVideoBlot);

function BoardDetail() {
  const { articleId } = useParams(); // 수정할 게시글 ID 가져오기
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const quillRef = useRef(null);

  const determineBoardType = (path) => {
    if (path.includes('/free_board')) {
      return 'free_board';
    } else if (path.includes('/qna_board')) {
      return 'qna_board';
    } else if (path.includes('/job_board')) {
      return 'job_board';
    }
    return 'free_board';
  };

  const boardType = determineBoardType(location.pathname);

  const modules = useMemo(() => {
    return {
      toolbar: {
        container: [
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'image', 'video'],
          ['clean'],
        ],
        handlers: {
          image: () => {
            const editor = quillRef.current.getEditor();
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            input.click();

            input.onchange = async () => {
              const file = input.files[0];
              if (file) {
                try {
                  const formData = new FormData();
                  formData.append('image', file);

                  const res = await fetch(`/api/board/${boardType}/upload/image`, {
                    method: 'POST',
                    body: formData,
                  });

                  if (!res.ok) {
                    throw new Error('이미지 업로드 실패');
                  }

                  const data = await res.json();
                  const imageUrl = data.url;

                  const range = editor.getSelection(true);
                  editor.insertEmbed(range.index, 'image', imageUrl);
                  editor.setSelection(range.index + 1);
                } catch (error) {
                  console.error('이미지 업로드 실패:', error);
                  alert('이미지 업로드 중 문제가 발생했습니다.');
                }
              } else {
                alert('이미지를 선택해 주세요.');
              }
            };
          },
          video: () => {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'video/*');
            input.click();

            input.onchange = () => {
              const file = input.files[0];
              if (file) {
                const videoURL = URL.createObjectURL(file);
                const editor = quillRef.current.getEditor();
                const range = editor.getSelection(true);
                editor.insertEmbed(range.index, 'customVideo', {
                  thumbnailUrl: '',
                  videoUrl: videoURL,
                });
                editor.setSelection(range.index + 1);
              }
            };
          },
        },
      },
    };
  }, [boardType]);

  // 게시글 데이터 불러오기
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        if (articleId) {
          const response = await fetch(`/api/board/${boardType}/articles/${articleId}`);
          if (!response.ok) throw new Error('게시글을 불러오는 데 실패했습니다.');
          
          const data = await response.json();
          setTitle(data.title);
          setContent(data.content);
        }
      } catch (error) {
        console.error('게시글 불러오기 실패:', error);
        alert('게시글을 불러오는 중 문제가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [articleId, boardType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const method = articleId ? 'PUT' : 'POST';
      const endpoint = articleId
        ? `/api/board/${boardType}/articles/${articleId}`
        : `/api/board/${boardType}/articles`;

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          writer: '관리자', // Firebase 인증을 사용하지 않으므로 임시로 '관리자'로 설정
        }),
      });

      if (response.ok) {
        alert(articleId ? '게시글이 성공적으로 수정되었습니다.' : '게시글이 성공적으로 작성되었습니다.');
        navigate(`/board/${boardType}`);
      } else {
        throw new Error(articleId ? '게시글 수정 실패' : '게시글 작성 실패');
      }
    } catch (error) {
      console.error('게시글 처리 중 오류:', error);
      alert('게시글 처리 중 문제가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }


  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'color',
    'background',
    'list',
    'bullet',
    'link',
    'image',
    'video',
    'customVideo',
    'align',
  ];

  return (
    <div className="boarddetail-container">
      <h1>{articleId ? '게시글 수정' : '게시글 작성'}</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={content}
          onChange={setContent}
          modules={modules}
          formats={formats}
          placeholder="내용을 입력하세요"
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '처리 중...' : articleId ? '수정' : '작성'}
        </button>
      </form>
    </div>
  );
}

export default BoardDetail;
