import React from 'react';
import { Contact } from '../../../../interfaces/Contact';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  onSelect: (c: Contact) => void;
};

const ContactSelectModal: React.FC<Props> = ({ isOpen, onClose, contacts, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-lg bg-white p-4 shadow-lg">
        <h3 className="mb-3 text-lg font-semibold">Kontakt auswählen</h3>
        <ul className="max-h-80 overflow-auto">
          {contacts.map((c) => (
            <li
              key={c.contactid}
              className="cursor-pointer rounded-md p-2 hover:bg-gray-100"
              onClick={() => onSelect(c)}
              title={c.email || ''}
            >
              {(c.vorname ? c.vorname + ' ' : '') + (c.name || '(ohne Namen)')}
            </li>
          ))}
          {contacts.length === 0 && <li className="p-2 text-gray-500">Keine Kontakte gefunden</li>}
        </ul>
        <div className="mt-4 flex justify-end">
          <button className="rounded-md bg-gray-500 px-3 py-1 text-white hover:bg-gray-700" onClick={onClose}>
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactSelectModal;