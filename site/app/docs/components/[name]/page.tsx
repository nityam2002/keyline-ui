import { notFound } from "next/navigation";
import { DocPage } from "@site/components/doc-page";
import { InstallCommand } from "@site/components/install-command";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { ReferenceTable } from "@site/components/reference-table";
import type { TocGroup } from "@site/components/page-toc";
import { CONTENT } from "@site/content/components";
import { apiPage, type ApiPage } from "@site/lib/api";
import {
  attributeMeaning as meaningOf,
  cssVariableMeaning,
  kebab,
  otherParts,
  pageRows,
  PARTS_API_LEDE,
  propRows,
} from "@site/lib/component-page";
import { componentMetadata } from "@site/lib/seo";

// One page per component, generated from its item: the metadata (title, when to use it), the install command, and
// the API, data-attribute and CSS-variable tables from site/generated/api/<name>.json (pnpm docs:api, drift-checked).
// The prose and the example sections come from site/content/components/<name>.tsx.

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(CONTENT).map((name) => ({ name }));
}

type Params = { params: Promise<{ name: string }> };

export async function generateMetadata({ params }: Params) {
  const { name } = await params;
  const content = CONTENT[name];
  if (!content) return {};
  const api = apiPage(name);
  return componentMetadata(content.seoTitle ?? content.title ?? api.title, content.seo, name);
}

function attributeMeaning(name: string, api: ApiPage) {
  const m = meaningOf(name, api);
  return "mirrors" in m ? (
    <>
      Mirrors the <code>{m.mirrors}</code> prop.
    </>
  ) : (
    m.text
  );
}

const code = (values: string[]) =>
  values.length ? values.map((v, i) => [i ? ", " : "", <code key={v}>{v}</code>]) : "—";

export default async function ComponentPage({ params }: Params) {
  const { name } = await params;
  const content = CONTENT[name];
  if (!content) notFound();
  const api = apiPage(name);
  const title = content.title ?? api.title;
  const rows: Prop[] = pageRows(api, content.props);
  const others = otherParts(api);

  const kept = content.toc.filter((g) => g.label !== "Setup" && g.label !== "Reference");
  const extraReference = content.toc.find((g) => g.label === "Reference")?.items.filter((i) => i.id !== "props") ?? [];
  const toc: TocGroup[] = [
    {
      label: "Setup",
      items: [
        ...(api.whenToUse ? [{ id: "when-to-use", label: "When to use" }] : []),
        { id: "installation", label: "Installation" },
        { id: "usage", label: "Usage" },
      ],
    },
    ...kept,
    {
      label: "Reference",
      items: [
        { id: "props", label: "Props" },
        ...(others.length ? [{ id: "parts-api", label: "Parts API" }] : []),
        ...(api.attributes.length ? [{ id: "data-attributes", label: "Data attributes" }] : []),
        ...(api.cssVariables.length ? [{ id: "css-variables", label: "CSS variables" }] : []),
        ...extraReference,
      ],
    },
  ];

  return (
    <DocPage name={title} toc={toc}>
      <h1>{title}</h1>
      {content.lede}

      {api.whenToUse ? (
        <>
          <h2 id="when-to-use">When to use</h2>
          <p data-testid="when-to-use">{api.whenToUse}</p>
        </>
      ) : null}

      <h2 id="installation">Installation</h2>
      <InstallCommand item={name} />
      {content.install}

      <h2 id="usage">Usage</h2>
      {content.usage}

      {content.examples}

      <h2 id="props">Props</h2>
      <PropsReference label={`${title} props`} props={rows} />

      {others.length ? (
        <>
          <h3 id="parts-api">Parts API</h3>
          <p>{PARTS_API_LEDE}</p>
          {others.map((p) => (
            <section key={p.name} aria-labelledby={`api-${kebab(p.name)}`}>
              <h4 id={`api-${kebab(p.name)}`}>
                <code>{p.name}</code>
              </h4>
              {p.description ? <p className="s-small">{p.description}</p> : null}
              <PropsReference label={`${p.name} props`} props={propRows(p, [])} />
            </section>
          ))}
        </>
      ) : null}

      {api.attributes.length ? (
        <>
          <h3 id="data-attributes">Data attributes</h3>
          <ReferenceTable
            label={`${title} data attributes`}
            head={["Attribute", "Values", "Meaning"]}
            rows={api.attributes.map((a) => ({
              name: <code>{a.name}</code>,
              value: code(a.values),
              description: attributeMeaning(a.name, api),
            }))}
          />
        </>
      ) : null}

      {api.cssVariables.length ? (
        <>
          <h3 id="css-variables">CSS variables</h3>
          <ReferenceTable
            label={`${title} CSS variables`}
            head={["Variable", "Values it sets", "Where"]}
            rows={api.cssVariables.map((v) => ({
              name: <code>{v.name}</code>,
              value: code(v.values),
              description: cssVariableMeaning(v.name, name),
            }))}
          />
        </>
      ) : null}

      {content.reference}
    </DocPage>
  );
}
