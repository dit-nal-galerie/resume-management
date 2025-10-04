import { ModalType, ModalSectionCompany, ModalSectionContact } from '../ResumeEditModals.types';
import { CompanyFormModal, CompanySelectModal } from '../../company';
import ContactSelectModal from '../../contact/ContactSelectModal';
import ContactFormModal from '../../contact/ContactFormModal';
import { Contact, Company, Resume } from '../../../../../interfaces';

/**
 * Renders exactly one modal based on `modalType`.
 * All data/handlers are provided by the parent/container.
 */
type Props = {
  isOpen: boolean;
  modalType: ModalType | null;
  onClose: () => void;

  // Current resume context
  resume: Resume | null;

  // Which section is targeted by the modal
  modalSectionCompany: ModalSectionCompany | null;
  modalSectionContact: ModalSectionContact | null;

  // Data (optional for some modals)
  companies?: Company[];
  contacts?: Contact[];

  // Callbacks
  onCompanySelected?: (c: Company) => void;
  onCompanySaved?: (c: Company) => void;
  onContactSelected?: (c: Contact) => void;
  onContactSaved?: (c: Contact) => void;
};

const noop = () => {};

function emptyCompany(): Company {
  return {
    companyId: 0,
    name: '',
    city: '',
    street: '',
    houseNumber: '',
    postalCode: '',
    isRecruter: false,
    ref: 0,
  };
}

function getCurrentCompanyId(
  resume: Resume | null,
  section: ModalSectionContact | null
): number | undefined {
  if (!resume || !section) return undefined;
  if (section === 'contactCompany') return resume.company?.companyId;

  return resume.recrutingCompany?.companyId;
}
const COMPANY_KEYS = ['company', 'recrutingCompany'] as const;

type CompanyKey = (typeof COMPANY_KEYS)[number];

function getCurrentContact(
  resume: Resume | null,
  section: ModalSectionContact | null
): Contact | null {
  if (!resume || !section) return null;

  return section === 'contactCompany' ? resume.contactCompany : resume.contactRecrutingCompany;
}
const isCompanyKey = (key: string): key is CompanyKey => {
  return (COMPANY_KEYS as readonly string[]).includes(key);
};

export default function ModalRegistry({
  isOpen,
  modalType,
  onClose,
  resume,
  modalSectionCompany,
  modalSectionContact,
  companies = [],
  contacts = [],
  onCompanySelected = noop,
  onCompanySaved = noop,
  onContactSelected = noop,
  onContactSaved = noop,
}: Props) {
  if (!isOpen || !modalType) return null;

  switch (modalType) {
    case 'select':
      return (
        <CompanySelectModal
          isOpen={isOpen}
          onClose={onClose}
          companies={companies}
          onSelect={onCompanySelected}
        />
      );

    case 'edit': {
      const selected: Company | null =
        resume && modalSectionCompany && isCompanyKey(modalSectionCompany)
          ? (resume[modalSectionCompany] as Company | null)
          : null;

      return (
        <CompanyFormModal
          isOpen={isOpen}
          onClose={onClose}
          initialData={selected ?? emptyCompany()}
          onSave={onCompanySaved}
        />
      );
    }

    case 'selectContact':
      return (
        <ContactSelectModal
          isOpen={isOpen}
          onClose={onClose}
          contacts={contacts}
          onSelect={onContactSelected}
        />
      );

    case 'editContact': {
      const current = getCurrentContact(resume, modalSectionContact);
      const companyId = getCurrentCompanyId(resume, modalSectionContact) ?? 0;
      const ref = resume?.ref ?? 0;

      const initialContact: Contact = current ?? {
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
      };

      return (
        <ContactFormModal
          isOpen={isOpen}
          onClose={onClose}
          contact={initialContact}
          onSave={onContactSaved}
        />
      );
    }

    default:
      return null;
  }
}
