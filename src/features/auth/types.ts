export type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
};

/** Every sign-in method returns this same shape from the backend. */
export type Session = {
  accessToken: string;
  refreshToken: string;
  /** ISO timestamp when the access token expires. */
  expiresAt: string;
  user: User;
  /** True on the first sign-in, routes the user to onboarding. */
  isNewUser?: boolean;
};

export type OtpChannel = 'sms' | 'email';

export type OtpRequestResponse = {
  requestId: string;
  /** Seconds until the code expires. */
  expiresIn: number;
  /** Seconds until another code can be requested. */
  resendIn: number;
};
