"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarDays, ArrowLeft } from "lucide-react";

export default function AgendaLayout({
  lista,
  calendario,
}: {
  lista: React.ReactNode;
  calendario: React.ReactNode;
}) {
  const [verCalendario, setVerCalendario] = useState(false);

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start">
      <div className={`min-w-0 flex-1 flex-col gap-6 ${verCalendario ? "hidden md:flex" : "flex"}`}>
        <Button
          variant="outline"
          size="sm"
          className="w-fit md:hidden"
          onClick={() => setVerCalendario(true)}
        >
          <CalendarDays className="h-4 w-4" /> Ver agenda
        </Button>
        {lista}
      </div>
      <div className={`flex-col gap-3 md:flex md:w-80 md:shrink-0 ${verCalendario ? "flex" : "hidden"}`}>
        <Button
          variant="outline"
          size="sm"
          className="w-fit md:hidden"
          onClick={() => setVerCalendario(false)}
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        {calendario}
      </div>
    </div>
  );
}
