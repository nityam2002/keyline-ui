import type * as React from "react";
import type { Prop } from "@site/components/props-reference";
import type { TocGroup } from "@site/components/page-toc";

/**
 * The hand-written part of a component page (site/content/components/<name>.tsx): the prose and the example
 * sections the generator cannot derive. Everything else on the page comes from the item: the title, when to use it,
 * the install command, the API, data-attribute and CSS-variable tables (site/generated/api/<name>.json).
 */
export type ComponentContent = {
  /** The page's h1, when it names more than the item's title ("Field and form"). */
  title?: string;
  /** The `<title>`, when it differs from the h1. */
  seoTitle?: string;
  /** The meta description. */
  seo: string;
  /** The page's sections; Setup and Reference are rebuilt by the generated page, the rest are kept. */
  toc: TocGroup[];
  /** Hand-written descriptions for props, by name. Rows naming no prop the types declare (props passed through to
   * Base UI that the page wants to call out) are listed after the generated ones. */
  props: Prop[];
  /** The lede paragraph and the lead example. */
  lede: React.ReactNode;
  /** Anything to say under the install command. */
  install?: React.ReactNode;
  usage: React.ReactNode;
  /** The example sections, each with its own heading. */
  examples: React.ReactNode;
  /** Notes after the props table: parts, keyboard, Base UI links. */
  reference: React.ReactNode;
};
