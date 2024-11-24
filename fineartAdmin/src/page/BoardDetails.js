import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import './BoardDetails.css';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ImageResize from 'quill-image-resize';

// Quill에 폰트 사이즈 등록
const Size = Quill.import('attributors/class/size');
Size.whitelist = ['8px', '10px', '12px', '14px', '18px', '24px', '36px', '72px'];
Quill.register(Size, true);

Quill.register('modules/imageResize', ImageResize);

// 커스텀 비디오 블롯 정의 및 등록
const BlockEmbed = Quill.import('blots/block/embed');

class CustomVideoBlot extends BlockEmbed {
  static create(value) {
    const node = super.create();
    node.setAttribute('class', 'custom-video-blot'); // 고유한 클래스명 설정
    const container = document.createElement('div');
    container.setAttribute('class', 'video-container');

    const img = document.createElement('img');
    img.setAttribute('src', value.thumbnailUrl || '');
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
    if (!container) {
      console.error('CustomVideoBlot: container not found');
      return {};
    }
    const thumbnail = container.querySelector('.video-thumbnail');
    return {
      thumbnailUrl: thumbnail ? thumbnail.getAttribute('src') : '',
      videoUrl: container.getAttribute('data-video-url') || '',
    };
  }
}

CustomVideoBlot.blotName = 'customVideo';
CustomVideoBlot.tagName = 'div'; // 표준 태그 사용
CustomVideoBlot.className = 'custom-video-blot'; // 고유한 클래스명 설정
Quill.register(CustomVideoBlot);

// 이미지 리사이즈 후 서버로 업로드하는 함수
const useImageResizeUpload = (quillRef, boardType) => {
  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();

      const handleImageResize = (mutationsList) => {
        for (const mutation of mutationsList) {
          if (
            mutation.type === 'attributes' &&
            mutation.target.tagName === 'IMG' &&
            (mutation.attributeName === 'width' || mutation.attributeName === 'height')
          ) {
            const img = mutation.target;

            (async () => {
              try {
                const newWidth = img.getAttribute('width');
                const newHeight = img.getAttribute('height');

                // Quill에서 이미지의 위치(index)를 찾습니다.
                const range = editor.getSelection();
                const [blot] = editor.getLeaf(range ? range.index : 0);

                if (blot && blot.domNode === img) {
                  // Quill의 포맷을 사용하여 이미지 속성을 업데이트합니다.
                  editor.format('width', newWidth);
                  editor.format('height', newHeight);
                }

                // 이미지 업로드 로직은 필요 없다면 생략 가능합니다.
              } catch (error) {
                console.error('이미지 업데이트 실패:', error);
              }
            })();
          }
        }
      };

      const observer = new MutationObserver(handleImageResize);
      observer.observe(editor.root, {
        attributes: true,
        subtree: true,
        attributeFilter: ['width', 'height'],
      });

      return () => {
        observer.disconnect();
      };
    }
  }, [quillRef, boardType]);
};

function BoardDetail() {
  const { articleId } = useParams(); // 수정할 게시글 ID 가져오기
  const [title, setTitle] = useState('');
  const [writer, setWriter] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(articleId !== 'write'); // 새 글 작성 모드일 때는 로딩 false
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
        container:
          [
            [{ 'font': [] }],
            [{ 'size': ['8px', '10px', '12px', '14px', '18px', '24px', '36px', '72px'] }],
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

                  const editor = quillRef.current.getEditor();
                  const range = editor.getSelection(true);

                  // 이미지 삽입 시에도 커스텀 이미지 블롯을 사용하도록 수정
                  editor.insertEmbed(range.index, 'image', {
                    src: imageUrl,
                    width: 'auto',  // 기본값 설정
                    height: 'auto', // 기본값 설정
                  });
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

            input.onchange = async () => {
              const file = input.files[0];
              if (file) {
                try {
                  // 서버에 동영상 파일 업로드
                  const formData = new FormData();
                  formData.append('video', file);

                  // 동영상 업로드 API 호출
                  const res = await fetch(`/api/board/${boardType}/upload/video`, {
                    method: 'POST',
                    body: formData,
                  });

                  if (!res.ok) {
                    throw new Error('동영상 업로드 실패');
                  }

                  const data = await res.json();
                  const videoURL = data.url;

                  const editor = quillRef.current.getEditor();
                  const range = editor.getSelection(true);
                  editor.insertEmbed(range.index, 'customVideo', {
                    thumbnailUrl: '',
                    videoUrl: videoURL,
                  });
                  editor.setSelection(range.index + 1);
                } catch (error) {
                  console.error('동영상 업로드 실패:', error);
                  alert('동영상 업로드 중 문제가 발생했습니다.');
                }
              } else {
                alert('동영상을 선택해 주세요.');
              }
            };
          },
        },
      },
      imageResize: {}, // 이미지 리사이즈 모듈 추가
    };
  }, [boardType]);

  useImageResizeUpload(quillRef, boardType);

  useEffect(() => {
    if (articleId && articleId !== 'write') {
      const fetchArticle = async () => {
        try {
          const response = await fetch(`/api/board/${boardType}/articles/${articleId}`);
          if (!response.ok) throw new Error('게시글을 불러오는 데 실패했습니다.');

          const data = await response.json();
          setTitle(data.title);
          setContent(data.content);
          setWriter(data.writer);
        } catch (error) {
          console.error('게시글 불러오기 실패:', error);
          alert('게시글을 불러오는 중 문제가 발생했습니다.');
        } finally {
          setLoading(false);
        }
      };
      fetchArticle();
    }
  }, [articleId, boardType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = articleId && articleId !== 'write' 
        ? `/api/board/${boardType}/articles/${articleId}`
        : `/api/board/${boardType}/articles`;
      const method = articleId && articleId !== 'write' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          writer,
        }),
      });

      if (!response.ok) {
        throw new Error(articleId && articleId !== 'write' ? '게시글 수정 실패' : '게시글 작성 실패');
      }

      alert(articleId && articleId !== 'write' ? '게시글이 성공적으로 수정되었습니다.' : '게시글이 성공적으로 작성되었습니다.');
      navigate(`/board/${boardType}`);
    } catch (error) {
      console.error(articleId && articleId !== 'write' ? '게시글 수정 실패:' : '게시글 작성 실패:', error);
      alert(articleId && articleId !== 'write' ? '게시글 수정 중 문제가 발생했습니다.' : '게시글 작성 중 문제가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }


  const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'color',
    'background',
    'list',
    'bullet',
    'align',
    'link',
    'image',
    'video',
    'customVideo',
    'width',
    'height',
  ];


  return (
    <div className="board-write-container">
      <h2>{articleId && articleId !== 'write' ? '게시글 수정' : '새 글 작성'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="작성자를 입력하세요"
          value={writer}
          onChange={(e) => setWriter(e.target.value)}
          required
        />
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={content}
          onChange={setContent}
          modules={modules}
          placeholder="내용을 입력하세요"
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (articleId && articleId !== 'write' ? '수정 중...' : '작성 중...') : (articleId && articleId !== 'write' ? '수정' : '작성')}
        </button>
      </form>
    </div>
  );
}

export default BoardDetail;
