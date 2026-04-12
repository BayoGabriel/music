export type PaypalDetailsDocument = {
  email: string;
  name: string;
  paypalId: string;
};

export type RevolutDetailsDocument = {
  fullName: string;
  iban: string;
  bic: string;
  tag?: string;
};

export type BankDetailsDocument = {
  accountName: string;
  sortCode: string;
  accountNumber: string;
  bankName: string;
  iban: string;
  bicSwift: string;
};

export type UserPaymentDetailsDocument = {
  id: string;
  userId: string;
  paypal?: PaypalDetailsDocument;
  revolut?: RevolutDetailsDocument;
  bank?: BankDetailsDocument;
  createdAt: Date;
  updatedAt: Date;
};
