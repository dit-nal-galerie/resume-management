import React, { useState, useEffect } from 'react';
import { getAnrede } from '../../services/api'; 
import { Contact } from '../../../../interfaces/Contact';

interface Anrede {
  id: number;
  text: string;
}


interface ContactFormModalProps {
  isOpen: boolean;
  contact: Contact;
  onSave: (contact: Contact) => void;
  onClose: () => void;
}

const ContactFormModal: React.FC<ContactFormModalProps> = ({ isOpen, contact, onSave, onClose }) => {
 
  const [contactData, setContactData] = useState<Contact>(contact);
     const handleChange1 = (field: keyof Contact, value: string | boolean) => {
      setContactData(prev => ({ ...prev, [field]: value }));
     };


  const [anreden, setAnreden] = useState<Anrede[]>([]);

  // Laden der Anrede-Optionen beim Mount
  useEffect(() => {
    const fetchAnreden = async () => {
      try {
        const result = await getAnrede();
        setAnreden(result);
      } catch (error) {
        console.error('Fehler beim Laden der Anreden:', error);
      }
    };
    fetchAnreden();
  }, []);

  // Aktualisieren des Zustands, wenn sich der `contact`-Prop ändert
  useEffect(() => {
    if (isOpen) {
      setContactData(contact);
    }
  }, [isOpen, contact]);

  // Allgemeiner Change-Handler für Text-Inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactData(prev => ({ ...prev, [name]: value }));
    
  
  };
  const handleClose = () => {
    setContactData(contact); // original zurücksetzen
    onClose();
  };

  // Speichern der Daten (aufgerufen beim Klick auf "Speichern")
  const handleSave = () => {
    onSave(contactData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
        <h2 className="text-xl font-semibold mb-4">Kontakt bearbeiten</h2>
        <form className="space-y-4">
        {/* Formularfelder */}
        <div className="grid grid-cols-2 gap-4">
          {/* Linke Spalte */}
          <div>
            <div className="mb-4">
              <label className="block text-sm">Anrede</label>
              <select
                name="anrede"
                value={contactData.anrede ?? '0'}
                onChange={(e) =>
                  setContactData(prev => ({ ...prev, anrede: e.target.value ? Number(e.target.value) : 0 }))
                }
                className="w-full px-3 py-2 border rounded-lg"
              >
                {anreden.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.text || '-- Bitte wählen --'}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm">Titel</label>
              <input
                title="Titel"
                placeholder="Titel eingeben"
                type="text"
                name="title"
                value={contactData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm">Vorname</label>
              <input
                type="text"
                name="vorname"
                value={contactData.vorname}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
                title="Vorname"
                placeholder="Vorname eingeben"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm">Zusatzname</label>
              <input
                type="text"
                name="zusatzname"
                value={contactData.zusatzname}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
                title="Zusatzname"
                placeholder="Zusatzname eingeben"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm">Name</label>
              <input
                type="text"
                name="name"
                value={contactData.name}
                onChange={handleChange}
              
                className="w-full px-3 py-2 border rounded-lg"
                title="Name"
                placeholder="Name eingeben"
                required
              />
            </div>
          </div>
          {/* Rechte Spalte */}
          <div>
            <div className="mb-4">
              <label className="block text-sm">E-Mail</label>
              <input
                title="email"
                type="email"
                name="email"
                value={contactData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm">Telefon</label>
              <input
                type="tel"
                name="phone"
                value={contactData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
                title="Telefonnummer"
                placeholder="Telefonnummer eingeben"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm">Mobil</label>
              <input
                type="tel"
                name="mobile"
                value={contactData.mobile}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
                title="Mobilnummer"
                placeholder="Mobilnummer eingeben"
              />
            </div>
          </div>
        </div>
        {/* Action-Buttons */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg mr-2"
            onClick={handleClose}
          >
            Abbrechen
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            onClick={handleSave}
          >
            Speichern
          </button>
        </div>
        </form>
      </div>
    </div>
  );
};

export default ContactFormModal;


