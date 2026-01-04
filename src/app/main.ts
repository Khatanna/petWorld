import "@quasar/extras/material-icons/material-icons.css";
import "@quasar/extras/mdi-v7/mdi-v7.css";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { createPinia } from "pinia";
import { BottomSheet, Dialog, Notify, Quasar } from "quasar";
import quasarLang from "quasar/lang/es";
import "quasar/src/css/index.sass";
import { createApp } from "vue";

import moment from "moment";
import App from "./App.vue";
import router from "./router";

const myApp = createApp(App);

moment.updateLocale("es", {
  months:
    "Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre".split(
      "_",
    ),
  monthsShort:
    "Ene._Feb._Mar._Abr._May._Jun._Jul._Ago._Sept._Oct._Nov._Dec.".split("_"),
  weekdays: "Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado".split("_"),
  weekdaysShort: "Dom._Lun._Mar._Mié._Jue._Vie._Sáb.".split("_"),
  weekdaysMin: "Do_Lu_Ma_Mi_Ju_Vi_Sa".split("_"),
});

myApp.use(createPinia());
myApp.use(VueQueryPlugin);
myApp.use(router);
myApp.use(Quasar, {
  plugins: {
    Notify,
    Dialog,
    BottomSheet,
  },
  config: {
    brand: {
      primary: import.meta.env.VITE_PRIMARY_COLOR || "#1976D2",
    },
  },
  lang: quasarLang,
});

myApp.mount("#app");
