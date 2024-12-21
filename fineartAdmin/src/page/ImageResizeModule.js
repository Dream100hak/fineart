import Quill from 'quill';

const DefaultOptions = {
  modules: ['DisplaySize', 'Resize', 'Toolbar'],
  overlayStyles: {
    position: 'absolute',
    boxSizing: 'border-box',
    border: '3px solid #000000',  // 2px 굵기의 빨간색 실선
  },
  handleStyles: {
    position: 'absolute',
    height: '18px',
    width: '18px',
    backgroundColor: 'white',
    border: '3px solid black',
    borderRadius: '50%',
    boxSizing: 'border-box',
    cursor: 'pointer'
  },
  displaySize: true,
  displayStyles: {
    position: 'absolute',
    padding: '4px 8px',
    backgroundColor: 'white',
    border: '1px solid #777',
    color: '#333',
    fontSize: '12px',
    boxSizing: 'border-box'
  }
};

export class ImageResize {
  constructor(quill, options = {}) {
    this.quill = quill;
    this.options = { ...DefaultOptions, ...options };
    this.modules = [];

    this.quill.root.addEventListener('click', this.handleClick.bind(this), false);
    this.quill.root.addEventListener('scroll', this.handleScroll.bind(this), false);

    // 모듈 초기화
    this.options.modules.forEach((moduleName) => {
      this.addModule(moduleName);
    });
  }

  addModule(moduleName) {
    let moduleClass = ImageResize[moduleName];
    if (moduleClass) {
      this.modules.push(new moduleClass(this));
    }
  }

  handleClick(evt) {
    if (evt.target && evt.target.tagName === 'IMG') {
      if (this.img === evt.target) {
        return;
      }
      if (this.img) {
        this.hide();
      }
      this.show(evt.target);
    } else if (this.img) {
      this.hide();
    }
  }

  handleScroll() {
    if (this.img) {
      this.update();
    }
  }

  show(img) {
    this.img = img;
    this.showOverlay();
    this.initializeModules();
  }

  showOverlay() {
    if (this.overlay) {
      this.hideOverlay();
    }

    this.overlay = document.createElement('div');
    Object.assign(this.overlay.style, this.options.overlayStyles);

    this.quill.root.parentNode.appendChild(this.overlay);
    this.update();
  }

  hideOverlay() {
    if (!this.overlay) {
      return;
    }

    if (this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    this.overlay = undefined;
  }

  update() {
    if (!this.img) {
      return;
    }

    const parent = this.quill.root.parentNode;
    const imgRect = this.img.getBoundingClientRect();
    const containerRect = parent.getBoundingClientRect();

    Object.assign(this.overlay.style, {
      left: `${imgRect.left - containerRect.left - 1 + parent.scrollLeft}px`,
      top: `${imgRect.top - containerRect.top + parent.scrollTop}px`,
      width: `${imgRect.width}px`,
      height: `${imgRect.height}px`
    });
  }

  hide() {
    this.hideOverlay();
    this.img = undefined;
    this.modules.forEach(module => {
      if (module.onHide) {
        module.onHide();
      }
    });
  }

  initializeModules() {
    this.modules.forEach(module => {
      if (module.onShow) {
        module.onShow();
      }
    });
  }
}

// Display Size Module
ImageResize.DisplaySize = class DisplaySizeModule {
  constructor(resizer) {
    this.resizer = resizer;
  }

  onShow() {
    if (!this.resizer.options.displaySize) {
      return;
    }
    this.display = document.createElement('div');
    Object.assign(this.display.style, this.resizer.options.displayStyles);
    this.resizer.overlay.appendChild(this.display);
    this.update();
  }

  onHide() {
    if (this.display) {
      this.display.parentNode?.removeChild(this.display);
      this.display = undefined;
    }
  }

  update() {
    if (!this.display || !this.resizer.img) {
      return;
    }
    const size = this.getCurrentSize();
    this.display.innerHTML = size.join(' &times; ');
    const width = this.display.getBoundingClientRect().width;
    const height = this.display.getBoundingClientRect().height;
    const imgRect = this.resizer.img.getBoundingClientRect();

    Object.assign(this.display.style, {
      left: `${imgRect.width / 2 - width / 2}px`,
      top: `${-height - 4}px`
    });
  }

  getCurrentSize() {
    return [
      Math.round(this.resizer.img.width),
      Math.round(this.resizer.img.height)
    ];
  }
};

// Resize Handle Module
ImageResize.Resize = class ResizeModule {
  constructor(resizer) {
    this.resizer = resizer;
    this.handles = [];
    this.positions = ['nw', 'ne', 'se', 'sw'];
  }

  onShow() {
    this.createHandles();
  }

  onHide() {
    this.removeHandles();
  }

  createHandles() {
    this.removeHandles();

    this.positions.forEach((position) => {
      const handle = document.createElement('div');
      Object.assign(handle.style, this.resizer.options.handleStyles);
      handle.style.cursor = `${position}-resize`;

      switch (position) {
        case 'nw':
          handle.style.left = '-6px';
          handle.style.top = '-6px';
          break;
        case 'ne':
          handle.style.right = '-6px';
          handle.style.top = '-6px';
          break;
        case 'se':
          handle.style.right = '-6px';
          handle.style.bottom = '-6px';
          break;
        case 'sw':
          handle.style.left = '-6px';
          handle.style.bottom = '-6px';
          break;
      }

      handle.addEventListener('mousedown', this.handleMousedown.bind(this, position), false);
      this.resizer.overlay.appendChild(handle);
      this.handles.push(handle);
    });
  }

  removeHandles() {
    this.handles.forEach(handle => {
      handle.parentNode?.removeChild(handle);
    });
    this.handles = [];
  }

  handleMousedown(position, evt) {
    evt.preventDefault();
    evt.stopPropagation();

    const img = this.resizer.img;
    const startX = evt.clientX;
    const startY = evt.clientY;
    const startWidth = img.width;
    const startHeight = img.height;
    const aspectRatio = startWidth / startHeight;

    // 이미지 프리뷰 생성
    const previewImg = document.createElement('img');
    previewImg.src = img.src;
    Object.assign(previewImg.style, {
      position: 'absolute',
      width: `${startWidth}px`,
      height: `${startHeight}px`,
      opacity: '0.5',
      border: '2px solid #0066cc',
      boxSizing: 'border-box',
      pointerEvents: 'none',
      zIndex: '1000'
    });

    // 프리뷰 이미지 위치 초기화
    const imgRect = img.getBoundingClientRect();
    const parentRect = this.resizer.quill.root.parentNode.getBoundingClientRect();
    previewImg.style.left = `${imgRect.left - parentRect.left}px`;
    previewImg.style.top = `${imgRect.top - parentRect.top}px`;

    // 원본 이미지는 그대로 유지
    img.style.opacity = '1';

    this.resizer.quill.root.parentNode.appendChild(previewImg);

    const mouseMoveHandler = (moveEvt) => {
      moveEvt.preventDefault();

      const deltaX = moveEvt.clientX - startX;
      const deltaY = moveEvt.clientY - startY;
      let newWidth, newHeight;

      // 드래그 방향에 따라 자유롭게 크기 조절
      switch (position) {
        case 'nw':
          newWidth = Math.max(30, startWidth - deltaX);
          newHeight = Math.max(30, startHeight - deltaY);
          previewImg.style.left = `${imgRect.left - parentRect.left + deltaX}px`;
          previewImg.style.top = `${imgRect.top - parentRect.top + deltaY}px`;
          break;
        case 'ne':
          newWidth = Math.max(30, startWidth + deltaX);
          newHeight = Math.max(30, startHeight - deltaY);
          previewImg.style.top = `${imgRect.top - parentRect.top + deltaY}px`;
          break;
        case 'sw':
          newWidth = Math.max(30, startWidth - deltaX);
          newHeight = Math.max(30, startHeight + deltaY);
          previewImg.style.left = `${imgRect.left - parentRect.left + deltaX}px`;
          break;
        case 'se':
          newWidth = Math.max(30, startWidth + deltaX);
          newHeight = Math.max(30, startHeight + deltaY);
          break;
      }

      // 프리뷰 이미지 크기 업데이트
      previewImg.style.width = `${newWidth}px`;
      previewImg.style.height = `${newHeight}px`;

      // DisplaySize 모듈 업데이트
      const displaySizeModule = this.resizer.modules.find(m => m instanceof ImageResize.DisplaySize);
      if (displaySizeModule && displaySizeModule.display) {
        displaySizeModule.display.innerHTML = `${Math.round(newWidth)} × ${Math.round(newHeight)}`;
      }
    };

    const mouseUpHandler = () => {
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);

      // 프리뷰 이미지의 최종 크기 가져오기
      const finalWidth = parseFloat(previewImg.style.width);
      const finalHeight = parseFloat(previewImg.style.height);

      // 가로세로 비율을 유지하면서 크기 조정
      let adjustedWidth = finalWidth;
      let adjustedHeight = finalWidth / aspectRatio;

      // 조정된 높이가 최종 높이보다 크면 높이 기준으로 다시 계산
      if (adjustedHeight > finalHeight) {
        adjustedHeight = finalHeight;
        adjustedWidth = finalHeight * aspectRatio;
      }

      // 원본 이미지에 최종 크기 적용
      img.style.width = `${adjustedWidth}px`;
      img.style.height = `${adjustedHeight}px`;
      img.style.opacity = '1';

      // 프리뷰 이미지 제거
      previewImg.remove();

      // 오버레이와 핸들 위치 업데이트
      this.resizer.update();
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  }
};

// Toolbar Module
ImageResize.Toolbar = class ToolbarModule {
  constructor(resizer) {
    this.resizer = resizer;
    this.toolbar = undefined;
    this.alignments = ['left', 'center', 'right'];
  }

  onShow() {
    this.toolbar = document.createElement('div');
    this.toolbar.classList.add('image-toolbar');
    Object.assign(this.toolbar.style, {
      position: 'absolute',
      top: '-32px',
      left: '50%',
      transform: 'translateX(-50%)',
      height: '32px',
      width: 'auto',
      minWidth: '120px',
      maxWidth: '200px',  // 툴바의 최대 너비 제한
      backgroundColor: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '4px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '5px',
      padding: '0 8px',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
      zIndex: '1000'
    });

    // 정렬 버튼 추가
    this.alignments.forEach(alignment => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.align = alignment;
      Object.assign(button.style, {
        border: 'none',
        background: 'transparent',
        padding: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '28px',  // 버튼 너비 고정
        height: '28px'  // 버튼 높이 고정
      });

      button.innerHTML = this.getAlignmentIcon(alignment);
      button.addEventListener('click', () => {
        this.setAlignment(alignment);
      });

      this.toolbar.appendChild(button);
    });

    this.resizer.overlay.appendChild(this.toolbar);
  }

  onHide() {
    if (this.toolbar) {
      this.toolbar.parentNode?.removeChild(this.toolbar);
      this.toolbar = undefined;
    }
  }

  getAlignmentIcon(alignment) {
    const icons = {
      left: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="12" x2="15" y2="12"></line>
        <line x1="3" y1="18" x2="18" y2="18"></line>
      </svg>`,
      center: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="6" y1="12" x2="18" y2="12"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>`,
      right: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="9" y1="12" x2="21" y2="12"></line>
        <line x1="6" y1="18" x2="21" y2="18"></line>
      </svg>`
    };
    return icons[alignment];
  }

  setAlignment(alignment) {
    const img = this.resizer.img;
    const quill = this.resizer.quill;

    // 현재 선택된 이미지의 index 찾기
    let index = 0;
    const nodes = quill.root.childNodes;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.querySelector && node.querySelector(`img[src="${img.src}"]`)) {
        index = quill.getIndex(Quill.find(node));
        break;
      }
    }

    // 정렬 적용
    quill.setSelection(index, 1, 'silent');
    // 왼쪽 정렬의 경우 null을 사용하여 기본 정렬로 되돌림
    quill.format('align', alignment === 'left' ? null : alignment, 'user');

    // 선택 해제
    quill.setSelection(null);

    // 오버레이 위치 업데이트
    setTimeout(() => {
      this.resizer.update();
    }, 0);
  }
};

Quill.register('modules/imageResize', ImageResize);

export default ImageResize;