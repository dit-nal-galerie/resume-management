

export type COMPANY = 'company';
export type RECRUTINGCOMPANY = 'recrutingCompany'
export type CONTACT_COMPANY = 'contactCompany'
export type CONTACT_RECRUTINGCOMPANY = 'contactRecrutingCompany'

export type ModalType = 'select' | 'edit' | 'selectContact' | 'editContact';
export type ModalSectionCompany = COMPANY | RECRUTINGCOMPANY;
export type ModalSectionContact = CONTACT_COMPANY | CONTACT_RECRUTINGCOMPANY;