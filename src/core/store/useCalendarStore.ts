import moment from "moment";
import { defineStore } from "pinia";

type CalendarState = {
  selectedDate: moment.Moment;
  range: {
    start: moment.Moment;
    end: moment.Moment;
  };
};

export const useCalendarStore = defineStore("calendar", {
  state: (): CalendarState => ({
    selectedDate: moment(),
    range: {
      start: moment().startOf("month"),
      end: moment(),
    },
  }),
  actions: {
    setSelectedDate(date: moment.Moment) {
      this.selectedDate = date;
    },
    setRange(start: moment.Moment, end: moment.Moment) {
      this.range = { start, end };
    },
    clear() {
      this.range = {
        start: moment().startOf("month"),
        end: moment(),
      };
      this.selectedDate = moment();
    },
  },
  getters: {
    isDirty: (state) => {
      return (
        !state.selectedDate.isSame(moment(), "day") ||
        !state.range.start.isSame(moment().startOf("month"), "day") ||
        !state.range.end.isSame(moment(), "day")
      );
    },
    days: (state) => {
      const daysArray = [];

      let current = state.range.start.clone();
      const end = state.range.end.clone();

      while (current.isSameOrBefore(end, "day")) {
        daysArray.push(current.clone());
        current.add(1, "day");
      }

      return daysArray;
    },
  },
});
