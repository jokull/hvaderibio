export const AVAILABLE_DAYS = ["0", "1", "2", "3"];

const WEEKDAYS = ["sunnudag", "mánudag", "þriðjudag", "miðvikudag", "fimmtudag", "föstudag", "laugardag"];

export const get_day_label = (day: string) => {
  const date = new Date();
  date.setDate(date.getDate() + parseInt(day));

  if (day === "0") return "í dag";
  if (day === "1") return "á morgun";

  return WEEKDAYS[date.getDay()];
};
