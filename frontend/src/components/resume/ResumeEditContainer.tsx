// src/components/resume/ResumeEditContainer.tsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import ResumeEditForm from './ResumeEditForm';
import ContactSelectModal from '../contact/ContactSelectModal';
import ContactFormModal from '../contact/ContactFormModal';
import { CompanyFormModal, CompanySelectModal } from '../company';

import {
    ModalSectionCompany,
    ModalSectionContact,
    ModalType,
} from './ResumeEditModals.types';
import { HistoryModal } from './modals/HistoryModal';


import {
    getCompanies,
    getContacts,

    updateOrCreateResume,
    getStates,
} from '../../shared/api/queries';
import { useResumeById } from '../../features/resumes/hooks';
import { Company, Resume, Contact } from '../../../../interfaces';
import { PageLoader } from '../ui/Loader';

type RouteParams = { resumeId?: string };
type StatusItem = { stateid: number; text: string };

export default function ResumeEditContainer({ initial }: { initial: Resume | null }) {
    const EMPTY_COMPANY: Company = {
        companyId: 0,
        name: '',
        city: '',
        street: '',
        houseNumber: '',
        postalCode: '',
        isRecruter: false,
        ref: 0,
    };

    const { t } = useTranslation();
    const navigate = useNavigate();
    const { resumeId } = useParams<RouteParams>();

    // Routen-ID robust parsen
    const parsedId = React.useMemo(() => {
        if (!resumeId || resumeId === '0' || resumeId === 'new') return 0;
        const n = Number(resumeId);

        return Number.isFinite(n) && n > 0 ? n : 0;
    }, [resumeId]);

    // Hauptdaten
    const [resumeData, setResumeData] = React.useState<Resume | null>(initial);
    const [statusList, setStatusList] = React.useState<StatusItem[]>([]);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    // const [storedUser, setStoredUser] = React.useState<User | null>(null);

    // Modals
    const [modalOpen, setModalOpen] = React.useState(false);
    const [modalType, setModalType] = React.useState<ModalType | null>(null);
    const [modalSectionCompany, setModalSectionCompany] =
        React.useState<ModalSectionCompany | null>(null);
    const [modalSectionContact, setModalSectionContact] =
        React.useState<ModalSectionContact | null>(null);

    // Datenquellen für Auswahllisten
    const [companies, setCompanies] = React.useState<Company[]>([]);
    const [contacts, setContacts] = React.useState<Contact[]>([]);

    // History Modal
    const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);

    // User laden (optional)
    // React.useEffect(() => {
    //     getUserProfile()
    //         .then(setStoredUser)
    //         .catch(() => setStoredUser(null));
    // }, []);

    // States laden
    React.useEffect(() => {
        getStates()
            .then(setStatusList)
            .catch((err) => console.error('getStates failed:', err));
    }, []);
    // Resume laden via Hook
    const {
        data: fetchedResume,
        isLoading: isLoadingResume,
        error: resumeError,
    } = useResumeById(parsedId, 0, parsedId > 0);

    // Form-State setzen
    React.useEffect(() => {
        if (parsedId > 0) {
            if (fetchedResume) {
                setResumeData(fetchedResume);
            } else if (!isLoadingResume && resumeError) {
                console.error('Resume laden fehlgeschlagen:', resumeError.message);
                setErrorMessage(t(resumeError.message));
            }
        } else {
            // Neu anlegen
            setResumeData({
                resumeId: 0,
                ref: 0,
                position: '',
                stateId: 0,
                stateText: '',
                link: '',
                comment: '',
                created: new Date().toISOString().split('T')[0],
                company: null,
                recrutingCompany: null,
                contactCompany: null,
                contactRecrutingCompany: null,
            });
        }
    }, [parsedId, fetchedResume, isLoadingResume, resumeError, t]);

    // ===== Company Handlers =====

    const handleOpenEditCompany = (section: ModalSectionCompany) => {
        setModalType('edit');
        setModalSectionCompany(section);
        setModalOpen(true);
    };

    // VARIANTE 1: kein Promise zurückgeben, async-Logik intern kapseln
    const handleOpenSelectCompany = (section: ModalSectionCompany) => {
        (async () => {
            const list = await getCompanies(section === 'recrutingCompany');

            setCompanies(list);
            setModalType('select');
            setModalSectionCompany(section);
            setModalOpen(true);
        })().catch(console.error);
    };

    const handleRemoveCompany = (section: ModalSectionCompany) => {
        setResumeData((rd) => (rd ? { ...rd, [section]: null } : rd));
    };

    const handleSaveCompany = (comp: Company) => {
        if (!modalSectionCompany) return;
        const patched: Company = {
            ...comp,
            isRecruter: modalSectionCompany === 'recrutingCompany',
            companyId: comp.companyId || 0,
        };

        setResumeData((rd) => (rd ? { ...rd, [modalSectionCompany]: patched } : rd));
        setModalOpen(false);
        setModalType(null);
        setModalSectionCompany(null);
    };

    const handleSelectCompany = (comp: Company) => {
        if (!modalSectionCompany) return;
        setResumeData((rd) => (rd ? { ...rd, [modalSectionCompany]: comp } : rd));
        setModalOpen(false);
        setModalType(null);
        setModalSectionCompany(null);
    };

    // ===== Contact Handlers =====

    // VARIANTE 1
    const handleOpenEditContact = (section: ModalSectionContact) => {
        setModalType('editContact');
        setModalSectionContact(section);
        setModalOpen(true);
    };

    // VARIANTE 1
    const handleOpenSelectContact = (section: ModalSectionContact) => {
        (async () => {
            setModalType('selectContact');
            setModalSectionContact(section);

            const compId =
                resumeData?.[section === 'contactCompany' ? 'company' : 'recrutingCompany']?.companyId;

            if (!compId) {
                alert(t('resumeEdit.selectCompanyFirst'));
                setModalType(null);
                setModalSectionContact(null);

                return;
            }

            const list = await getContacts({ refId: 0, companyId: compId });

            setContacts(list);
            setModalOpen(true);
        })().catch(console.error);
    };

    const handleRemoveContact = (section: ModalSectionContact) => {
        if (!resumeData) return;
        const key = section === 'contactCompany' ? 'contactCompany' : 'contactRecrutingCompany';
        const contact =
            section === 'contactCompany' ? resumeData?.contactCompany : resumeData?.contactRecrutingCompany;

        if (!contact?.contactid) return;

        if (!window.confirm(t('resumeEdit.confirmDeleteContact'))) return;
        setResumeData((prev) => (prev ? { ...prev, [key]: null } : prev));
    };

    const handleSelectContact = (c: Contact) => {
        if (!modalSectionContact) return;
        const key = modalSectionContact === 'contactCompany' ? 'contactCompany' : 'contactRecrutingCompany';

        setResumeData((rd) => (rd ? { ...rd, [key]: c } : rd));
        setModalOpen(false);
        setModalType(null);
        setModalSectionContact(null);
    };

    const handleSaveContact = (updated: Contact) => {
        if (!modalSectionContact) return;

        const keyCompany = modalSectionContact === 'contactCompany' ? 'company' : 'recrutingCompany';
        const companyId = resumeData?.[keyCompany]?.companyId || 0;

        const safe: Contact = {
            ...updated,
            anrede: updated.anrede || 0,
            company: companyId,
            contactid: updated.contactid || 0,
        };

        const key = modalSectionContact === 'contactCompany' ? 'contactCompany' : 'contactRecrutingCompany';

        setResumeData((rd) => (rd ? { ...rd, [key]: safe } : rd));
        setModalOpen(false);
        setModalType(null);
        setModalSectionContact(null);
    };

    // ===== History =====
    const openHistoryModal = () => setIsHistoryOpen(true);
    const closeHistoryModal = () => setIsHistoryOpen(false);

    // ===== Save / Back / View =====

    // VARIANTE 1
    const handleSave = () => {
        (async () => {
            if (!resumeData) return;
            if (!resumeData.position) {
                setErrorMessage(t('resumeEdit.requiredFields'));

                return;
            }
            try {
                await updateOrCreateResume(resumeData);
                alert(
                    resumeData.resumeId === 0
                        ? t('resumeEdit.saveSuccessNew')
                        : t('resumeEdit.saveSuccessUpdate')
                );
                void navigate('/resumes');
            } catch (e) {
                console.error('updateOrCreateResume failed', e);
                setErrorMessage(t('resumeEdit.saveError'));
            }
        })().catch(console.error);
    };

    // VARIANTE 1 (hier reicht synchron)
    const handleBack = () => {
        void navigate('/resumes');
    };

    const handleView = () => {
        console.log(JSON.stringify(resumeData, null, 2));
        const tView =
            JSON.stringify(resumeData?.contactCompany, null, 2) +
            '\n' +
            JSON.stringify(resumeData?.contactRecrutingCompany, null, 2);

        alert(tView);
    };

    const initialCompanyData: Company =
        modalSectionCompany
            ? modalSectionCompany === 'company'
                ? (resumeData?.company ?? EMPTY_COMPANY)
                : (resumeData?.recrutingCompany ?? EMPTY_COMPANY)
            : EMPTY_COMPANY;

    const initialContact: Contact = React.useMemo(() => {
        const ref = resumeData?.ref ?? 0;
        const section = modalSectionContact;

        const companyId = section
            ? resumeData?.[section === 'contactCompany' ? 'company' : 'recrutingCompany']?.companyId ?? 0
            : 0;

        const current: Contact | undefined =
            section === 'contactCompany'
                ? (resumeData?.contactCompany ?? undefined)
                : section === 'contactRecrutingCompany'
                    ? (resumeData?.contactRecrutingCompany ?? undefined)
                    : undefined;

        return (
            current ?? {
                contactid: 0,
                vorname: '',
                name: '',
                email: '',
                anrede: 0,
                title: '',
                zusatzname: '',
                phone: '',
                mobile: '',
                company: companyId,
                ref,
            }
        );
    }, [modalSectionContact, resumeData]);

    // Guards
    if (parsedId > 0 && isLoadingResume) return <PageLoader />;
    if (!resumeData) return <PageLoader />;

    return (
        <>
            <ResumeEditForm
                resume={resumeData}
                statusList={statusList}
                errorMessage={errorMessage}
                setResume={setResumeData}
                onOpenEditCompany={handleOpenEditCompany}
                onOpenSelectCompany={handleOpenSelectCompany}
                onRemoveCompany={handleRemoveCompany}
                onOpenEditContact={handleOpenEditContact}
                onOpenSelectContact={handleOpenSelectContact}
                onRemoveContact={handleRemoveContact}
                onSave={handleSave}
                onBack={handleBack}
                onView={handleView}
                onOpenHistory={resumeData.resumeId > 0 ? openHistoryModal : undefined}
            />

            {/* Company: Edit */}
            <CompanyFormModal
                isOpen={modalOpen && modalType === 'edit'}
                onClose={() => setModalOpen(false)}
                initialData={initialCompanyData}
                onSave={handleSaveCompany}
            />

            {/* Company: Select */}
            <CompanySelectModal
                isOpen={modalOpen && modalType === 'select'}
                onClose={() => setModalOpen(false)}
                companies={companies}
                onSelect={handleSelectCompany}
            />

            {/* Contact: Select */}
            <ContactSelectModal
                isOpen={modalOpen && modalType === 'selectContact'}
                onClose={() => setModalOpen(false)}
                contacts={contacts}
                onSelect={handleSelectContact}
            />

            {/* Contact: Edit/Create */}
            <ContactFormModal
                isOpen={modalOpen && modalType === 'editContact'}
                onClose={() => setModalOpen(false)}
                contact={initialContact}
                onSave={handleSaveContact}
            />

            {/* History */}
            {isHistoryOpen && resumeData && (
                <HistoryModal
                    isOpen={isHistoryOpen}
                    onClose={closeHistoryModal}
                    resumeId={resumeData.resumeId}
                    refId={0}
                    resumeTitle={resumeData.position || ''}
                    currentStateId={-1}
                />
            )}
        </>
    );
}
