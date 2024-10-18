// CustomImageResize.js
import ImageResize from 'quill-image-resize-module2';
import Quill from 'quill';

class CustomImageResize extends ImageResize {
  constructor(quill, options) {
    super(quill, options);
    // super 호출 후 this.container이 제대로 설정되었는지 확인
    if (this.container) {
      this.addAlignmentButtons();
    } else {
      console.error('ImageResize container is undefined.');
    }
  }

  addAlignmentButtons() {
    // this.container이 정의되었는지 다시 확인
    if (!this.container) {
      console.error('Cannot append alignment toolbar because container is undefined.');
      return;
    }

    const toolbar = document.createElement('div');
    toolbar.classList.add('image-resize-alignment-toolbar');

    const alignments = ['left', 'center', 'right'];

    alignments.forEach((alignment) => {
      const button = document.createElement('button');
      button.innerHTML = alignment.charAt(0).toUpperCase() + alignment.slice(1); // 예: Left, Center, Right
      button.onclick = () => this.applyAlignment(alignment);
      button.setAttribute('data-alignment', alignment);
      toolbar.appendChild(button);
    });

    this.container.appendChild(toolbar);
  }

  applyAlignment(alignment) {
    const quill = this.quill;
    const range = quill.getSelection();
    if (range) {
      quill.format('align', alignment);
      this.updateActiveButton(alignment);
    }
  }

  updateActiveButton(alignment) {
    const buttons = this.container.querySelectorAll('.image-resize-alignment-toolbar button');
    buttons.forEach((btn) => {
      if (btn.getAttribute('data-alignment') === alignment) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
}

// Quill에 커스텀 이미지 리사이즈 모듈 등록
Quill.register('modules/imageResize', CustomImageResize);
