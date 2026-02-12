"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function AppPreloader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [initialShown, setInitialShown] = useState(false);

  useEffect(() => {
    if (initialShown) {
      return;
    }

    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setInitialShown(true);
    }, 250);

    return () => clearTimeout(timer);
  }, [pathname, initialShown]);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-12 w-12">
          <span className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <span className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary border-r-accent" />
        </div>
        <p className="text-sm font-medium text-primary">იტვირთება...</p>
      </div>
    </div>
  );
}
