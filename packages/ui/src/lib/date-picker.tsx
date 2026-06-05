"use client";

import { format } from "date-fns";
import { ru as dateFnsRu } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { ru as dayPickerRu } from "react-day-picker/locale";

import { Button } from "./button";
import { Calendar } from "./calendar";
import { dateToIsoDate, isoDateToDate } from "./isoDate";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "./utils";

export type DatePickerProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  fromYear?: number;
  toYear?: number;
  /** When false (default), dates after today are disabled (e.g. birthdate). */
  allowFuture?: boolean;
};

export function DatePicker({
  id,
  value,
  onChange,
  disabled,
  placeholder = "Выберите дату",
  fromYear = 1900,
  toYear,
  allowFuture = false
}: DatePickerProps) {
  const currentYear = new Date().getFullYear();
  const endYear = toYear ?? (allowFuture ? currentYear + 10 : currentYear);
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => isoDateToDate(value), [value]);
  const startMonth = useMemo(() => new Date(fromYear, 0), [fromYear]);
  const endMonth = useMemo(() => new Date(endYear, 11), [endYear]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          data-empty={!selected}
          className={cn(
            "w-full !justify-start gap-2 px-3 font-normal data-[empty=true]:text-muted-foreground"
          )}
        >
          <CalendarIcon className="size-4 shrink-0 opacity-70" />
          <span className="min-w-0 flex-1 truncate text-left">
            {selected ? (
              format(selected, "PPP", { locale: dateFnsRu })
            ) : (
              placeholder
            )}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        data-slot="popover-content"
        className="w-auto p-0"
        align="start"
      >
        <Calendar
          mode="single"
          locale={dayPickerRu}
          selected={selected}
          onSelect={date => {
            onChange(date ? dateToIsoDate(date) : "");
            setOpen(false);
          }}
          defaultMonth={selected}
          captionLayout="dropdown"
          className="bg-popover"
          startMonth={startMonth}
          endMonth={endMonth}
          disabled={allowFuture ? undefined : { after: new Date() }}
        />
      </PopoverContent>
    </Popover>
  );
}
