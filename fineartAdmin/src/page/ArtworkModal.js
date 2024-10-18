// ArtworkModal.js
import React, { useState, useEffect } from 'react';
import './Modal.css';

const ArtworkModal = ({ canvasSizes, newArtwork, onSave, onClose, editingIndex }) => {
    const [artworkData, setArtworkData] = useState({
        name: '',
        price: '',
        isRentable: false,
        image: null,
        category: '인물화',
        description: '',
        canvasType: 'F',
        canvasSize: 1,
        rotationAngle: 0,
    });


    const [selectedCanvasType, setSelectedCanvasType] = useState('F');
    const [selectedCanvasSize, setSelectedCanvasSize] = useState(1);
    const [isImageOverlayOpen, setIsImageOverlayOpen] = useState(false);
    const [overlayImageSrc, setOverlayImageSrc] = useState(null);

    useEffect(() => {
        if (newArtwork) {
            setArtworkData({
                ...newArtwork,
                image: newArtwork.image || null,
                rotationAngle: newArtwork.rotationAngle || 0,
            });
            setSelectedCanvasType(newArtwork.canvasType || 'F');
            setSelectedCanvasSize(newArtwork.canvasSize || 1);
        } else {
            setArtworkData({
                name: '',
                price: '',
                isRentable: false,
                image: null,
                category: '인물화',
                description: '',
                canvasType: 'F',
                canvasSize: 1,
                rotationAngle: 0,
            });
            setSelectedCanvasType('F');
            setSelectedCanvasSize(1);
        }
    }, [newArtwork]);

    const handleRotateImage = () => {
        const newAngle = ((artworkData.rotationAngle || 0) + 90) % 360;
        setArtworkData({ ...artworkData, rotationAngle: newAngle });
    };

    const handleCanvasTypeChange = (type) => {
        setSelectedCanvasType(type);

        const availableSizes = Object.keys(canvasSizes[type]).filter(
            (size) => canvasSizes[type][size] && canvasSizes[type][size].trim() !== ''
        );

        if (availableSizes.length > 0) {
            setSelectedCanvasSize(availableSizes[0]);
        }
        setArtworkData({ ...artworkData, canvasType: type, canvasSize: availableSizes[0] });
    };

    const handleCanvasSizeChange = (e) => {
        const size = e.target.value;
        setSelectedCanvasSize(size);
        setArtworkData({ ...artworkData, canvasSize: size });
    };

    const handleImageOverlay = (image) => {
        if (typeof image === 'string') {
            setOverlayImageSrc(image.startsWith('http') ? image : `${process.env.REACT_APP_API_URL}${image}`);
        } else {
            setOverlayImageSrc(URL.createObjectURL(image));
        }
        setIsImageOverlayOpen(true);
    };

    const handleCloseImageOverlay = () => {
        setIsImageOverlayOpen(false);
        setOverlayImageSrc(null);
    };

    const handleCategorySelect = (category) => {
        setArtworkData({ ...artworkData, category });
    };

    const handleRemoveImage = () => {
        setArtworkData({ ...artworkData, image: null });
    };

    const handleSave = () => {
        if (!artworkData.image) {
            alert('작품 이미지를 등록해주세요.');
            return;
        }
        if (!artworkData.name) {
            alert('작품 이름을 입력해주세요.');
            return;
        }
    
        const dataToSave = {
            ...newArtwork, // 기존 데이터 유지
            ...artworkData, // 수정된 데이터 덮어쓰기
        };
    
        console.log('저장할 데이터:', dataToSave);
        onSave(dataToSave, editingIndex);
    };

    return (
        <div className="modal-overlay">
            <div className="modal large-modal adjusted-modal">
                <h3>{editingIndex !== null ? '작품 수정하기' : '작품 등록하기'}</h3>
                <div className="artwork-upload-container">
                    {artworkData.image ? (
                        <div className="artwork-preview-wrapper">
                            <div className="artwork-preview-container">
                                <img
                                    src={
                                        typeof artworkData.image === 'string'
                                            ? artworkData.image.startsWith('http')
                                                ? artworkData.image
                                                : `${process.env.REACT_APP_API_URL}${artworkData.image}`
                                            : URL.createObjectURL(artworkData.image)
                                    }
                                    alt="Preview"
                                    className="artwork-preview-image"
                                    style={{ transform: `rotate(${artworkData.rotationAngle || 0}deg)` }}
                                />
                            </div>
                            <div className="image-buttons-container">
                                <button className="rotate-btn" onClick={handleRotateImage}>
                                    ↻
                                </button>
                                <button className="zoom-btn" onClick={() => handleImageOverlay(artworkData.image)}>
                                    🔍
                                </button>
                                <button className="image-delete-btn" onClick={handleRemoveImage}>
                                    x
                                </button>
                            </div>
                        </div>
                    ) : (
                        <label className="upload-placeholder" htmlFor="artwork-image-input">
                            <span>+</span>
                            <p>작품을 등록해주세요!!</p>
                        </label>
                    )}
                    <input
                        id="artwork-image-input"
                        type="file"
                        style={{ display: 'none' }}
                        onChange={(e) => setArtworkData({ ...artworkData, image: e.target.files[0] })}
                    />
                </div>

                {artworkData.image && (
                    <div className="artwork-info">
                        {/* 작품 이름 */}
                        <div className="form-row">
                            <label>작품 이름:</label>
                            <input
                                type="text"
                                value={artworkData.name}
                                onChange={(e) => setArtworkData({ ...artworkData, name: e.target.value })}
                                placeholder="작품 이름"
                            />
                        </div>

                        <hr className="divider" />

                        {/* 작품 설명 */}
                        <div className="form-row">
                            <label>작품 설명:</label>
                            <textarea
                                value={artworkData.description}
                                onChange={(e) => {
                                    setArtworkData({ ...artworkData, description: e.target.value });
                                    e.target.style.height = 'auto';
                                    e.target.style.height = `${e.target.scrollHeight}px`;
                                }}
                                placeholder="작품에 대한 설명을 입력하세요."
                                rows="4"
                            />
                        </div>

                        <hr className="divider" />

                        {/* 작품 종류 */}
                        <div className="form-row">
                            <label>작품 종류:</label>
                            <div className="category-buttons">
                                {['인물화', '풍경화', '정물화', '동물화', '상상화', '추상화'].map((category) => (
                                    <button
                                        key={category}
                                        className={`category-btn ${artworkData.category === category ? 'selected' : ''
                                            }`}
                                        onClick={() => handleCategorySelect(category)}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <hr className="divider" />

                        {/* 캔버스 종류 및 사이즈 */}
                        <div className="form-row canvas-selection">
                            <label>캔버스 종류 :</label>
                            <div className="canvas-type-container">
                                <button
                                    className={`category-btn ${selectedCanvasType === 'F' ? 'selected' : ''}`}
                                    onClick={() => handleCanvasTypeChange('F')}
                                >
                                    F형
                                </button>
                                <button
                                    className={`category-btn ${selectedCanvasType === 'P' ? 'selected' : ''}`}
                                    onClick={() => handleCanvasTypeChange('P')}
                                >
                                    P형
                                </button>
                                <button
                                    className={`category-btn ${selectedCanvasType === 'M' ? 'selected' : ''}`}
                                    onClick={() => handleCanvasTypeChange('M')}
                                >
                                    M형
                                </button>

                                {/* 구분선 추가 */}
                                <span className="divider">|</span>

                                {/* 호수 선택 드롭다운 */}
                                <select
                                    value={selectedCanvasSize}
                                    onChange={handleCanvasSizeChange}
                                    className="canvas-size-select"
                                >
                                    {Object.keys(canvasSizes[selectedCanvasType]).map((size) => (
                                        <option key={size} value={size}>
                                            {size}호
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* 캔버스 사이즈 표시 */}
                        <div className="form-row">
                            <label>사이즈:</label>
                            <input
                                type="text"
                                value={canvasSizes[selectedCanvasType][selectedCanvasSize] + ' cm'}
                                readOnly
                            />
                        </div>

                        <hr className="divider" />

                        {/* 가격 */}
                        <div className="form-row">
                            <label>가격 (₩):</label>
                            <input
                                type="number"
                                value={artworkData.price}
                                min="0"
                                max="100000000"
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    if (!isNaN(value) && value >= 0 && value <= 100000000) {
                                        setArtworkData({ ...artworkData, price: value });
                                    }
                                }}
                                placeholder="ex) 9999999"
                            />
                        </div>

                        <hr className="divider" />

                        {/* 렌탈 가능 여부 */}
                        <div className="form-row">
                            <label>렌탈 가능 여부:</label>
                            <div className="checkbox-container">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={artworkData.isRentable}
                                        onChange={(e) => setArtworkData({ ...artworkData, isRentable: e.target.checked })}
                                    />
                                    렌탈 가능
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                <div className="modal-buttons">
                    <button className="modal-btn" onClick={handleSave}>
                        {editingIndex !== null ? '저장' : '추가'}
                    </button>
                    <button className="modal-btn cancel-btn" onClick={onClose}>
                        취소
                    </button>
                </div>
            </div>
            {isImageOverlayOpen && (
                <div className="image-overlay">
                    <div className="overlay-content">
                        <img
                            src={overlayImageSrc}
                            alt="Zoomed Artwork"
                            className="overlay-image"
                            style={{ transform: `rotate(${artworkData.rotationAngle || 0}deg)` }}
                        />
                        <button className="close-overlay-btn" onClick={handleCloseImageOverlay}>
                            닫기
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArtworkModal;
