import { Company } from './Company';
import { Contact } from './Contact';

export interface Resume {
  resumeId: number; 
  ref: number; 
  position: string;
  stateId: number; 
  stateText: string; 
  link: string; 
  comment: string;
  company: Company | null; 
  recrutingCompany: Company | null; 
  created: string; 
  contactCompany: Contact | null; 
  contactRecrutingCompany: Contact | null; 
}