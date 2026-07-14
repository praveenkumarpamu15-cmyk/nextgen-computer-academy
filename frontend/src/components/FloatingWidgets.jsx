import React, { useState } from "react";
import { Phone, MessageCircle, Bot } from "lucide-react";
import { useApp } from "@/context/AppContext";
import ChatWidget from "@/components/ChatWidget";

export default function FloatingWidgets() {
  const { content, lang } = useApp();
  const [chatOpen, setChatOpen] = useState(false);
  const c = content?.contact || {};
  const call = `tel:${(c.phone || "").replace(/\s/g, "")}`;
  const wa = `https://wa.me/${(c.whatsapp || "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(lang === "te" ? "నమస్తే, నాకు కోర్సు గురించి తెలుసుకోవాలి" : "Hi, I want to know about your courses")}`;

  return (
    <>
      <div className="fixed right-4 bottom-4 sm:right-6 sm:bottom-6 z-50 flex flex-col items-end gap-3">
        <button
          data-testid="fab-chat"
          onClick={() => setChatOpen(true)}
          className="group flex items-center gap-2 px-4 py-3 rounded-full bg-navy text-white shadow-[0_20px_40px_-15px_rgba(10,35,66,0.4)] hover:bg-gold hover:text-black transition-colors animate-pulse-gold"
          aria-label="Open AI Chat"
        >
          <Bot className="w-5 h-5" />
          <span className="hidden sm:inline text-sm font-semibold">
            {lang === "te" ? "AI అసిస్టెంట్" : "AI Assistant"}
          </span>
        </button>
        <a
          data-testid="fab-whatsapp"
          href={wa}
          target="_blank"
          rel="noreferrer"
          className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_20px_40px_-15px_rgba(37,211,102,0.5)] hover:scale-110 transition-transform"
          aria-label="WhatsApp"
        >
          <MessageCircle className="w-6 h-6" fill="currentColor" strokeWidth={1.6} />
        </a>
        <a
          data-testid="fab-call"
          href={call}
          className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gold text-black flex items-center justify-center shadow-[0_20px_40px_-15px_rgba(201,162,39,0.6)] hover:scale-110 transition-transform"
          aria-label="Call"
        >
          <Phone className="w-6 h-6" fill="currentColor" strokeWidth={1.6} />
        </a>
      </div>
      <ChatWidget open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
