import { t } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lng = e.target.value;
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  return (
    <div className="flex items-center">
      <label htmlFor="language-switcher" className="sr-only">
        Select language
      </label>
      <select
        id="language-switcher"
        aria-label="Select language"
        value={i18n.language}
        onChange={changeLanguage}
        className="px-2 py-1 rounded bg-gray-200 text-gray-800 focus:outline-none"
      >
        <option value="de">{t('language.de')}</option>
        <option value="en">{t('language.en')}</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;