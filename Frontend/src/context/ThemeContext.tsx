import React, { createContext, useContext, useState, useEffect } from "react";

export type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: "dark", // 👈 Промени тука на "dark"
    toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    // 👇 Промени началната стойност на "dark"
    const [theme, setTheme] = useState<Theme>("dark");

    useEffect(() => {
        // Запази темата в localStorage
        const savedTheme = localStorage.getItem("theme") as Theme;
        if (savedTheme) {
            setTheme(savedTheme);
        }

        // Ако няма запазена тема, провери system preference
        else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            setTheme("dark");
        }
    }, []);

    useEffect(() => {
        // Задай атрибута на HTML и запази в localStorage
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);

        // Опционално: Промени meta theme-color
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute(
                "content",
                theme === "dark" ? "#0f172a" : "#ffffff"
            );
        }
    }, [theme]);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);