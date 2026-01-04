import { defineStore } from "pinia";
import type {
  PaymentCreate,
  Visit,
  VisitCreate,
} from "../../domain/visit.model";
import moment from "moment";
import { auth } from "@/app/config/firebase";

type State = {
  form: Omit<VisitCreate & { id?: string }, "date" | "dateModified">;
  mode: "create" | "edit";
};

export const useFormStore = defineStore("visitForm", {
  state: (): State => {
    const userId = auth.currentUser?.uid || "1";
    return {
      form: {
        petName: "",
        color: "",
        ownerName: "",
        cutType: "",
        phoneNumber: "",
        price: 0,
        createdByUid: userId,
        payments: [],
        race: "",
        state: "PENDIENTE",
        feedback: "",
        hourOfDelivery: "",
        observation: "",
      },
      mode: "create",
    };
  },
  actions: {
    setForm(form: Visit) {
      this.form = {
        id: form.id,
        color: form.color,
        petName: form.petName,
        ownerName: form.ownerName,
        cutType: form.cutType,
        phoneNumber: form.phoneNumber,
        price: form.price,
        createdByUid: form.createdByUid,
        payments: form.payments ?? [],
        race: form.race,
        state: form.state,
        feedback: form.feedback,
        hourOfDelivery: moment(form.hourOfDelivery).isValid()
          ? moment(form.hourOfDelivery).format("HH:mm")
          : "",
        observation: form.observation,
      };
    },
    setMode(mode: "create" | "edit") {
      this.mode = mode;
    },
    addPayment(payment: PaymentCreate) {
      this.form.payments.push(payment);
    },
    removePayment(index: number) {
      this.form.payments.splice(index, 1);
    },
    resetForm() {
      const userId = auth.currentUser?.uid || "1";
      this.form = {
        petName: "",
        color: "",
        ownerName: "",
        cutType: "",
        phoneNumber: "",
        price: 0,
        createdByUid: userId,
        payments: [],
        race: "",
        state: "PENDIENTE",
        feedback: "",
        hourOfDelivery: "",
        observation: "",
      };
      this.mode = "create";
    },
  },
  getters: {
    toSend(state) {
      return { ...state.form };
    },
  },
});
