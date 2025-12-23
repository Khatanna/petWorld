import { defineStore } from "pinia";
import type { PaymentFB, Visit, VisitCreate } from "../../domain/visit.model";
import moment from "moment";
import { auth } from "@/app/config/firebase";

type State = {
  form: VisitCreate & { id?: string };
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
        date: moment().toISOString(true),
        createdByUid: userId,
        dateModified: moment().toISOString(true),
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
      console.log(form);
      this.form = {
        id: form.id,
        color: form.color,
        petName: form.petName,
        ownerName: form.ownerName,
        cutType: form.cutType,
        phoneNumber: form.phoneNumber,
        price: form.price,
        date: moment(form.date).toISOString(true),
        createdByUid: form.createdByUid,
        payments: form.payments ?? [],
        dateModified: moment().toISOString(true),
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
    addPayment(payment: PaymentFB) {
      this.form.payments.push(payment);
    },
    removePayment(index: number) {
      this.form.payments.splice(index, 1);
    },
    resetForm() {
      this.form = {
        petName: "",
        color: "",
        ownerName: "",
        cutType: "",
        phoneNumber: "",
        price: 0,
        date: new Date().toISOString(),
        createdByUid: "1",
        dateModified: new Date().toISOString(),
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
    toUpdate(state) {
      const { dateModified, ...rest } = state.form;
      return { ...rest, dateModified: new Date().toISOString() };
    },
  },
});
