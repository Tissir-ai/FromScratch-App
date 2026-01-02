"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date?: Date;
  onSelect?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  disablePastDates?: boolean;
}

export function DatePicker({
  date,
  onSelect,
  placeholder = "Pick a date",
  className,
  disabled = false,
  disablePastDates = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Get yesterday's date to disable all dates before today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-8 text-xs",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-3 w-3" />
          {date ? (
            format(date, "PPP")
          ) : (
            <span className="line-through text-muted-foreground">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            onSelect?.(selectedDate);
            setOpen(false);
          }}
          disabled={disablePastDates ? { before: today } : undefined}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
