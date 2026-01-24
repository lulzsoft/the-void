import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                "void-black": "var(--void-black)",
                "void-panel": "var(--void-panel)",
                "tech-cyan": "var(--tech-cyan)",
                "alert-amber": "var(--alert-amber)",
                "critical-red": "var(--critical-red)",
                "structure-grey": "var(--structure-grey)",
                "stark-white": "var(--stark-white)",
                "silver": "var(--silver)",
                "deep-crimson": "var(--deep-crimson)",
                "active-green": "var(--active-green)",
                "abyssal-blue": "var(--abyssal-blue)",
            },
            fontFamily: {
                display: ["var(--font-bodoni)", "serif"],
                mono: ["var(--font-jetbrains)", "monospace"],
            },
            animation: {
                "spin-slow": "spin 8s linear infinite",
                "float": "float 6s ease-in-out infinite",
                "float-delayed": "float 6s ease-in-out 3s infinite",
                "scan": "scanline 8s linear infinite",
            },
            keyframes: {
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-20px)" },
                },
                scanline: {
                    "0%": { transform: "translateY(-100%)" },
                    "100%": { transform: "translateY(100%)" },
                }
            },
        },
    },
    plugins: [],
};
export default config;
