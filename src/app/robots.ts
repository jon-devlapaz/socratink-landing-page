import type { MetadataRoute } from "next";
import { site } from "@/lib/content";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/ink-lab", "/ink-studies", "/positioning"],
      },
      {
        userAgent: [
          "ChatGPT-User",
          "GPTBot",
          "PerplexityBot",
          "ClaudeBot",
          "Claude-Web",
          "Applebot-Extended",
          "Google-Extended",
        ],
        allow: ["/", "/llms.txt", "/llms-full.txt"],
        disallow: ["/ink-lab", "/ink-studies", "/positioning"],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
