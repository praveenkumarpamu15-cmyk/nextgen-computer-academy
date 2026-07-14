import React, { useEffect, useState } from "react";
import { galleryApi } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { ImageIcon } from "lucide-react";

const DEMO = [
  "https://images.pexels.com/photos/5427674/pexels-photo-5427674.jpeg",
  "https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg",
  "https://images.pexels.com/photos/8500342/pexels-photo-8500342.jpeg",
  "https://images.pexels.com/photos/8500346/pexels-photo-8500346.jpeg",
  "https://images.pexels.com/photos/5905445/pexels-photo-5905445.jpeg",
  "https://images.pexels.com/photos/8500360/pexels-photo-8500360.jpeg",
];

export default function Gallery() {
  const { lang } = useApp();
  const [items, setItems] = useState([]);

  useEffect(() => { galleryApi.list().then(setItems).catch(() => {}); }, []);

  const showItems = items.length > 0
    ? items.map(it => ({ url: galleryApi.imageUrl(it.id), caption: it.caption }))
    : DEMO.map((u, i) => ({ url: u, caption: "" }));

  return (
    <section id="gallery" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div>
            <div className="text-xs font-bold tracking-[0.2em] text-gold uppercase flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5" /> {lang === "te" ? "గ్యాలరీ" : "Gallery"}
            </div>
            <h2 className="mt-3 font-display text-4xl lg:text-5xl font-bold text-navy tracking-tight">
              {lang === "te" ? "మా క్లాస్‌రూమ్‌లు, మా విద్యార్థులు" : "Our classrooms, our students."}
            </h2>
            <div className="mt-4 w-16 h-1 bg-gold rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {showItems.map((it, i) => (
            <div
              key={i}
              data-testid={`gallery-item-${i}`}
              className={`zoom-wrap rounded-2xl overflow-hidden border border-slate-100 hover:border-gold/40 transition-colors ${i % 5 === 0 ? "row-span-2 aspect-square sm:aspect-auto" : "aspect-square"}`}
            >
              <img src={it.url} alt={it.caption || `Gallery ${i + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
