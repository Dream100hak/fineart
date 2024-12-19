import Quill from 'quill';

class ImageModule {
  constructor(quill, options = {}) {
    this.quill = quill;
    this.options = options;
    console.log('ImageModule initialized');  // 여기서 찍히는지 확인
    
    // 이미지 클릭 이벤트를 직접 추가
    this.quill.root.addEventListener('click', (e) => {
      if (e.target && e.target.tagName === 'IMG') {
        console.log('Image clicked!', e.target);  // 이미지 클릭시 찍히는지 확인
        this.handleImageClick(e);
      }
    });
  }

  handleImageClick(event) {
    console.log('handleImageClick called');  // 여기까지 오는지 확인
    const img = event.target;
    
    // 테스트를 위해 간단한 스타일 변경
    img.style.border = '2px solid red';
  }
}

Quill.register('modules/imageModule', ImageModule);

export default ImageModule;