import type { Visit } from "./visit.model";

export type VisitServiceParams = {
  date: {
    from: moment.Moment;
    to: moment.Moment;
  };
};

export type VisitCreateParams = {
  petName: string;
  ownerName: string;
  cutType: string;
  color: string;
  date: Date;
  price: number;
  phoneNumber: string;
  race: string;
  payments: {
    uid: string;
    userUid: string;
    method: "cash" | "qr";
    amount: number;
    date: Date;
    type: "advance" | "balance";
  }[];
  hourOfDelivery?: Date;
  observation?: string;
  createdByUid: string;
  state: string;
  feedback?: string;
};

export type VisitRepositoryModel = {
  getVisits: (params: VisitServiceParams) => Promise<Visit[]>;
  getVisitById: (visitId: string) => Promise<Visit | null>;
};
