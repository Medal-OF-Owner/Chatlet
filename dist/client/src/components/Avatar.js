import { jsx as _jsx } from "same-runtime/dist/jsx-runtime";
export function Avatar({ src, nickname, size = "md", onClick, className = "" }) {
    const sizes = {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-12 h-12 text-base",
    };
    const getInitials = (nick) => {
        return nick
            .split(" ")
            .map((word) => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };
    const getColorFromNickname = (nick) => {
        const colors = [
            "bg-blue-500",
            "bg-red-500",
            "bg-green-500",
            "bg-purple-500",
            "bg-pink-500",
            "bg-yellow-500",
            "bg-indigo-500",
            "bg-cyan-500",
        ];
        const index = nick.charCodeAt(0) % colors.length;
        return colors[index];
    };
    if (src) {
        return (_jsx("div", { className: `${sizes[size]} rounded-full overflow-hidden flex-shrink-0 ${className}`, onClick: onClick, children: _jsx("img", { src: src, alt: nickname, className: "w-full h-full object-cover" }) }));
    }
    return (_jsx("div", { className: `${sizes[size]} ${getColorFromNickname(nickname)} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`, onClick: onClick, children: getInitials(nickname) }));
}
