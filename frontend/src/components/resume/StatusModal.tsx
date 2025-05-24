import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { changeResumeStatus, getStates } from "../../services/api";
import { StatusModalProps } from "./ResumeEditModals.types";


interface StateOption {
  stateid: number;
  text: string;
}

export const StatusModal: React.FC<StatusModalProps> = ({
  isOpen,
  onClose,
  resumeId,
  refId,
  resumeTitle,
  currentStateId, 
  onStatusChanged
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [states, setStates] = useState<StateOption[]>([]);
  const [selectedState, setSelectedState] = useState<number>(currentStateId);

  useEffect(() => {

      getStates().then(setStates).catch(console.error);
      //setSelectedState(resumeTitle === "Neu" ? 1 : 2);
      setSelectedDate(new Date());

  }, [resumeId]);
const handleChangeStatus = async () => {
  if (!selectedDate) return alert("Bitte ein Datum wählen.");

  try {
    const formattedDate = selectedDate.toISOString().split("T")[0]; // 'YYYY-MM-DD'
    await changeResumeStatus(resumeId, refId, selectedState, formattedDate);
    if (onStatusChanged) onStatusChanged();
    onClose();
  } catch (err) {
    console.error("❌ Fehler beim Ändern des Status:", err);
    alert(err instanceof Error ? err.message : "Unbekannter Fehler");
  }
};


  const isChangeEnabled = selectedState !== currentStateId;

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-10">
          <Dialog.Title className="text-xl font-semibold mb-4">{resumeTitle}</Dialog.Title>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Neues Datum</label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              className="w-full border rounded-md p-2"
              dateFormat="dd.MM.yyyy"
            />
          </div>

          <div className="mb-6">
           
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Neuer Status</label>
            <select id="status" name="status"
              value={selectedState}
              onChange={(e) => setSelectedState(Number(e.target.value))}
              className="w-full border rounded-md p-2"
            >
              {states.map((s) => (
                <option key={s.stateid} value={s.stateid}>
                  {s.text}
                </option>   
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Abbrechen
            </button>
            <button
              onClick={handleChangeStatus}
              className={`px-4 py-2 rounded text-white ${
                isChangeEnabled ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={!isChangeEnabled}
            >
              Status ändern
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
