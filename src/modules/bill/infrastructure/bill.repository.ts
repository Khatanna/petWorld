import { db } from "@/app/config/firebase";
import {
  endBefore,
  get,
  orderByChild,
  query,
  ref,
  startAt,
} from "firebase/database";
import moment from "moment";

type BillFirebase = {
  amount: string;
  concept: string;
  date: string;
  userUid: string;
};

const mapBillFromFirebase = (key: string, bill: BillFirebase) => {
  return {
    id: key,
    amount: Number(bill.amount) ?? 0,
    concept: bill.concept,
    date: moment(bill.date),
    userUid: bill.userUid,
  };
};

const getBills =
  (tenantId: string) =>
  async (params: {
    date: { from: moment.Moment; to: moment.Moment };
    userId?: string;
  }) => {
    const { date, userId } = params;
    const root = ref(db, `bills/${tenantId}/${userId ?? ""}`);
    const billsQuery = query(
      root,
      orderByChild("date"),
      startAt(date.from.startOf("day").format("YYYY-MM-DDTHH:mm:ss")),
      endBefore(date.to.endOf("day").format("YYYY-MM-DDTHH:mm:ss")),
    );
    const snapshot = await get(billsQuery);

    if (snapshot.exists()) {
      return Object.entries<BillFirebase>(snapshot.val())
        .map(([key, val]) => mapBillFromFirebase(key, val))
        .reverse();
    } else {
      return [];
    }
  };

export const BillRepository = (tenantId: string) => ({
  getBills: getBills(tenantId),
});
