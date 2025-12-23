import { db } from "@/app/config/firebase";
import type { Visit, VisitCreate } from "@modules/visit/domain/visit.model";
import {
  get,
  query,
  ref,
  orderByChild,
  endBefore,
  startAt,
  set,
  update,
  push,
} from "firebase/database";
import type { VisitServiceParams } from "../domain/visist-repository.model";
import moment from "moment";

const getVisits = (tenantId: string) => async (params: VisitServiceParams) => {
  const root = ref(db, `visits/${tenantId}`);
  const { date } = params;
  const visitsQuery = query(
    root,
    orderByChild("date"),
    startAt(date.from.startOf("day").toISOString()),
    endBefore(date.to.endOf("day").toISOString()),
  );
  const snapshot = await get(visitsQuery);
  if (snapshot.exists()) {
    return Object.entries<Omit<Visit, "id">>(snapshot.val())
      .map(([key, val]) => ({
        id: key,
        ...val,
        date: moment(val.date),
        price: Number(val.price) ?? 0,
      }))
      .reverse();
  } else {
    return [];
  }
};

const getVisitById = (tenantId: string) => async (visitId: string) => {
  const visitRef = ref(db, `visits/${tenantId}/${visitId}`);
  const snapshot = await get(visitRef);
  if (snapshot.exists()) {
    return snapshot.val() as Visit;
  } else {
    return null;
  }
};

const createVisit = (tenantId: string) => async (visit: VisitCreate) => {
  const newVisitRef = push(ref(db, `visits/${tenantId}/`));
  await set(newVisitRef, visit);
};

const deleteVisit = (tenantId: string) => async (visitId: string) => {
  const visitRef = ref(db, `visits/${tenantId}/${visitId}`);
  await set(visitRef, null);
};

const rateVisit =
  (tenantId: string) =>
  async (visitId: string, rating: "great" | "medium" | "bad") => {
    const visitRef = ref(db, `visits/${tenantId}/${visitId}/feedback`);
    await set(visitRef, rating);
  };

const editVisit =
  (tenantId: string) => async (visitId: string, visit: Visit) => {
    const visitRef = ref(db, `visits/${tenantId}/${visitId}`);
    await update(visitRef, visit);
  };

export const VisitRepository = (tenantId: string) => ({
  getVisits: getVisits(tenantId),
  getVisitById: getVisitById(tenantId),
  createVisit: createVisit(tenantId),
  deleteVisit: deleteVisit(tenantId),
  rateVisit: rateVisit(tenantId),
  editVisit: editVisit(tenantId),
});
