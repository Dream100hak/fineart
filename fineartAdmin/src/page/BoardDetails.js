import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import ImageResize from './ImageResizeModule';
import './quill-resize-module.css';
import './BoardDetails.css';


// 폰트 사이즈 포맷 정의
const Size = Quill.import('attributors/style/size');
Size.whitelist = ['8px', '10px', '12px', '14px', '18px', '24px', '36px', '72px'];
Quill.register(Size, true);

function BoardDetails() {
  const { boardType, articleId } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [writer, setWriter] = useState('');
  const quillRef = useRef(null);
  const navigate = useNavigate();

  // 이미지 핸들러 함수
  const imageHandler = async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await axios.post(`/api/board/${boardType}/upload/image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // response.data.url로 변경 (imageUrl -> url)
        const imageUrl = response.data.url;
        console.log('Image URL:', imageUrl); // 확인용 로그

        const quill = quillRef.current;
        const range = quill.getSelection(true);

        // 이미지 삽입
        quill.insertText(range.index, '\n');
        quill.insertEmbed(range.index + 1, 'image', imageUrl);
        quill.setSelection(range.index + 2);

      } catch (error) {
        console.error('이미지 업로드 실패:', error);
        alert('이미지 업로드에 실패했습니다.');
      }
    };
  };



  const initializeQuill = useCallback(() => {
    const editor = document.querySelector('#editor');
    if (editor && !quillRef.current) {
      console.log('Editor found, initializing Quill...');
  
      // 에디터 초기 스타일 설정
      editor.style.height = 'auto';
      editor.style.minHeight = '300px'; // 최소 높이 설정
  
      const quill = new Quill(editor, {
        theme: 'snow',
        bounds: editor,
        modules: {
          toolbar: {
            container: [
              [{ 'header': [1, 2, 3, false] }],
              [{ 'size': Size.whitelist }],
              ['bold', 'italic', 'underline'],
              ['image'],
              [{ 'align': [] }],
              ['clean']
            ],
            handlers: {
              image: imageHandler
            }
          },
          imageResize: {
            modules: ['Resize', 'DisplaySize', 'Toolbar'],
            displayStyles: {
              backgroundColor: 'black',
              color: 'white',
              padding: '5px 10px',
              border: 'none',
              borderRadius: '3px'
            }
          }
        },
        formats: ['header', 'size', 'bold', 'italic', 'underline', 'image', 'align']
      });
  
      // 컨텐츠 변경 시 자동 높이 조절
      const updateEditorHeight = () => {
        const editorRoot = quill.root;
        const scrollHeight = editorRoot.scrollHeight;
        editor.style.height = 'auto';
        editor.style.height = scrollHeight + 'px';
        editorRoot.style.height = 'auto';
      };
  
      // 텍스트 변경 이벤트에 높이 조절 함수 연결
      quill.on('text-change', () => {
        updateEditorHeight();
      });
  
      // 이미지 로드 완료 시 높이 재조정
      quill.root.addEventListener('load', (event) => {
        if (event.target.tagName === 'IMG') {
          updateEditorHeight();
        }
      }, true);
  
      quillRef.current = quill;
  
      // 초기 컨텐츠가 있는 경우 설정
      if (content) {
        quill.root.innerHTML = content;
        // 초기 컨텐츠 로드 후 높이 조절
        setTimeout(updateEditorHeight, 0);
      }
    }
  }, [content, imageHandler]);

  useEffect(() => {
    // DOM이 완전히 로드된 후 Quill 초기화
    const timer = setTimeout(() => {
      initializeQuill();
    }, 100);

    return () => clearTimeout(timer);
  }, [initializeQuill]);

  useEffect(() => {
    const fetchArticle = async () => {
      if (articleId === 'write') {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/board/${boardType}/articles/${articleId}`);
        const { title: articleTitle, content: articleContent, writer: articleWriter } = response.data;

        setTitle(articleTitle);
        setContent(articleContent);
        setWriter(articleWriter);
      } catch (error) {
        console.error('게시글 조회 실패:', error);
        alert('게시글을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [boardType, articleId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (!writer.trim()) {
      alert('작성자를 입력해주세요.');
      return;
    }

    if (!quillRef.current.root.innerHTML.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    const articleData = {
      title,
      writer,
      content: quillRef.current.root.innerHTML,
      boardType
    };

    try {
      if (articleId === 'write') {
        await axios.post(`/api/board/${boardType}/articles`, articleData);
      } else {
        await axios.put(`/api/board/${boardType}/articles/${articleId}`, articleData);
      }
      navigate(`/board/${boardType}`);
    } catch (error) {
      console.error('게시글 저장 실패:', error);
      alert('게시글 저장에 실패했습니다.');
    }
  };

  const handleCancel = () => {
    const hasContent = title.trim() || (quillRef.current && quillRef.current.root.innerHTML.trim());
    if (hasContent) {
      if (window.confirm('작성 중인 내용이 저장되지 않습니다. 정말 나가시겠습니까?')) {
        navigate(`/board/${boardType}`);
      }
    } else {
      navigate(`/board/${boardType}`);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (

    <div className="board-details-container">
      <h2>{articleId === 'write' ? '새 게시글 작성' : '게시글 수정'}</h2>
      <form onSubmit={handleSubmit} className="edit-form">
        <div className="input-group">
          <label htmlFor="title">제목</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="writer">작성자</label>
          <input
            type="text"
            id="writer"
            value={writer}
            onChange={(e) => setWriter(e.target.value)}
            placeholder="작성자를 입력하세요"
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="editor">내용</label>
          <div
            id="editor"
            style={{
              border: "1px solid #ccc",
              backgroundColor: "white",
              marginBottom: "20px",
              minHeight: "200px", // 최소 높이 설정
              height: "auto",     // 자동 높이 설정
              overflowY: "hidden" // 스크롤바 제거
            }}
          />
        </div>
        <div className="button-group">
          <button type="submit" className="submit-button">
            {articleId === 'write' ? '작성' : '수정'}
          </button>
          <button type="button" className="cancel-button" onClick={handleCancel}>
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

export default BoardDetails;