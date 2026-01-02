import { db, storage } from "@/app/config/firebase";
import type {
  Payment,
  PaymentFirebase,
  Visit,
  VisitCreate,
  VisitFirebase,
} from "@modules/visit/domain/visit.model";
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
  type DatabaseReference,
} from "firebase/database";
import type { VisitServiceParams } from "../domain/visist-repository.model";
import moment from "moment";
import {
  uploadBytes,
  ref as firebaseStorageRef,
  getDownloadURL,
} from "firebase/storage";

const mapPaymentFromFirebase = (
  key: string,
  payment: PaymentFirebase,
): Payment => {
  return {
    ...payment,
    uid: key,
    amount: Number(payment.amount) ?? 0,
    date: moment(payment.date),
    method: payment.method as "EFECTIVO" | "QR",
    type: payment.type as "A/C" | "Saldo",
    userUid: payment.userUid,
  };
};

const mapVisitFromFirebase = (key: string, visit: VisitFirebase): Visit => {
  return {
    ...visit,
    id: key,
    date: moment(visit.date),
    price: Number(visit.price) ?? 0,
    payments: visit.payments
      ? Object.entries<PaymentFirebase>(visit.payments).map(([pKey, pVal]) =>
          mapPaymentFromFirebase(pKey, pVal),
        )
      : [],
    hourOfDelivery: moment(visit.hourOfDelivery).isValid()
      ? moment(visit.hourOfDelivery)
      : undefined,
    dateModified: moment(visit.dateModified),
  };
};

const mapVisitCreateToFirebase = (
  tenantId: string,
  visit: VisitCreate,
  visitRef: DatabaseReference,
): VisitFirebase => {
  console.log(visit.hourOfDelivery);
  return {
    ...visit,
    date: moment(visit.date).format("YYYY-MM-DDTHH:mm:ss"),
    dateModified: moment().format("YYYY-MM-DDTHH:mm:ss"),
    price: visit.price.toString(),
    hourOfDelivery: moment(visit.hourOfDelivery, "HH:mm").isValid()
      ? moment(visit.hourOfDelivery, "HH:mm").format("YYYY-MM-DDTHH:mm:ss")
      : "",
    payments: visit.payments
      ? visit.payments.reduce((acc: Record<string, any>, payment) => {
          const paymentRef = getNewPaymentRef(tenantId, visitRef.key!);

          acc[paymentRef.key] = {
            ...payment,
            amount: payment.amount.toString(),
            userUid: visit.createdByUid,
            date: moment().format("YYYY-MM-DDTHH:mm:ss"),
          };
          return acc;
        }, {})
      : undefined,
  };
};

const mapVisitUpdateToFirebase = (
  visit: Visit,
): Omit<VisitFirebase, "payments" | "createdByUid"> => {
  return {
    color: visit.color,
    petName: visit.petName,
    ownerName: visit.ownerName,
    state: visit.state,
    feedback: visit.feedback,
    cutType: visit.cutType,
    phoneNumber: visit.phoneNumber,
    race: visit.race,
    observation: visit.observation,
    date: moment(visit.date).format("YYYY-MM-DDTHH:mm:ss"),
    dateModified: moment().format("YYYY-MM-DDTHH:mm:ss"),
    price: visit.price.toString(),
    hourOfDelivery: moment(visit.hourOfDelivery, "HH:mm").isValid()
      ? moment(visit.hourOfDelivery).format("YYYY-MM-DDTHH:mm:ss")
      : "",
  };
};

const getVisits = (tenantId: string) => async (params: VisitServiceParams) => {
  const root = ref(db, `visits/${tenantId}`);
  const { date } = params;
  const visitsQuery = query(
    root,
    orderByChild("date"),
    startAt(date.from.startOf("day").format("YYYY-MM-DDTHH:mm:ss")),
    endBefore(date.to.endOf("day").format("YYYY-MM-DDTHH:mm:ss")),
  );
  const snapshot = await get(visitsQuery);
  if (snapshot.exists()) {
    return Object.entries<VisitFirebase>(snapshot.val())
      .map(([key, val]) => mapVisitFromFirebase(key, val))
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

const getNewVisitRef = (tenantId: string) => {
  return push(ref(db, `visits/${tenantId}/`));
};

const getNewPaymentRef = (tenantId: string, visitId: string) => {
  return push(ref(db, `visits/${tenantId}/${visitId}/payments`));
};

const createVisit = (tenantId: string) => async (visit: VisitCreate) => {
  const visitRef = getNewVisitRef(tenantId);

  const visitToCreate: Record<string, any> = {
    [visitRef.key!]: mapVisitCreateToFirebase(tenantId, visit, visitRef),
  };

  await update(ref(db, `visits/${tenantId}/`), visitToCreate);
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
    await update(visitRef, mapVisitUpdateToFirebase(visit));
  };

const changeState =
  (tenantId: string) => async (visitId: string, state: string) => {
    const visitRef = ref(db, `visits/${tenantId}/${visitId}/state`);
    await set(visitRef, state);
  };

const toggleService =
  (tenantId: string) =>
  async (
    visitId: string,
    userId: string,
    service: "brushed" | "bathed" | "choped",
  ) => {
    const serviceRef = ref(db, `visits/${tenantId}/${visitId}/${service}`);
    const serviceSnap = await get(serviceRef);
    if (serviceSnap.exists()) {
      await set(serviceRef, null);
      return;
    }

    await set(serviceRef, {
      date: moment().format("YYYY-MM-DDTHH:mm:ss"),
      userUid: userId,
    });
  };

const setPrimaryConsent =
  (tenantId: string) => async (visitId: string, consent: string) => {
    const consentRef = ref(db, `visits/${tenantId}/${visitId}/primaryConsent`);
    await set(consentRef, consent);
  };

const setSecondaryConsent =
  (tenantId: string) => async (visitId: string, consent: string) => {
    const consentRef = ref(
      db,
      `visits/${tenantId}/${visitId}/secondaryConsent`,
    );
    await set(consentRef, consent);
  };

const setUrlConsent =
  (tenantId: string) => async (visitId: string, url: string, node: string) => {
    const consentRef = ref(
      db,
      `visits/${tenantId}/${visitId}/${node}/documentUrl`,
    );
    await set(consentRef, url);
  };

const saveDocument =
  (tenantId: string) => async (visis: Visit, content: Blob, userId: string) => {
    try {
      const fileName = `visits-consent/${tenantId}/${
        visis.id
      }-${moment().format("YYYYMMDDTHHmmss")}.docx`;
      const storageRef = firebaseStorageRef(storage, `${fileName}`);

      const snapshot = await uploadBytes(storageRef, content, {
        contentType: content.type,
        customMetadata: {
          fileName,
          visitId: visis.id,
          userId,
          date: moment().format("YYYY-MM-DDTHH:mm:ss"),
        },
      });

      const downloadURL = await getDownloadURL(snapshot.ref);

      return downloadURL;
    } catch (error: any) {
      console.error("Full error:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Server response:", error.customData);
      throw error;
    }
  };

export const VisitRepository = (tenantId: string) => ({
  getVisits: getVisits(tenantId),
  getVisitById: getVisitById(tenantId),
  createVisit: createVisit(tenantId),
  deleteVisit: deleteVisit(tenantId),
  rateVisit: rateVisit(tenantId),
  editVisit: editVisit(tenantId),
  changeState: changeState(tenantId),
  toggleService: toggleService(tenantId),
  setPrimaryConsent: setPrimaryConsent(tenantId),
  setSecondaryConsent: setSecondaryConsent(tenantId),
  saveDocument: saveDocument(tenantId),
  setUrlConsent: setUrlConsent(tenantId),
});
