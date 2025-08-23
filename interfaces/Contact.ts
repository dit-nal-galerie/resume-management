export interface Contact {
    contactid: number; 
    vorname: string;
    name: string;
    email: string;
    anrede: number ; 
    title?: string;
    zusatzname?: string;
    phone?: string; 
    mobile?: string; 
    company: number; 
    ref: number; 
  }
  
  export interface Anrede {
    id: number;
    text: string;
  }

  