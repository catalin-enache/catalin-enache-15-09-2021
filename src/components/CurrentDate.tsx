import { format } from "date-fns";
import { useState, useEffect } from "react";

export default function CurrentDate() {
  const [date, setDate] = useState<Date | null>(null);
  useEffect(() => {
    setDate(new window.Date());
  }, []);
  return <time>{date && format(date, "LLLL d, yyyy")}</time>;
}
