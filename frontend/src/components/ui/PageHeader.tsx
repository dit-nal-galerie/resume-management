import React, { useState } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { AboutModal } from "components/AboutModal";
import { useNavigate } from "react-router-dom";
import { PageId } from "./PageId";
import { loadUserFromStorage } from "utils/storage";
import { User } from "@interfaces/User";

interface PageHeaderProps {
    pageTitle: string;
    pageId: PageId;
}

const PageHeader: React.FC<PageHeaderProps> = ({ pageTitle, pageId }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const storedUser: User = loadUserFromStorage();
    const menuItems = (pageId: string) => {
        if (!storedUser || !storedUser.loginid || pageId === PageId.Login) {
            return [];
        }
        return [
            pageId !== PageId.ResumeEdit && <MenuItem>
                {({ active }) => (
                    <button
                        onClick={() => navigate("/resume/0")}
                        className={`${active ? "bg-gray-100" : ""
                            } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                    >
                        {t("resumeList.newResume")}
                    </button>
                )}
            </MenuItem >,
            pageId !== PageId.ResumeList && <MenuItem>
                {({ active }) => (
                    <button
                        onClick={() => navigate("/resumes")}
                        className={`${active ? "bg-gray-100" : ""
                            } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                    >
                        {t("navigation.resumes")}
                    </button>
                )}
            </MenuItem >,
            pageId !== PageId.Profile && <MenuItem>
                {({ active }) => (
                    <button
                        onClick={() => navigate("/profile")}
                        className={`${active ? "bg-gray-100" : ""
                            } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                    >
                        {t("resumeList.editProfile")}
                    </button>
                )}
            </MenuItem>,
            pageId !== PageId.ResumeEdit && <MenuItem>
                {({ active }) => (
                    <button
                        onClick={() => navigate("/changeaccess")}
                        className={`${active ? "bg-gray-100" : ""} block w-full text-left px-4 py-2 text-sm text-gray-700`}
                    >
                        {t("resumeList.changeAccess")}
                    </button>
                )}
            </MenuItem>,
        ];
    }
    const [isAboutOpen, setIsAboutOpen] = useState(false);
    const dynamischenMenuItems = menuItems(pageId);
    return (
        <>
            <div className="sticky top-0 bg-gray-800 text-white p-4 rounded-lg flex justify-between items-center z-10">
                <h2 className="text-xl font-semibold">
                    {pageTitle}
                </h2>
                <div className="flex items-center space-x-4">
                    <LanguageSwitcher />
                    <Menu as="div" className="relative inline-block text-left">
                        <MenuButton className="inline-flex justify-center w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium text-white">
                            {t("resumeList.menu")}
                            <ChevronDownIcon className="w-5 h-5 ml-2 -mr-1" aria-hidden="true" />
                        </MenuButton>
                        <MenuItems className="absolute right-0 mt-2 w-48 origin-top-right rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                            <div className="py-1">
                                {dynamischenMenuItems.map((item, index) => (
                                    <React.Fragment key={index}>{item}</React.Fragment>
                                ))}
                                <MenuItem>
                                    {({ active }) => (
                                        <button
                                            onClick={() => setIsAboutOpen(true)}
                                            className={`${active ? "bg-gray-100" : ""} block w-full text-left px-4 py-2 text-sm text-gray-700`}
                                        >
                                            {t("common.about")}
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