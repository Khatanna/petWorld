import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    userData: null as null | {
      uid: string;
      name: string;
      email: string;
      photoUrl: string;
      tenantId?: string;
    },
    loading: false,
  }),
  actions: {
    setUserData(data: {
      uid: string;
      name: string | null;
      email: string | null;
      photoUrl: string | null;
      tenantId: string;
    }) {
      this.userData = {
        uid: data.uid,
        name: data.name || "Sin nombre",
        email: data.email || "Sin correo",
        photoUrl: data.photoUrl || "",
        tenantId: data.tenantId,
      };
    },
    clearUserData() {
      this.userData = null;
    },
  },
});
