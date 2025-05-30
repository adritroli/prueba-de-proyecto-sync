"use client";

import DefaultLayout from "@/config/layout";
import { Toaster, toast } from "sonner";

import { Button } from "@/components/ui/button";

export default function CalendarPage() {
  return (
    <DefaultLayout>
      <div>
        <Toaster position="top-right" richColors />
        <Button onClick={() => toast.error("My first toast")}>
          Give me a toast
        </Button>
      </div>
    </DefaultLayout>
  );
}
