import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { changeResumeStatus, getStates } from "../../services/api";
import { StatusModalProps } from "./ResumeEditModals.types";
import { useTranslation } from "react-i18next";
import { FormField, inputClasses } from "../ui/FormField";

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
  onStatusChanged,
}) => {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [states, setStates] = useState<StateOption[]>([]);
  const [selectedState, setSelectedState] = useState<number>(currentStateId);

  useEffect(() => {
    getStates().then(setStates).catch(console.error);
    setSelectedDate(new Date());
  }, [resumeId]);

  const handleChangeStatus = async () => {
    if (!selectedDate) return alert(t("statusModal.selectDate"));

    try {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      await changeResumeStatus(resumeId, refId, selectedState, formattedDate);
      if (onStatusChanged) onStatusChanged();
      onClose();
    } catch (err) {
      console.error("❌ Fehler beim Ändern des Status:", err);
      alert(err instanceof Error ? t(err.message) : t("statusModal.unknownError"));
    }
  };

  const isChangeEnabled = selectedState !== currentStateId;

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-10">
          <Dialog.Title className="text-xl font-semibold mb-4">{resumeTitle}</Dialog.Title>

          <FormField label={t("statusModal.newDate")} htmlFor="status-date">
            <DatePicker
              id="status-date"
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              className={inputClasses}
              dateFormat="dd.MM.yyyy"
            />
          </FormField>

          <FormField label={t("statusModal.newStatus")} htmlFor="status">
            <select
              id="status"
              name="status"
              value={selectedState}
              onChange={(e) => setSelectedState(Number(e.target.value))}
              className={inputClasses}
              aria-label={t("statusModal.newStatus")}
            >
              {states.map((s) => (
                <option key={s.stateid} value={s.stateid}>
                  {s.text}
                </option>
              ))}
            </select>
          </FormField>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              type="button"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={handleChangeStatus}
              className={`px-4 py-2 rounded text-white ${isChangeEnabled ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
                }`}
              disabled={!isChangeEnabled}
              type="button"
            >
              {t("statusModal.changeStatus")}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};