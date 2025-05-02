
import React from "react";

interface CompanySectionProps {
  title: string;
  name: string | null;
  companyId?: number;
  onEdit: () => void;
  onSelect: () => void;
  onRemove?: () => void;
  onCreate: () => void;
}

const CompanySection: React.FC<CompanySectionProps> = ({
  title,
  name,
  onEdit,
  onSelect,
  onRemove,
  onCreate,
}) => {
  const exists = name !== null;

  return (
    <div className="mb-4 p-4 bg-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-gray-700">{name || "Nicht angegeben"}</p>
      <div className="flex space-x-2 mt-2">
        {exists ? (
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-2 rounded-md"
            onClick={onEdit}
          >
            Bearbeiten
          </button>
        ) : (
          <button
            className="bg-yellow-500 hover:bg-yellow-700 text-white px-3 py-2 rounded-md"
            onClick={onCreate}
          >
            Neu erstellen
          </button>
        )}

        <button
          className="bg-green-500 hover:bg-green-700 text-white px-3 py-2 rounded-md"
          onClick={onSelect}
        >
          Auswahl
        </button>

        {exists && onRemove && (
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

export default CompanySection;
