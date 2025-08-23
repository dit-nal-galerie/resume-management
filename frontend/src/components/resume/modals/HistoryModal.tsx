import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';


import DatePicker from 'react-datepicker';

import { useTranslation } from 'react-i18next';

import { FormField, inputClasses } from '../../ui/FormField';
import { StatusModalProps } from '../ResumeEditModals.types';
import { changeResumeStatus, getHistoryByResumeId } from '../../../shared/api/queries';
import { useStates } from '../../../features/dictionaries/hooks';
import { HistoryEntry } from '../../../../../interfaces';
interface StateOption {
  stateid: number;
  text: string;
}

export const HistoryModal: React.FC<StatusModalProps> = ({
  isOpen,
  onClose,
  resumeId,
  refId,
  resumeTitle,
  currentStateId,
  onStatusChanged,
}) => {
  const { t } = useTranslation();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [states, setStates] = useState<StateOption[]>([]);
  const [selectedState, setSelectedState] = useState<number>(currentStateId);

  // NEW: States via React Query Hook
  const { data: statesData } = useStates();
  useEffect(() => {
    if (statesData) setStates(statesData);
  }, [statesData]);

  // Reset Datum wenn Resume wechselt
  useEffect(() => {
    setSelectedDate(new Date());
  }, [resumeId]);

  // History laden (neue Signatur: Objekt mit resumeId/refId)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getHistoryByResumeId({ resumeId, refId });
        setHistory(data);
      } catch (err) {
        console.error(t('resume.edit.saveError'), err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resumeId, refId, t]);

  const isChangeEnabled = selectedState !== currentStateId;

  const handleChangeStatus = async () => {
    if (!selectedDate) return alert(t('validation.required'));

    try {
      const formattedDate = selectedDate.toISOString().split('T')[0]; // 'YYYY-MM-DD'
      // NEW: neue Signatur: ein Objekt
      await changeResumeStatus({ resumeId, stateId: selectedState, date: formattedDate });
      onStatusChanged?.();
      onClose();
    } catch (err) {
      console.error(t('resume.edit.saveError'), err);
      alert(err instanceof Error ? t(err.message) : t('common.error'));
    }
  };

  return (
    <Dialog open={true} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center bg-black bg-opacity-30 p-4">
        <Dialog.Panel className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
          <Dialog.Title className="mb-4 text-xl font-bold">{resumeTitle}</Dialog.Title>

          {loading ? (
            <p className="text-gray-500">{t('common.loading')}</p>
          ) : history.length === 0 ? (
            <p className="text-gray-500">{t('resume.history.noHistory')}</p>
          ) : (
            <table className="w-full border-t">
              <thead>
                <tr>
                  <th className="border-b py-2 text-left">{t('common.status')}</th>
                  <th className="border-b py-2 text-left">{t('resume.history.date')}</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry, index) => (
                  <tr key={index}>
                    <td className="py-2">{t(entry.status)}</td>
                    <td className="py-2">{new Date(entry.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {currentStateId > -1 && (
            <>
              <FormField label={t('resume.history.date')} htmlFor="history-date">
                <DatePicker
                  id="history-date"
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  className={inputClasses}
                  dateFormat="dd.MM.yyyy"
                />
              </FormField>

              <FormField label={t('common.status')} htmlFor="status">
                <select
                  id="status"
                  name="status"
                  value={selectedState}
                  onChange={(e) => setSelectedState(Number(e.target.value))}
                  className={inputClasses}
                  aria-label={t('common.status')}
                >
                  {states.map((s) => (
                    <option key={s.stateid} value={s.stateid}>
                      {t(s.text)}
                    </option>
                  ))}
                </select>
              </FormField>
            </>
          )}
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400">
              {t('common.cancel')}
            </button>
            {currentStateId > -1 && (
              <button
                onClick={handleChangeStatus}
                className={`rounded px-4 py-2 text-white ${isChangeEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'cursor-not-allowed bg-gray-400'
                  }`}
                disabled={!isChangeEnabled}
              >
                {t('resume.edit.title')}
              </button>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
