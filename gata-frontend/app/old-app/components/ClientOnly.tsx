import type { ReactNode } from "react";

import { useHydrated } from "~/utils/hydrated";

type Props = {
   children: ReactNode;
   fallback?: ReactNode | null;
};

export function ClientOnly({ children, fallback = null }: Props) {
   return useHydrated() ? <>{children}</> : <>{fallback}</>;
}
