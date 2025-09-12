import React from 'react';
import '../../../features/tickets/styles/Modal.css';

interface ReusableModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  titleIcon: React.ReactNode;
  children: React.ReactNode;
  footerButtons: React.ReactNode;
}

const ReusableModal: React.FC<ReusableModalProps> = ({ isOpen, onClose, title, titleIcon, children, footerButtons }) => {
  if (!isOpen) return null;

  return (
    <div className="reusable-modal-overlay" onClick={onClose}>
      <div className="reusable-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="reusable-modal-header">
          <div className="reusable-modal-title">
            {titleIcon}
            <span>{title}</span>
          </div>
          <button className="reusable-modal-close" title="Close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.0001 16.6667C6.32508 16.6667 3.33341 13.675 3.33341 10C3.33341 6.32502 6.32508 3.33335 10.0001 3.33335C13.6751 3.33335 16.6667 6.32502 16.6667 10C16.6667 13.675 13.6751 16.6667 10.0001 16.6667ZM10.0001 1.66669C5.39175 1.66669 1.66675 5.39169 1.66675 10C1.66675 14.6084 5.39175 18.3334 10.0001 18.3334C14.6084 18.3334 18.3334 14.6084 18.3334 10C18.3334 5.39169 14.6084 1.66669 10.0001 1.66669ZM12.1584 6.66669L10.0001 8.82502L7.84175 6.66669L6.66675 7.84169L8.82508 10L6.66675 12.1584L7.84175 13.3334L10.0001 11.175L12.1584 13.3334L13.3334 12.1584L11.1751 10L13.3334 7.84169L12.1584 6.66669Z" fill="#FF3B30"></path>
            </svg>
          </button>
        </div>
        <div className="reusable-modal-body">
          {children}
        </div>
        <div className="reusable-modal-footer">
          {footerButtons}
        </div>
      </div>
    </div>
  );
};

export default ReusableModal;
