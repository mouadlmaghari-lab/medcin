"use client";

import { useEffect, useState } from "react";
import { AssistantSidebar } from "@/components/layouts/AssistantSidebar";

export default function AssistantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    document.body.classList.add("theme-assistant");
    return () => document.body.classList.remove("theme-assistant");
  }, []);

  return (
    <div className="theme-assistant flex h-full overflow-hidden">
      <AssistantSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
      />
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
