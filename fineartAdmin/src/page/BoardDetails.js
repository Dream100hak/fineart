import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const quillRef = useRef(null);

  const boardType = useMemo(() => {
    if (location.pathname.includes('/free_board')) {
      return 'free_board';
    } else if (location.pathname.includes('/qna_board')) {
      return 'qna_board';
    } else if (location.pathname.includes('/job_board')) {
      return 'job_board';
    }
    return 'free_board';
  }, [location.pathname]);

  // 이미지 핸들러
  const imageHandler = () => {
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

          const data = await res.json();
          const imageUrl = data.url;

          const range = editor.getSelection(true);
          editor.insertEmbed(range.index, 'image', imageUrl);
          editor.setSelection(range.index + 1);
        } catch (error) {
          console.error('이미지 업로드 실패:', error);
          alert('이미지 업로드 중 문제가 발생했습니다.');
        }
      }
    };
  };

  // 동영상 핸들러
  const videoHandler = () => {
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
        // 기존 커스텀 방식 대신 간단히 embed 추가
        editor.insertEmbed(range.index, 'video', videoURL);
        editor.setSelection(range.index + 1);
      }
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/board/${boardType}/articles`, {
        method: 'POST',
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
        alert('게시글이 성공적으로 작성되었습니다.');
        navigate(`/board/${boardType}`);
      } else {
        throw new Error('게시글 작성 실패');
      }
    } catch (error) {
      console.error('게시글 작성 중 오류:', error);
      alert('게시글 작성 중 문제가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modules = useMemo(
    () => ({
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
          image: imageHandler,
          video: videoHandler,
        },
      },
    }),
    []
  );

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
      <h1>게시글 작성</h1>
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
          {isSubmitting ? '작성 중...' : '작성'}
        </button>
      </form>
    </div>
  );
}

export default BoardDetail;
