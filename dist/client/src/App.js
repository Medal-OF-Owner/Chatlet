import { jsx as _jsx, jsxs as _jsxs } from "same-runtime/dist/jsx-runtime";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
function Router() {
    return (_jsxs(Switch, { children: [_jsx(Route, { path: "/", component: Home }), _jsx(Route, { path: "/login", component: Auth }), _jsx(Route, { path: "/signup", component: Auth }), _jsx(Route, { path: "/forgot-password", component: ForgotPassword }), _jsx(Route, { path: "/reset-password", component: ResetPassword }), _jsx(Route, { path: "/verify", component: VerifyEmail }), _jsx(Route, { path: "/room/:room", component: Chat }), _jsx(Route, { path: "/404", component: NotFound }), _jsx(Route, { component: NotFound })] }));
}
function App() {
    return (_jsx(ErrorBoundary, { children: _jsx(ThemeProvider, { defaultTheme: "dark", children: _jsxs(TooltipProvider, { children: [_jsx(Toaster, {}), _jsx(Router, {})] }) }) }));
}
export default App;
