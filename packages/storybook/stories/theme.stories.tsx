import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ReactNode } from "react";

const docs = `### Overview
Theme stories surface the color tokens that power the app shell and component primitives.

This story follows the Storybook theme toggle and reads directly from \`packages/web/app/globals.css\`.

### Included tokens
- Semantic surfaces and foreground pairs.
- Feedback, utility, sidebar, and brand tokens.
- One shared canvas that updates with the theme switcher.

### Notes
- \`destructive-muted\` is included because it exists in the current theme file.
- Chart tokens are omitted because \`--chart-*\` values are not defined yet in \`globals.css\`.
`;

const semanticPairs = [
  { name: "Background", surface: "--background", ink: "--foreground" },
  { name: "Card", surface: "--card", ink: "--card-foreground" },
  { name: "Popover", surface: "--popover", ink: "--popover-foreground" },
  { name: "Primary", surface: "--primary", ink: "--primary-foreground" },
  { name: "Secondary", surface: "--secondary", ink: "--secondary-foreground" },
  { name: "Muted", surface: "--muted", ink: "--muted-foreground" },
  { name: "Accent", surface: "--accent", ink: "--accent-foreground" },
  { name: "Destructive", surface: "--destructive", ink: "--destructive-foreground" },
] as const;

const utilityTokens = [
  { name: "Border", token: "--border" },
  { name: "Destructive Muted", token: "--destructive-muted" },
  { name: "Input", token: "--input" },
  { name: "Ring", token: "--ring" },
] as const;

const sidebarPairs = [
  { name: "Sidebar", surface: "--sidebar", ink: "--sidebar-foreground" },
  { name: "Sidebar primary", surface: "--sidebar-primary", ink: "--sidebar-primary-foreground" },
  { name: "Sidebar accent", surface: "--sidebar-accent", ink: "--sidebar-accent-foreground" },
] as const;

const sidebarTokens = [
  { name: "Sidebar border", token: "--sidebar-border" },
  { name: "Sidebar ring", token: "--sidebar-ring" },
] as const;

const brandPairs = [
  { name: "Brand", surface: "--brand", ink: "--brand-foreground" },
  { name: "Brand secondary", token: "--brand-secondary" },
  { name: "Brand tertiary", token: "--brand-tertiary" },
] as const;

const brandScale = [
  { name: "50", token: "--color-brand-50" },
  { name: "100", token: "--color-brand-100" },
  { name: "200", token: "--color-brand-200" },
  { name: "300", token: "--color-brand-300" },
  { name: "400", token: "--color-brand-400" },
  { name: "500", token: "--color-brand-500" },
  { name: "600", token: "--color-brand-600" },
  { name: "700", token: "--color-brand-700" },
  { name: "800", token: "--color-brand-800" },
  { name: "900", token: "--color-brand-900" },
  { name: "950", token: "--color-brand-950" },
] as const;

function cssVar(token: string) {
  return `var(${token})`;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-mono text-xs font-medium tracking-widest text-muted-foreground uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

function PairSwatch({ name, surface, ink }: { name: string; surface: string; ink: string }) {
  return (
    <div className="space-y-1.5">
      <div className="overflow-hidden rounded-md border border-border/70 bg-background">
        <div
          className="flex h-14 items-center justify-center text-xs font-medium"
          style={{
            backgroundColor: cssVar(surface),
            color: cssVar(ink),
          }}
        >
          Aa
        </div>
      </div>
      <p className="font-mono text-xs tracking-wide text-foreground uppercase">{name}</p>
    </div>
  );
}

function SolidSwatch({ name, token }: { name: string; token: string }) {
  return (
    <div className="space-y-1.5">
      <div className="overflow-hidden rounded-md border border-border/70 bg-background">
        <div
          className="h-14"
          style={{
            backgroundColor: cssVar(token),
          }}
        />
      </div>
      <p className="font-mono text-xs tracking-wide text-foreground uppercase">{name}</p>
    </div>
  );
}

function BrandScaleStrip() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-11">
      {brandScale.map((token) => (
        <div key={token.name} className="space-y-1.5">
          <div className="overflow-hidden rounded-md border border-border/70 bg-background">
            <div
              className="h-12"
              style={{
                backgroundColor: cssVar(token.token),
              }}
            />
          </div>
          <p className="font-mono text-xs tracking-wide text-foreground uppercase">{token.name}</p>
        </div>
      ))}
    </div>
  );
}

function ThemeShowcase() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-foreground">Theme</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Compact token audit for the app theme. Use the Storybook theme toggle to switch modes.
          </p>
        </div>
      </div>

      <Section title="Semantic pairs">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
          {semanticPairs.map((token) => (
            <PairSwatch
              key={token.name}
              name={token.name}
              surface={token.surface}
              ink={token.ink}
            />
          ))}
        </div>
      </Section>

      <div className="grid gap-8">
        <div className="space-y-8">
          <Section title="Utility">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {utilityTokens.map((token) => (
                <SolidSwatch key={token.name} name={token.name} token={token.token} />
              ))}
            </div>
          </Section>

          <Section title="Sidebar">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {sidebarPairs.map((token) => (
                  <PairSwatch
                    key={token.name}
                    name={token.name}
                    surface={token.surface}
                    ink={token.ink}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {sidebarTokens.map((token) => (
                  <SolidSwatch key={token.name} name={token.name} token={token.token} />
                ))}
              </div>
            </div>
          </Section>

          <Section title="Brand">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {brandPairs.map((token) =>
                  "surface" in token ? (
                    <PairSwatch
                      key={token.name}
                      name={token.name}
                      surface={token.surface}
                      ink={token.ink}
                    />
                  ) : (
                    <SolidSwatch key={token.name} name={token.name} token={token.token} />
                  ),
                )}
              </div>
              <BrandScaleStrip />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

const meta = {
  title: "Foundations/Theme",
  component: ThemeShowcase,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    controls: {
      disable: true,
    },
    docs: {
      description: {
        component: docs,
      },
    },
  },
} satisfies Meta<typeof ThemeShowcase>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Theme: Story = {
  render: () => <ThemeShowcase />,
};
