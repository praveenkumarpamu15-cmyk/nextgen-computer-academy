import React from "react";
import { Helmet } from "react-helmet-async";
import { useApp } from "@/context/AppContext";

/**
 * SEO — Wraps react-helmet-async for per-page meta management.
 * Reads defaults from the site content singleton so the owner can edit SEO
 * copy, OG image and canonical URL from the admin panel.
 */
export default function SEO({
  title,
  description,
  image,
  path = "",
  type = "website",
  structuredData = null,
  keywords,
}) {
  const { content } = useApp();
  const seo = content?.seo || {};
  const finalTitle = title || seo.site_title || "NextGen Computer Academy";
  const finalDesc = description || seo.site_description || "";
  const finalImage = image || seo.og_image || "";
  const base = (seo.canonical_url || "").replace(/\/$/, "");
  const url = base ? `${base}${path.startsWith("/") ? path : `/${path}`}` : undefined;
  const finalKeywords = keywords || seo.site_keywords || "";

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDesc} />
      {finalKeywords && <meta name="keywords" content={finalKeywords} />}
      {url && <link rel="canonical" href={url} />}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="NextGen Computer Academy" />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDesc} />
      {finalImage && <meta property="og:image" content={finalImage} />}
      {url && <meta property="og:url" content={url} />}
      <meta property="og:locale" content="en_IN" />
      <meta property="og:locale:alternate" content="te_IN" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDesc} />
      {finalImage && <meta name="twitter:image" content={finalImage} />}
      {seo.twitter_handle && <meta name="twitter:site" content={seo.twitter_handle} />}

      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
