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
  deliveredByUid?: string | null;
  choped?: Service | null;
  bathed?: Service | null;
  brushed?: Service | null;
  state: string;
  observation?: string | null;
  hourOfDelivery?: moment.Moment | null;
  payments: Payment[];
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
  payments: Payment[];
  hourOfDelivery?: string | null;
  observation?: string | null;
  createdByUid: string;
  state: string;
  feedback?: string | null;
};

type Service = {
  date: Date;
  userUid: string;
};

export type Payment = {
  uid: string;
  userUid: string;
  method: "cash" | "qr";
  amount: number;
  date: string;
  type: "advance" | "balance";
};
