// components/ContactSection.tsx
import React, { useEffect, useState } from 'react';
import { Anrede, Contact } from '../../../../interfaces/Contact';
import { getAnrede } from '../../services/api';

interface ContactSectionProps {
  title: string;
  contact: Contact | null;
  companyId?: number;
  onEdit: () => void;
  onSelect: () => void;
  onRemove: () => void;
  onCreate: () => void;
}

const ContactSection: React.FC<ContactSectionProps> = ({
  title,
  contact,
  companyId,
  onEdit,
  onSelect,
  onRemove,
  onCreate,
}) => {

  const [anredenMap, setAnredenMap] = useState<[Anrede]>(); // Initialisiere mit leerem Objekt
const [anredenListe, setAnredenListe] = useState<Anrede[]>([]);
  const [isLoadingAnreden, setIsLoadingAnreden] = useState<boolean>(true); // Ladezustand hinzugefügt
useEffect(() => {
  const fetchAnreden = async () => {
    setIsLoadingAnreden(true); // Beginne mit dem Laden
    try {
      // Holt das Anrede[] Array direkt
      const result = await getAnrede();
      setAnredenListe(result); // Speichere das Array im State
    } catch (error) {
      console.error('Fehler beim Laden der Anreden:', error);
      setAnredenListe([]); // Bei Fehler leeres Array setzen
    } finally {
        setIsLoadingAnreden(false); // Ladevorgang beendet (erfolgreich oder nicht)
    }
  };
  fetchAnreden();
}, []); // Leeres Abhängigkeitsarray, läuft nur einmal beim Mounten
  const exists = contact !== null && contact?.name !== null && contact?.contactid !== undefined;
  const newContact = contact === null || contact?.name === null && contact?.contactid === undefined;
  const canSelect = companyId !== undefined;
  console.log('ContactSection props:', { title, name: contact?.name, contactId: contact?.contactid, companyId, exists, newContact, canSelect });
  // const name = contact?.name !== undefined ? contact?.name + ' ' + contact?.vorname : 'Nicht angegeben';
  
  const formatName = (kontakt: Contact|null, anreden: Anrede[]): string => {
    // Finde das Anrede-Objekt im Array, dessen 'id' mit 'kontakt.anrede' übereinstimmt
    if(!kontakt) return ''; // Rückgabe leerer String, wenn kein Kontakt vorhanden ist
    const gefundeneAnrede = anreden.find(a => a.id === kontakt.anrede);

    // Extrahiere den 'text' aus dem gefundenen Objekt, oder nutze '' als Fallback
    const anredeText = gefundeneAnrede ? gefundeneAnrede.text : '';

    const teile = [
      anredeText,
      kontakt.title,     // undefined, wenn nicht vorhanden
      kontakt.vorname,
      kontakt.zusatzname, // undefined, wenn nicht vorhanden
      kontakt.name
    ];

    // Filtere leere/undefined Teile heraus und verbinde den Rest mit Leerzeichen
    return teile.filter(teil => teil).join(' ');
  };
  if (isLoadingAnreden) {
    return <div>Lade Kontaktdaten...</div>;
  }
  return (
    <div className="mb-4 p-4 bg-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-gray-700"> {formatName(contact, anredenListe)}</p>
      <div className="flex space-x-2 mt-2">
        {exists ? (
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-2 rounded-md"
            onClick={onEdit}
          >
            Bearbeiten
          </button>
        ) : newContact && companyId !== undefined && companyId === 0 ? (
          <button
            className="bg-yellow-500 hover:bg-yellow-700 text-white px-3 py-2 rounded-md"
            onClick={onCreate}
          >
            Neu erstellen
          </button>
        ) : <></>}

        {canSelect && (
          <button
            className="bg-green-500 hover:bg-green-700 text-white px-3 py-2 rounded-md"
            onClick={onSelect}
          >
            Auswahl
          </button>
        )}

        {exists && (
          <button
            className="bg-red-500 hover:bg-red-700 text-white px-3 py-2 rounded-md"
            onClick={onRemove}
          >
            Entfernen
          </button>
        )}
      </div>
    </div>

  );
};

export default ContactSection;

