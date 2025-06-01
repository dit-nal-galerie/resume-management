// components/CompanySelectModal.tsx
import React from 'react';

import { Company } from '../../../../interfaces/Company';
import Modal from 'components/ui/Modal';
interface CompanySelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  onSelect: (comp: Company) => void;
}

const CompanySelectModal: React.FC<CompanySelectModalProps> = ({
  isOpen,
  onClose,
  companies,
  onSelect,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Firma auswählen">
    <ul className="max-h-64 overflow-auto space-y-2">
      {companies.map(c => (
        <li key={c.companyId} className="flex justify-between items-center p-2 border-b">
          <span>{c.name} ({c.city})</span>
          <button
            className="text-blue-600 hover:underline"
            onClick={() => onSelect(c)}
          >
            Wählen
          </button>
        </li>
      ))}
    </ul>
  </Modal>
);

export default CompanySelectModal;
