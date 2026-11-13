// Keyline's own oxlint rules, loaded through `jsPlugins` in .oxlintrc.json.
//
// no-radix-idioms keeps Radix and shadcn-default idioms out of the registry source. Keyline is built on Base UI,
// whose state lives in its own data attributes, and tone comes only from tokens (docs/design.md, "Colour
// hierarchy"), so none of these strings has a correct use in a component.

interface Node {
  type: string;
  value?: unknown;
  name?: unknown;
  source?: Node;
  cooked?: string | null;
  raw?: string;
}

interface Context {
  report: (diagnostic: { node: Node; message: string }) => void;
}

const BANNED_STRINGS: ReadonlyArray<readonly [RegExp, string]> = [
  [/data-\[state=/, "`data-[state=…]` is a Radix attribute; Base UI exposes state as its own data attributes."],
  [/--radix-/, "`--radix-*` variables do not exist under Base UI; use the Base UI variable for the same value."],
  [/(^|[\s"'`])dark:/, "`dark:` utilities are banned; tone comes from tokens, which already follow `.dark`."],
];

const RADIX_IMPORT = /^(radix-ui|@radix-ui\/)/;

function checkString(context: Context, node: Node, text: string) {
  for (const [pattern, message] of BANNED_STRINGS) {
    if (pattern.test(text)) context.report({ node, message });
  }
}

const noRadixIdioms = {
  meta: {
    type: "problem" as const,
    docs: { description: "Bans Radix idioms and `dark:` utilities in Keyline's registry source." },
  },
  create(context: Context) {
    return {
      Literal(node: Node) {
        if (typeof node.value === "string") checkString(context, node, node.value);
      },
      TemplateElement(node: Node) {
        const value = node.value as { raw?: string } | undefined; // TemplateElement.value is { raw, cooked }
        if (value?.raw) checkString(context, node, value.raw);
      },
      JSXText(node: Node) {
        if (typeof node.value === "string") checkString(context, node, node.value);
      },
      JSXAttribute(node: Node) {
        const name = node.name as Node | undefined; // JSXAttribute.name is a JSXIdentifier node
        if (name?.name === "asChild") {
          context.report({ node, message: "`asChild` is Radix composition; Base UI composes with `render`." });
        }
      },
      Identifier(node: Node) {
        if (node.name === "asChild") {
          context.report({ node, message: "`asChild` is Radix composition; Base UI composes with `render`." });
        }
      },
      ImportDeclaration(node: Node) {
        const source = node.source?.value;
        if (typeof source === "string" && RADIX_IMPORT.test(source)) {
          context.report({ node, message: "Radix imports are banned; Keyline builds on Base UI." });
        }
      },
    };
  },
};

export default {
  meta: { name: "keyline" },
  rules: { "no-radix-idioms": noRadixIdioms },
};
