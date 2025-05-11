import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { getHistoryByResumeId } from '../../services/api';
import { HistoryEntry } from '../../../../interfaces/histori';



interface HistoryModalProps {
  
  onClose: () => void;
  resumeId: number;
  loginId: number;
  resumeTitle: string;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  
  onClose,
  resumeId,
  loginId,
  resumeTitle,
}) => {
 
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
console.log("HistoryModal", resumeId, loginId);
  useEffect(() => {
  

    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getHistoryByResumeId(resumeId, loginId);
        setHistory(data);
      } catch (err) {
        console.error('Fehler beim Laden der Historie:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Dialog open={true} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen bg-black bg-opacity-30 p-4">
        <Dialog.Panel className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
          <Dialog.Title className="text-xl font-bold mb-4">{resumeTitle}</Dialog.Title>

          {loading ? (
            <p className="text-gray-500">Lade Historie...</p>
          ) : history.length === 0 ? (
            <p className="text-gray-500">Keine Historie gefunden.</p>
          ) : (
            <table className="w-full border-t">
              <thead>
                <tr>
                  <th className="text-left py-2 border-b">Status</th>
                  <th className="text-left py-2 border-b">Datum</th>
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

          <div className="mt-6 text-right">
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Schließen
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );

};
