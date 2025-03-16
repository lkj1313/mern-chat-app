import { format, isToday } from "date-fns";
import { ko } from "date-fns/locale";

export function formatLastMessageTime(dateString: string | null) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  return isToday(date)
    ? format(date, "a hh:mm", { locale: ko })
    : format(date, "M월 d일", { locale: ko });
}
