import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("lang", lng); // persist
  };

  return (
    <div className="flex gap-2">
      <button onClick={() => changeLanguage("en")}>EN</button>
      <button onClick={() => changeLanguage("hi")}>हिंदी</button>
      <button onClick={() => changeLanguage("te")}>తెలుగు</button>
    </div>
  );
}
