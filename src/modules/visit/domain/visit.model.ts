import type moment from "moment";

export type Visit = {
  id: string;
  petName: string;
  ownerName: string;
  cutType: string;
  color: string;
  date: moment.Moment;
  dateModified: moment.Moment;
  price: number;
  race: string;
  phoneNumber: string;
  createdByUid: string;
  deliveredByUid?: string;
  choped?: Service;
  bathed?: Service;
  brushed?: Service;
  state: string;
  observation?: string;
  hourOfDelivery?: moment.Moment;
  payments?: Payment[];
  primaryConsent?: Record<string, any>;
  secondaryConsent?: Record<string, any>;
  feedback?: string;
};

export type VisitCreate = {
  petName: string;
  ownerName: string;
  cutType: string;
  color: string;
  date: string;
  dateModified: string;
  price: number;
  phoneNumber: string;
  race: string;
  payments: PaymentCreate[];
  hourOfDelivery?: string;
  observation?: string;
  createdByUid: string;
  state: string;
  feedback?: string;
};

export type VisitFirebase = {
  petName: string;
  ownerName: string;
  cutType: string;
  color: string;
  date: string;
  dateModified: string;
  price: string;
  phoneNumber: string;
  race: string;
  payments?: Record<string, PaymentFirebase>;
  primaryConsent?: any;
  secondaryConsent?: any;
  hourOfDelivery?: string;
  observation?: string;
  createdByUid: string;
  state: string;
  feedback?: string;
};

type Service = {
  date: Date;
  userUid: string;
};

export type PaymentCreate = {
  amount: number;
  method: "EFECTIVO" | "QR";
  type: "A/C" | "Saldo";
  userUid: string;
};

export type PaymentFirebase = {
  amount: number;
  date: string;
  method: string;
  type: string;
  userUid: string;
};

export type Payment = {
  uid: string;
  amount: number;
  date: moment.Moment;
  method: "EFECTIVO" | "QR";
  type: "A/C" | "Saldo";
  userUid: string;
};
