import React, { useEffect, useState } from 'react';
import { Anrede, Contact } from '../../../../interfaces/Contact';
import { getAnrede } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { getCachedAnrede } from '../../utils/storage';

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
        const result = await getCachedAnrede();
        setAnredenListe(result);
      } catch (error) {
        console.error(t('common.error'), error);
        setAnredenListe([]);
      } finally {
        setIsLoadingAnreden(false);
      }
    };
    fetchAnreden();
  }, []);

  const exists = contact !== null && contact?.name !== null && contact?.contactid !== undefined;
  const newContact =
    contact === null || (contact?.name === null && contact?.contactid === undefined);
  const canSelect = companyId !== undefined;

  const formatName = (kontakt: Contact | null, anreden: Anrede[]): string => {
    if (!kontakt) return t('contact.notSpecified');
    const gefundeneAnrede = anreden.find((a) => a.id === kontakt.anrede);
    const anredeText = gefundeneAnrede ? gefundeneAnrede.text : '';
    if (!kontakt.name && !kontakt.vorname && !kontakt.title && !kontakt.zusatzname) {
      return t('contact.notSpecified');
    }
    console.log('Anrede:', anredeText);
    const teile = [
      anredeText ? t(anredeText) : '',
      kontakt.title,
      kontakt.vorname,
      kontakt.zusatzname,
      kontakt.name,
    ];
    return teile.filter((teil) => teil).join(' ');
  };

  if (isLoadingAnreden) {
    return <div>{t('common.loading')}</div>;
  }

  return (
    <div className="mb-4 rounded-lg bg-gray-200 p-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-gray-700">{formatName(contact, anredenListe)}</p>
      <div className="mt-2 flex space-x-2">
        {exists ? (
          <button
            className="rounded-md bg-blue-500 px-3 py-2 text-white hover:bg-blue-700"
            onClick={onEdit}
          >
            {t('common.edit')}
          </button>
        ) : newContact && companyId !== undefined && companyId === 0 ? (
          <button
            className="rounded-md bg-yellow-500 px-3 py-2 text-white hover:bg-yellow-700"
            onClick={onCreate}
          >
            {t('contact.createNew')}
          </button>
        ) : null}

        {canSelect && (
          <button
            className="rounded-md bg-green-500 px-3 py-2 text-white hover:bg-green-700"
            onClick={onSelect}
          >
            {t('contact.select')}
          </button>
        )}

        {exists && (
          <button
            className="rounded-md bg-red-500 px-3 py-2 text-white hover:bg-red-700"
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
