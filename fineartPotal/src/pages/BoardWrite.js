// BoardWrite.js
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/Global/BoardWrite.css';
import { auth } from '../firebase/firebaseConfig';

import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// 커스텀 이미지 리사이즈 모듈 불러오기
import './CustomImageResize';

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

function BoardWrite() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nickname, setNickname] = useState('');
  const [currentVideoFile, setCurrentVideoFile] = useState(null);
  const [currentVideoURL, setCurrentVideoURL] = useState('');
  const [thumbnails, setThumbnails] = useState([]);
  const [showThumbnailModal, setShowThumbnailModal] = useState(false);
  const [selectedThumbnail, setSelectedThumbnail] = useState(null);

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

  const fetchNickname = async (email) => {
    try {
      const response = await fetch(`/api/users/user/${email}`);
      if (response.ok) {
        const data = await response.json();
        setNickname(data.name);
      } else {
        throw new Error('닉네임을 불러오는 데 실패했습니다.');
      }
    } catch (error) {
      console.error('닉네임 불러오기 실패:', error);
      alert('닉네임을 불러오는 중 문제가 발생했습니다.');
    }
  };

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      fetchNickname(currentUser.email);
    }
  }, []);

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

  // 동영상 핸들러 (수정됨)
  const videoHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'video/*');
    input.click();

    input.onchange = () => {
      const file = input.files[0];
      if (file) {
        console.log('동영상 파일 선택됨:', file); // 파일 선택 확인용 콘솔 출력
        setCurrentVideoFile(file);
        const videoURL = URL.createObjectURL(file);
        setCurrentVideoURL(videoURL);
        generateThumbnails(videoURL); // 썸네일 생성 함수 호출
        setShowThumbnailModal(true); // 썸네일 선택 모달 표시
      }
    };
  };

  // 썸네일 생성 함수
  const generateThumbnails = (videoURL) => {
    const video = document.createElement('video');
    video.src = videoURL;
    video.crossOrigin = 'anonymous';

    video.addEventListener('loadedmetadata', () => {
      const duration = video.duration;
      const interval = duration / 6;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const tempThumbnails = [];

      const captureFrame = (time) => {
        return new Promise((resolve) => {
          video.currentTime = time;
          video.addEventListener(
            'seeked',
            () => {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const dataURL = canvas.toDataURL('image/png');
              tempThumbnails.push(dataURL);
              resolve();
            },
            { once: true }
          );
        });
      };

      const captureAllFrames = async () => {
        for (let i = 1; i <= 6; i++) {
          const time = interval * i - interval / 2;
          await captureFrame(time);
        }
        setThumbnails(tempThumbnails);
      };

      captureAllFrames();
    });
  };

  // 썸네일을 Blob으로 변환하는 함수
  const dataURLtoBlob = (dataurl) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  // 썸네일 선택 후 동영상 업로드 및 에디터 삽입
  const handleThumbnailSelect = async () => {
    if (!selectedThumbnail || !currentVideoFile) {
      alert('썸네일을 선택해주세요.');
      return;
    }

    try {
      // 선택된 썸네일을 Blob으로 변환
      const thumbnailBlob = dataURLtoBlob(selectedThumbnail);
      const thumbnailFile = new File([thumbnailBlob], 'thumbnail.png', { type: thumbnailBlob.type });

      // 썸네일 업로드
      const thumbnailFormData = new FormData();
      thumbnailFormData.append('image', thumbnailFile);

      const thumbnailRes = await fetch(`/api/board/${boardType}/upload/image`, {
        method: 'POST',
        body: thumbnailFormData,
      });

      if (!thumbnailRes.ok) {
        throw new Error('썸네일 업로드 실패');
      }

      const thumbnailData = await thumbnailRes.json();
      const thumbnailUrl = thumbnailData.url; // 서버에서 반환한 썸네일 URL

      // 동영상 파일 업로드
      const videoFormData = new FormData();
      videoFormData.append('video', currentVideoFile);

      const videoRes = await fetch(`/api/board/${boardType}/upload/video`, {
        method: 'POST',
        body: videoFormData,
      });

      if (!videoRes.ok) {
        throw new Error('동영상 업로드 실패');
      }

      const videoData = await videoRes.json();
      const videoUrl = videoData.url; // 서버에서 반환한 동영상 URL

      // 에디터에 CustomVideoBlot 삽입
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection(true);
      editor.insertEmbed(range.index, 'customVideo', {
        thumbnailUrl: thumbnailUrl, // Base64 대신 업로드된 썸네일 URL 사용
        videoUrl: videoUrl,
      });
      editor.setSelection(range.index + 1);

      // 상태 초기화 및 모달 닫기
      setCurrentVideoFile(null);
      setCurrentVideoURL('');
      setThumbnails([]);
      setShowThumbnailModal(false);
      setSelectedThumbnail(null);
    } catch (error) {
      console.error('동영상 업로드 실패:', error);
      alert('동영상 업로드 중 문제가 발생했습니다.');
    }
  };

  // 동영상 업로드 취소 시 상태 초기화 및 모달 닫기
  const handleCancelUpload = () => {
    setCurrentVideoFile(null);
    setCurrentVideoURL('');
    setThumbnails([]);
    setShowThumbnailModal(false);
    setSelectedThumbnail(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/board/${boardType}/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          writer: nickname,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert('게시글이 성공적으로 작성되었습니다.');
        navigate(`/${boardType}/article/${data.postId}`);
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

  // Quill 에디터 모듈 설정
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
          video: videoHandler, // 동영상 핸들러 연결
        },
      },
      imageResize: {
        handleStyles: {
          backgroundColor: 'white',
          border: '2px solid black',
          borderRadius: '50%',
        },
        displayStyles: {
          backgroundColor: 'black',
          color: 'white',
        },
        toolbarButtonStyles: {
          backgroundColor: '#ffffff',
          border: '1px solid #ccc',
          borderRadius: '50%',
          padding: '5px',
        },
        toolbarButtonSvgStyles: {
          fill: '#000000',
          stroke: '#000000',
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
    'size',
  ];

  return (
    <div className="boardwrite-container">
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

      {/* 썸네일 선택 모달 */}
      {showThumbnailModal && (
        <div className="thumbnail-modal">
          <div className="modal-content">
            <h2>썸네일을 선택하세요</h2>
            <div className="thumbnail-grid">
              {thumbnails.map((thumb, index) => (
                <img
                  key={index}
                  src={thumb}
                  alt={`Thumbnail ${index + 1}`}
                  className={`thumbnail-image ${selectedThumbnail === thumb ? 'selected' : ''}`}
                  onClick={() => setSelectedThumbnail(thumb)}
                />
              ))}
            </div>
            <div className="modal-buttons">
              <button
                type="button"
                onClick={handleThumbnailSelect}
                disabled={!selectedThumbnail}
                style={{ marginRight: '10px', backgroundColor: selectedThumbnail ? '#1abc9c' : '#95a5a6' }}
              >
                선택 완료
              </button>
              <button type="button" onClick={handleCancelUpload}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BoardWrite;
