import { jsx as _jsx } from "same-runtime/dist/jsx-runtime";
import { Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
function Spinner({ className, ...props }) {
    return (_jsx(Loader2Icon, { role: "status", "aria-label": "Loading", className: cn("size-4 animate-spin", className), ...props }));
}
export { Spinner };
