import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { useTranslation } from 'react-i18next';
import { FormField, inputClasses } from '../../ui/FormField';
import { StatusModalProps } from '../ResumeEditModals.types';
import { changeResumeStatus } from '../../../shared/api/queries';
import { useStates } from '../../../features/dictionaries/hooks';

interface StateOption {
  stateid: number;
  text: string;
}

export const StatusModal: React.FC<StatusModalProps> = ({
  isOpen,
  onClose,
  resumeId,

  resumeTitle,
  currentStateId,
  onStatusChanged,
}) => {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [states, setStates] = useState<StateOption[]>([]);
  const [selectedState, setSelectedState] = useState<number>(currentStateId);

  // NEW: States via React Query Hook
  const { data: statesData } = useStates();

  useEffect(() => {
    if (statesData) setStates(statesData);
    setSelectedDate(new Date());
  }, [resumeId, statesData]);

  const handleChangeStatus = async () => {
    if (!selectedDate) return alert(t('statusModal.selectDate'));

    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];

      // NEW: neue Signatur: Objekt
      await changeResumeStatus({ resumeId, stateId: selectedState, date: formattedDate });
      onStatusChanged?.();
      onClose();
    } catch (err) {
      console.error('❌ Fehler beim Ändern des Status:', err);
      alert(err instanceof Error ? t(err.message) : t('statusModal.unknownError'));
    }
  };

  const isChangeEnabled = selectedState !== currentStateId;

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="fixed inset-0 bg-black opacity-30" />

        <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <Dialog.Title className="mb-4 text-xl font-semibold">{resumeTitle}</Dialog.Title>

          <FormField label={t('statusModal.newDate')} htmlFor="status-date">
            <DatePicker
              id="status-date"
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              className={inputClasses}
              dateFormat="dd.MM.yyyy"
            />
          </FormField>

          <FormField label={t('statusModal.newStatus')} htmlFor="status">
            <select
              id="status"
              name="status"
              value={selectedState}
              onChange={(e) => setSelectedState(Number(e.target.value))}
              className={inputClasses}
              aria-label={t('statusModal.newStatus')}
            >
              {states.map((s) => (
                <option key={s.stateid} value={s.stateid}>
                  {t(s.text)}
                </option>
              ))}
            </select>
          </FormField>

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
              type="button"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleChangeStatus}
              className={`rounded px-4 py-2 text-white ${
                isChangeEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'cursor-not-allowed bg-gray-400'
              }`}
              disabled={!isChangeEnabled}
              type="button"
            >
              {t('statusModal.changeStatus')}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
