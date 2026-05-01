"use client";

import { useEffect, useState } from "react";
import { DoctorSidebar } from "@/components/layouts/DoctorSidebar";
import { DoctorHeader } from "@/components/layouts/DoctorHeader";

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    document.body.classList.add("theme-doctor");
    return () => document.body.classList.remove("theme-doctor");
  }, []);

  return (
    <div className="theme-doctor flex h-full overflow-hidden">
      <DoctorSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
      />
      <main className="flex flex-1 flex-col overflow-hidden">
        <DoctorHeader />
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
