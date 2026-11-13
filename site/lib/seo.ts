import type { Metadata } from "next";
import { SITE_ORIGIN } from "./registry";

export const SITE_NAME = "Keyline UI";

/** The share image for every page: Keyline's headline on the homepage land. The alt text says what it shows. */
const SHARE_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: "Keyline UI. Controls that fit together. React components for dense interfaces, on Base UI, installed from a shadcn registry.",
};

/** The canonical origin: package.json "homepage", the same origin the install commands and the registry use. A build
 *  without one (a fork) has no canonical address: the sitemap is empty and Next resolves metadata URLs itself. */
export const SITE_URL = SITE_ORIGIN;

/**
 * Whether search engines may index this build. Only the production deployment is indexed; previews, local runs and
 * forks stay out, so a second copy never competes with the real site. Set KEYLINE_SITE_ENV=production when building
 * the release deployment (docs/releasing.md); on Vercel, VERCEL_ENV says the same thing without configuration.
 * Read at build: every page is static, so the robots meta tag is decided when the page is rendered.
 */
export const INDEXABLE = (process.env["KEYLINE_SITE_ENV"] ?? process.env["VERCEL_ENV"]) === "production";

/**
 * One page's metadata: its title and description, the canonical URL, and the same title and description for shared
 * links. Next merges metadata shallowly, so a page that set openGraph itself would lose the layout's; this builds the
 * whole object per page instead, with the one share image (public/og.png, drawn by scripts/og-image.mjs).
 *
 * `title` goes through the root template ("%s · Keyline UI"); `absolute` skips it (the homepage).
 */
export function pageMetadata({
  title,
  description,
  path,
  absolute = false,
}: {
  title: string;
  description: string;
  path: string;
  absolute?: boolean;
}): Metadata {
  // Google cuts snippets at about 160 characters; fail the build rather than ship a truncated description
  if (description.length > 160)
    throw new Error(`${path}: meta description is ${description.length} characters (max 160)`);
  const full = absolute ? title : `${title} · ${SITE_NAME}`;
  // a docs page has its own card (app/og), drawn at build with its name and install command
  const image = path.startsWith("/docs/")
    ? { url: `/og${path}`, width: 1200, height: 630, alt: `${title}. ${description}` }
    : SHARE_IMAGE;
  return {
    title: absolute ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en",
      url: path,
      title: full,
      description,
      images: [image],
    },
    twitter: { card: "summary_large_image", title: full, description, images: [image] },
  };
}

/** A component page: titled by its name alone ("Combobox · Keyline UI"), as component docs are; the description
 *  carries what it is in React terms. */
export function componentMetadata(name: string, description: string, slug: string): Metadata {
  return pageMetadata({ title: name, description, path: `/docs/components/${slug}` });
}

/** What Keyline is, in one sentence: the root description and the WebSite structured data. */
export const SITE_DESCRIPTION =
  "React and TypeScript components for dense interfaces: toolbars, data tables, menus, inspectors and app shells. Built on Base UI, installed with the shadcn CLI.";

/** WebSite structured data for the homepage: the site's name and address, which Google uses for the site name in
 *  results. Nothing else is claimed here that the page doesn't show. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: "Keyline",
    url: `${SITE_URL ?? ""}/`,
    description: SITE_DESCRIPTION,
  };
}

/** Structured data for a component or block page (drift-ui): the source a reader installs is the registry item's
 *  JSON, TypeScript for React. Only what the page shows is claimed. DocPage renders it. */
export function sourceCodeJsonLd(page: { name: string; item: string; href: string; description: string }) {
  const origin = SITE_URL ?? "";
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: `${page.name} · ${SITE_NAME}`,
    description: page.description,
    url: `${origin}${page.href}`,
    codeRepository: `${origin}/r/${page.item}.json`,
    programmingLanguage: ["TypeScript", "React"],
    runtimePlatform: "React 19",
    license: "https://opensource.org/licenses/MIT",
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: `${origin}/` },
  };
}

/** JSON for a script of type application/ld+json, with `<` escaped so the text can never close the script (reui). */
export function stringifyJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
