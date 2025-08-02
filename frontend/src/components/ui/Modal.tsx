import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-96 rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold">{title}</h2>
        <div>{children}</div>
        <div className="mt-4 text-right">
          <button
            className="rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-700"
            onClick={onClose}
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
