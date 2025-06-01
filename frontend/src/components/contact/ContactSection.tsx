import React, { useEffect, useState } from 'react';
import { Anrede, Contact } from '../../../../interfaces/Contact';
import { getAnrede } from '../../services/api';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [anredenListe, setAnredenListe] = useState<Anrede[]>([]);
  const [isLoadingAnreden, setIsLoadingAnreden] = useState<boolean>(true);

  useEffect(() => {
    const fetchAnreden = async () => {
      setIsLoadingAnreden(true);
      try {
        const result = await getAnrede();
        setAnredenListe(result);
      } catch (error) {
        console.error(t('common.error'), error);
        setAnredenListe([]);
      } finally {
        setIsLoadingAnreden(false);
      }
    };
    fetchAnreden();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exists = contact !== null && contact?.name !== null && contact?.contactid !== undefined;
  const newContact = contact === null || (contact?.name === null && contact?.contactid === undefined);
  const canSelect = companyId !== undefined;

  const formatName = (kontakt: Contact | null, anreden: Anrede[]): string => {
    if (!kontakt) return t('contact.notSpecified');
    const gefundeneAnrede = anreden.find(a => a.id === kontakt.anrede);
    const anredeText = gefundeneAnrede ? gefundeneAnrede.text : '';
    const teile = [
      anredeText,
      kontakt.title,
      kontakt.vorname,
      kontakt.zusatzname,
      kontakt.name
    ];
    return teile.filter(teil => teil).join(' ');
  };

  if (isLoadingAnreden) {
    return <div>{t('common.loading')}</div>;
  }

  return (
    <div className="mb-4 p-4 bg-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-gray-700">{formatName(contact, anredenListe)}</p>
      <div className="flex space-x-2 mt-2">
        {exists ? (
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-2 rounded-md"
            onClick={onEdit}
          >
            {t('common.edit')}
          </button>
        ) : newContact && companyId !== undefined && companyId === 0 ? (
          <button
            className="bg-yellow-500 hover:bg-yellow-700 text-white px-3 py-2 rounded-md"
            onClick={onCreate}
          >
            {t('contact.createNew')}
          </button>
        ) : null}

        {canSelect && (
          <button
            className="bg-green-500 hover:bg-green-700 text-white px-3 py-2 rounded-md"
            onClick={onSelect}
          >
            {t('contact.select')}
          </button>
        )}

        {exists && (
          <button
            className="bg-red-500 hover:bg-red-700 text-white px-3 py-2 rounded-md"
            onClick={onRemove}
          >
            {t('common.delete')}
          </button>
        )}
      </div>
    </div>
  );
};

export default ContactSection;