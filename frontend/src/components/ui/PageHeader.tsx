import React, { useEffect, useState } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

import { useNavigate } from 'react-router-dom';
import { PageId } from './PageId';
import { AboutModal } from '../AboutModal';
import { getUserAnredeAndName, logout } from '../../shared/api/queries';

interface PageHeaderProps {
  pageTitle: string;
  pageId: PageId;
}

const PageHeader: React.FC<PageHeaderProps> = ({ pageTitle, pageId }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [storedUser, setStoredUser] = useState<{ name: string; anredeText: string } | null>(null);

  useEffect(() => {
    getUserAnredeAndName()
      .then(setStoredUser)
      .catch(() => setStoredUser(null));
  }, []);

  const handleLogout = () => {
    logout().then(gotoLogin);
  };
  const gotoLogin = () => {
    navigate('/login');
  };
  const menuItems = (pageId: string) => {
    if (!storedUser || pageId === PageId.Login) {
      return [];
    }

    return [
      pageId !== PageId.ResumeEdit && (
        <MenuItem>
          {({ active }) => (
            <button
              onClick={() => navigate('/resume/0')}
              className={`${
                active ? 'bg-gray-100' : ''
              } block w-full px-4 py-2 text-left text-sm text-gray-700`}
            >
              {t('resumeList.newResume')}
            </button>
          )}
        </MenuItem>
      ),
      pageId !== PageId.ResumeList && (
        <MenuItem>
          {({ active }) => (
            <button
              onClick={() => navigate('/resumes')}
              className={`${
                active ? 'bg-gray-100' : ''
              } block w-full px-4 py-2 text-left text-sm text-gray-700`}
            >
              {t('navigation.resumes')}
            </button>
          )}
        </MenuItem>
      ),
      pageId !== PageId.Profile && (
        <MenuItem>
          {({ active }) => (
            <button
              onClick={() => navigate('/profile')}
              className={`${
                active ? 'bg-gray-100' : ''
              } block w-full px-4 py-2 text-left text-sm text-gray-700`}
            >
              {t('resumeList.editProfile')}
            </button>
          )}
        </MenuItem>
      ),
      pageId !== PageId.ResumeEdit && (
        <MenuItem>
          {({ active }) => (
            <button
              onClick={() => navigate('/changeaccess')}
              className={`${active ? 'bg-gray-100' : ''} block w-full px-4 py-2 text-left text-sm text-gray-700`}
            >
              {t('resumeList.changeAccess')}
            </button>
          )}
        </MenuItem>
      ),
    ];
  };
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const dynamischenMenuItems = menuItems(pageId);

  return (
    <>
      <div className="sticky top-0 z-10 flex items-center justify-between rounded-lg bg-gray-800 p-4 text-white">
        <h2 className="text-xl font-semibold">{pageTitle}</h2>
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          <Menu as="div" className="relative inline-block text-left">
            <MenuButton className="inline-flex w-full justify-center rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600">
              {t('resumeList.menu')}
              <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
            </MenuButton>
            <MenuItems className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                {dynamischenMenuItems.map((item, index) => (
                  <React.Fragment key={index}>{item}</React.Fragment>
                ))}
                {pageId !== PageId.Login && (
                  <MenuItem>
                    {({ active }) => (
                      <button
                        onClick={() => handleLogout()}
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } block w-full px-4 py-2 text-left text-sm text-gray-700`}
                      >
                        {t('common.logout')}
                      </button>
                    )}
                  </MenuItem>
                )}
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => setIsAboutOpen(true)}
                      className={`${active ? 'bg-gray-100' : ''} block w-full px-4 py-2 text-left text-sm text-gray-700`}
                    >
                      {t('common.about')}
                    </button>
                  )}
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>
        </div>
      </div>
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </>
  );
};

export default PageHeader;
