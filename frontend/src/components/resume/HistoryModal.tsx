import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { changeResumeStatus, getHistoryByResumeId, getStates } from '../../services/api';
import { HistoryEntry } from '../../../../interfaces/histori';
import DatePicker from 'react-datepicker';
import { StatusModalProps } from './ResumeEditModals.types';
import { useTranslation } from 'react-i18next';
import { FormField, inputClasses } from '../ui/FormField';

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
  onStatusChanged
}) => {
  const { t } = useTranslation();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [states, setStates] = useState<StateOption[]>([]);
  const [selectedState, setSelectedState] = useState<number>(currentStateId);

  useEffect(() => {
    getStates().then(setStates).catch(console.error);
    setSelectedDate(new Date());
  }, [resumeId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getHistoryByResumeId(resumeId, refId);
        setHistory(data);
      } catch (err) {
        console.error(t('resume.edit.saveError'), err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const isChangeEnabled = selectedState !== currentStateId;
  const handleChangeStatus = async () => {
    if (!selectedDate) return alert(t('validation.required'));

    try {
      const formattedDate = selectedDate.toISOString().split("T")[0]; // 'YYYY-MM-DD'
      await changeResumeStatus(resumeId, refId, selectedState, formattedDate);
      if (onStatusChanged) onStatusChanged();
      onClose();
    } catch (err) {
      console.error(t('resume.edit.saveError'), err);
      alert(err instanceof Error ? t(err.message) : t('common.error'));
    }
  };

  return (
    <Dialog open={true} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen bg-black bg-opacity-30 p-4">
        <Dialog.Panel className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
          <Dialog.Title className="text-xl font-bold mb-4">{resumeTitle}</Dialog.Title>

          {loading ? (
            <p className="text-gray-500">{t('common.loading')}</p>
          ) : history.length === 0 ? (
            <p className="text-gray-500">{t('resume.history.noHistory')}</p>
          ) : (
            <table className="w-full border-t">
              <thead>
                <tr>
                  <th className="text-left py-2 border-b">{t('common.status')}</th>
                  <th className="text-left py-2 border-b">{t('resume.history.date')}</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry, index) => (
                  <tr key={index}>
                    <td className="py-2">{entry.status}</td>
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
                      {s.text}
                    </option>
                  ))}
                </select>
              </FormField>
            </>
          )}
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              {t('common.cancel')}
            </button>
            {currentStateId > -1 && (
              <button
                onClick={handleChangeStatus}
                className={`px-4 py-2 rounded text-white ${isChangeEnabled ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
                  }`}
                disabled={!isChangeEnabled}
              >
                {t('resume.edit.title')}
              </button>)}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};