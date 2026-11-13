// Base UI's wrapper contract, asserted for each exported part (after base-ui's describeConformance). A Keyline
// part is a Base UI part with Keyline's look, so it must accept everything the Base UI part accepts:
//
//   forwards-props       unknown props reach the DOM element
//   ref                  `ref` reaches the element
//   render-element       `render={<el />}` replaces the element and keeps the part's props
//   render-function      `render={(props) => <el {...props} />}` does the same
//   render-merges        the render element's ref and className merge with the part's own
//   class-name           a string `className` is applied
//   class-name-state     a function `className` receives the part's state, and its result is applied
//   style-state          a function `style` receives the part's state, and its result is applied
//   data-slot            the element carries the part's `data-slot`
//   native-button        `nativeButton={false}` with a non-button render element keeps button semantics (role
//                        button, and the part's tab index)
import * as React from "react";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

export const ASSERTIONS = [
  "forwards-props",
  "ref",
  "render-element",
  "render-function",
  "render-merges",
  "class-name",
  "class-name-state",
  "style-state",
  "data-slot",
  "native-button",
] as const;
export type Assertion = (typeof ASSERTIONS)[number];

interface ConformantProps {
  render?: React.ReactElement | ((props: Record<string, unknown>) => React.ReactNode) | undefined;
  ref?: React.Ref<unknown> | undefined;
  className?: string | ((state: unknown) => string | undefined) | undefined;
  style?: React.CSSProperties | ((state: unknown) => React.CSSProperties | undefined) | undefined;
  nativeButton?: boolean | undefined;
  "data-testid"?: string | undefined;
  [prop: string]: unknown;
}

export interface Part {
  /** The part with the fewest props that renders it. */
  element: React.ReactElement<ConformantProps>;
  /** The element the forwarded ref is an instance of. */
  refInstanceof: abstract new (...args: never[]) => unknown;
  /** The part's `data-slot`. */
  slot: string;
  /** The part renders a button and accepts `nativeButton`. */
  button?: boolean | undefined;
  /** The button's tab index under `nativeButton={false}`: -1 for a cell Base UI keeps out of the tab order (a
   *  combobox's clear, caret and chip-remove cells are reached from the input). Default 0. */
  buttonTabIndex?: number | undefined;
  /** Puts the part in the context it needs (its Root, a Provider); defaults to rendering it alone. */
  wrap?: ((part: React.ReactNode) => React.ReactNode) | undefined;
  /** Resolves once the part's element is in the document, for a part that renders after an event (an avatar's image
   *  appears once it has loaded). Default: the part renders on mount. */
  ready?: (() => Promise<void>) | undefined;
}

const TEST_ID = "part";

async function mount(part: Part, props: ConformantProps) {
  const element = React.cloneElement(part.element, props);
  const screen = await render(<main>{part.wrap ? part.wrap(element) : element}</main>);
  await part.ready?.();
  return screen;
}

function byTestId(id: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-testid="${id}"]`);
  if (!el) throw new Error(`no element with data-testid="${id}"`);
  return el;
}

/** Runs the contract over every part of `component`; `parts` is keyed by the exported part name. */
export function describeConformance(component: string, parts: Record<string, Part>): void {
  describe(`${component}: Base UI wrapper contract`, () => {
    for (const [name, part] of Object.entries(parts)) {
      describe(name, () => {
        const check = (assertion: Assertion, body: () => Promise<void>) => it(assertion, body);
        // a button part renders its replacement as a button; nativeButton={false} with a div is tested apart
        const Element = part.button ? "button" : "div";
        const native = part.button ? { nativeButton: true } : {};

        check("forwards-props", async () => {
          await mount(part, { "data-testid": TEST_ID, lang: "fr", "data-probe": "kept" });
          const el = byTestId(TEST_ID);
          expect(el.getAttribute("lang")).toBe("fr");
          expect(el.getAttribute("data-probe")).toBe("kept");
        });

        check("ref", async () => {
          const ref = React.createRef<unknown>();
          await mount(part, { ref });
          expect(ref.current).toBeInstanceOf(part.refInstanceof);
        });

        check("render-element", async () => {
          await mount(part, {
            ...native,
            "data-probe": "kept",
            render: <Element data-testid={TEST_ID} data-own="own" />,
          });
          const el = byTestId(TEST_ID);
          expect(el.tagName).toBe(Element.toUpperCase());
          expect(el.getAttribute("data-probe")).toBe("kept");
          expect(el.getAttribute("data-own")).toBe("own");
          expect(el.getAttribute("data-slot")).toBe(part.slot);
        });

        check("render-function", async () => {
          await mount(part, {
            ...native,
            "data-probe": "kept",
            render: (props) => <Element {...props} data-testid={TEST_ID} />,
          });
          const el = byTestId(TEST_ID);
          expect(el.tagName).toBe(Element.toUpperCase());
          expect(el.getAttribute("data-probe")).toBe("kept");
          expect(el.getAttribute("data-slot")).toBe(part.slot);
        });

        check("render-merges", async () => {
          let partRef: unknown = null;
          let renderRef: unknown = null;
          await mount(part, {
            ...native,
            "data-testid": TEST_ID,
            className: "from-part",
            ref: (el: unknown) => {
              partRef = el;
            },
            render: (
              <Element
                className="from-render"
                ref={(el: unknown) => {
                  renderRef = el;
                }}
              />
            ),
          });
          const el = byTestId(TEST_ID);
          expect(el.classList.contains("from-part")).toBe(true);
          expect(el.classList.contains("from-render")).toBe(true);
          expect(partRef).toBe(el);
          expect(renderRef).toBe(el);
        });

        check("class-name", async () => {
          await mount(part, { "data-testid": TEST_ID, className: "from-part" });
          expect(byTestId(TEST_ID).classList.contains("from-part")).toBe(true);
        });

        check("class-name-state", async () => {
          let received: unknown;
          await mount(part, {
            "data-testid": TEST_ID,
            className: (state: unknown) => {
              received = state;
              return "from-state";
            },
          });
          expect(typeof received).toBe("object");
          expect(received).not.toBeNull();
          expect(byTestId(TEST_ID).classList.contains("from-state")).toBe(true);
        });

        check("style-state", async () => {
          let received: unknown;
          await mount(part, {
            "data-testid": TEST_ID,
            style: (state: unknown) => {
              received = state;
              return { outlineOffset: "7px" };
            },
          });
          expect(typeof received).toBe("object");
          expect(received).not.toBeNull();
          expect(byTestId(TEST_ID).style.outlineOffset).toBe("7px");
        });

        check("data-slot", async () => {
          await mount(part, { "data-testid": TEST_ID });
          expect(byTestId(TEST_ID).getAttribute("data-slot")).toBe(part.slot);
        });

        if (part.button) {
          check("native-button", async () => {
            await mount(part, { nativeButton: false, render: <div data-testid={TEST_ID} /> });
            const el = byTestId(TEST_ID);
            expect(el.tagName).toBe("DIV");
            expect(el.getAttribute("role")).toBe("button");
            expect(el.tabIndex).toBe(part.buttonTabIndex ?? 0);
          });
        }
      });
    }
  });
}
