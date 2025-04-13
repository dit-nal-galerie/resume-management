export interface User {
    loginid: number;
    loginname: string;
    password?: string;
    password2?: string; // Используется только на фронтенде
    name: string;
    email: string;
    anrede: number;
    city: string;
    street: string;
    houseNumber: string;
    postalCode: string;
    phone?: string;
    mobile?: string;
    
  }
  