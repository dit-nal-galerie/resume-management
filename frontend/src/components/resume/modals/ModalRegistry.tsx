import React from 'react';
import { Company } from '../../../../../interfaces/Company';
import { Contact } from '../../../../../interfaces/Contact';
import { Resume } from '../../../../../interfaces/Resume';
import { CompanyFormModal, CompanySelectModal } from 'components/company';
import ContactFormModal from 'components/contact/ContactFormModal';
import ContactSelectModal from 'components/contact/ContactSelectModal';
import {
  ModalType,
  ModalSectionCompany,
  ModalSectionContact,
} from '../ResumeEditModals.types';

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

function getCurrentContact(
  resume: Resume | null,
  section: ModalSectionContact | null
): Contact | null {
  if (!resume || !section) return null;
  return section === 'contactCompany' ? resume.contactCompany : resume.contactRecrutingCompany;
}

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
      // Company selection
      return (
        <CompanySelectModal
          isOpen={isOpen}
          onClose={onClose}
          companies={companies}
          onSelect={onCompanySelected}
        />
      );

    case 'edit': {
      // Company create/edit – CompanyFormModal expects { initialData, onSave }
      const selected: Company | null =
        modalSectionCompany && resume
          ? // index by union key; TS doesn't infer this well, so cast
            ((resume as any)[modalSectionCompany] as Company | null)
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
      // Contact selection for either company or recruiting company
      return (
        <ContactSelectModal
          isOpen={isOpen}
          onClose={onClose}
          contacts={contacts}
          onSelect={onContactSelected}
        />
      );

    case 'editContact': {
      // Contact create/edit; ContactFormModal expects a full `contact` object
      const current = getCurrentContact(resume, modalSectionContact);
      const companyId = getCurrentCompanyId(resume, modalSectionContact) ?? 0;
      const ref = resume?.ref ?? 0;

      const initialContact: Contact =
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