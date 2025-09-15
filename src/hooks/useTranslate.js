import { useState } from "react";

export function useTranslate() {
  const [translated, setTranslated] = useState("");

  const translate = async (text, targetLang) => {
    // If no text, just return
    if (!text) return;

    // If language is English, skip translation
    if (targetLang === "en") {
      setTranslated(text);
      return;
    }

    try {
      const res = await fetch("https://libretranslate.com/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: text,
          source: "en", // assume original listings are in English
          target: targetLang,
          format: "text"
        })
      });

      const data = await res.json();
      setTranslated(data.translatedText);
    } catch (error) {
      console.error("Translation failed:", error);
      setTranslated(text); // fallback to original
    }
  };

  return { translated, translate };
}
