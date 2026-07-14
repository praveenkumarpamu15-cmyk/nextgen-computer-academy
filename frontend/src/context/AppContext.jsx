import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { contentApi, coursesApi } from "@/lib/api";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("ngca_lang") || "en");
  const [content, setContent] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { localStorage.setItem("ngca_lang", lang); }, [lang]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [c, cs] = await Promise.all([contentApi.get(), coursesApi.list()]);
      setContent(c);
      setCourses(cs);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const t = useCallback((obj, fallback = "") => {
    if (!obj) return fallback;
    if (typeof obj === "string") return obj;
    return obj[lang] || obj.en || fallback;
  }, [lang]);

  const toggleLang = () => setLang(l => (l === "en" ? "te" : "en"));

  return (
    <AppContext.Provider value={{ lang, setLang, toggleLang, content, courses, loading, refresh, t }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
