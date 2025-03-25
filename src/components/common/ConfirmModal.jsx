import React, { useEffect } from 'react';
import '../../scss/components/_confirm-modal.scss';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = '확인', 
  message, 
  confirmText = '확인', 
  cancelText = '취소',
  type = 'info' // 'info', 'warning', 'error', 'success'
}) => {
  // 모달이 열리면 배경 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);
  
  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  // 모달 내부 클릭 시 이벤트 버블링 방지
  const handleModalClick = (e) => {
    e.stopPropagation();
  };
  
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`modal-container ${type}`} onClick={handleModalClick}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="modal-icon">
            {type === 'info' && <i className="fa fa-info-circle"></i>}
            {type === 'warning' && <i className="fa fa-exclamation-triangle"></i>}
            {type === 'error' && <i className="fa fa-times-circle"></i>}
            {type === 'success' && <i className="fa fa-check-circle"></i>}
          </div>
          <p className="modal-message">{message}</p>
        </div>
        
        <div className="modal-footer">
          {onConfirm && (
            <button 
              className="confirm-button" 
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmText}
            </button>
          )}
          <button className="cancel-button" onClick={onClose}>
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal; 