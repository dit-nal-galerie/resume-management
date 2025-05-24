export interface PasswordResetToken {
  id: number;
  user_id: number;
  token: string;
  created_at: Date;
  expires_at: Date;
  is_used: boolean;
}

export interface PasswordResetRequest {
  loginname: string;
  email: string;
}

export interface PasswordResetValidation {
  valid: boolean;
  userId?: number;
  error?: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface PasswordChangeRequest {
  token: string;
  newPassword: string;
}
