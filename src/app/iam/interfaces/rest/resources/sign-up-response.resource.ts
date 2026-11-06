export type SignUpResponseResource = Readonly<{
  sessionId: string;
  message: string;
  verificationRequired?: boolean;
}>;
