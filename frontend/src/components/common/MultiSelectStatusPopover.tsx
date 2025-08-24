import React, { useMemo, useState } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { useTranslation } from 'react-i18next';

export type StatusItem = { stateid: number; text: string };

type Props = {
    label: string;
    options: StatusItem[];
    value: number[];                 // ausgewählte stateids
    onChange: (ids: number[]) => void;
    placeholder?: string;            // Text im ViewInput, wenn nichts gewählt
    searchPlaceholder?: string;      // Placeholder im Suchfeld
    className?: string;
};

export default function MultiSelectStatusPopover({
    label,
    options,
    value,
    onChange,

    placeholder = '—',
    searchPlaceholder = 'Suchen…',
    className = '',
}: Props) {
    const { t } = useTranslation();
    const [query, setQuery] = useState('');

    const selectedSet = useMemo(() => new Set(value), [value]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return options;
        return options.filter((o) => t(o.text).toLowerCase().includes(q));
    }, [options, query, t]);

    const selectedItems = useMemo(() => {
        const map = new Map(options.map((o) => [o.stateid, t(o.text)]));
        return value
            .map((id) => ({ id, label: map.get(id) }))
            .filter((x): x is { id: number; label: string } => Boolean(x.label));
    }, [value, options, t]);

    const toggle = (id: number) => {
        if (selectedSet.has(id)) onChange(value.filter((v) => v !== id));
        else onChange([...value, id]);
    };

    const removeOne = (id: number) => onChange(value.filter((v) => v !== id));

    const selectAllFiltered = () => {
        const set = new Set(value);
        filtered.forEach((o) => set.add(o.stateid));
        onChange(Array.from(set));
    };

    const clearAll = () => onChange([]);

    return (
        <div className={`w-full ${className}`}>
            <label className="mb-1 block text-sm font-medium">{label}</label>

            <Popover className="relative">
                {/* ViewInput (Button im Input-Look mit Chips) */}
                <Popover.Button
                    className="flex w-full cursor-pointer items-center gap-2 rounded border border-gray-300 px-3 py-2 text-left outline-none focus:ring-2 focus:ring-blue-400"
                    aria-label={label}
                >
                    {selectedItems.length > 0 ? (
                        <div className="flex min-h-[1.75rem] flex-wrap items-center gap-2">
                            {selectedItems.map((it) => (
                                <span
                                    key={it.id}
                                    className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
                                >
                                    {it.label}
                                    {/* '×' zum Entfernen — klick öffnet Popover NICHT */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation(); // verhindert Popover-Toggle
                                            e.preventDefault();
                                            removeOne(it.id);
                                        }}
                                        className="rounded px-1 leading-none hover:bg-blue-200"
                                        aria-label={t('common.remove')}
                                        title={t('common.remove')}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    ) : (
                        <span className="min-h-[1.75rem] select-none text-gray-400">{placeholder}</span>
                    )}
                    <span
                        aria-hidden="true"
                        className="ml-auto inline-block rotate-0 transition-transform ui-open:rotate-180"
                    >
                        ▾
                    </span>
                </Popover.Button>

                {/* Kontext-Fenster */}
                <Transition
                    enter="transition ease-out duration-100"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-75"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                >
                    <Popover.Panel className="absolute z-50 mt-2 w-full min-w-[300px] rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                        {/* Suche */}
                        <div className="mb-3">
                            <label htmlFor="status-search" className="sr-only">
                                {t('common.search')}
                            </label>
                            <input
                                id="status-search"
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>

                        {/* Liste */}
                        <div className="max-h-60 overflow-auto pr-1">
                            {filtered.length === 0 ? (
                                <div className="p-2 text-sm text-gray-500">{t('common.noResults')}</div>
                            ) : (
                                <ul className="space-y-1">
                                    {filtered.map((o) => {
                                        const checked = selectedSet.has(o.stateid);
                                        const id = `status-${o.stateid}`;
                                        return (
                                            <li key={o.stateid}>
                                                <label
                                                    htmlFor={id}
                                                    className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 hover:bg-blue-50"
                                                >
                                                    <input
                                                        id={id}
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => toggle(o.stateid)}
                                                        className="h-4 w-4 accent-blue-600"
                                                        aria-label={t(o.text)}
                                                    />
                                                    <span className="text-sm">{t(o.text)}</span>
                                                </label>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>

                        {/* Aktionen */}
                        <div className="mt-3 flex items-center gap-2">
                            <button
                                type="button"
                                onClick={selectAllFiltered}
                                className="rounded bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200"
                            >
                                {t('common.selectAll')}
                            </button>
                            <button
                                type="button"
                                onClick={clearAll}
                                className="rounded bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200"
                            >
                                {t('common.clear')}
                            </button>
                        </div>
                    </Popover.Panel>
                </Transition>
            </Popover>
        </div>
    );
}
