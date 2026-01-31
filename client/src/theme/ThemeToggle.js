// ThemeToggle.js
import { useThemeStore } from "./themeStore";

function ThemeToggle() {
  const { darkMode, toggleDarkMode } = useThemeStore();

  return (
    <button className={darkMode ? "btn-dark" : "btn-light"}
      onClick={toggleDarkMode}>
      {darkMode ? "🌙 야간 모드" : "☀️ 주간 모드"}
    </button>
  );
}

export default ThemeToggle;