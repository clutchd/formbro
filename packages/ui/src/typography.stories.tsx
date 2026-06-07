import {
  TypographyH1,
  TypographyH2,
  TypographyInlineCode,
  TypographyP,
  displayFont,
  inlineCode,
  monoFont,
  tuiFont,
} from "./typography";

const docs = `### Overview
Typography exports reusable text components and class tokens.

Use it to keep headings, prose, inline code, and technical metadata consistent.

### API
- Components: \`TypographyH1\`, \`TypographyH2\`, \`TypographyP\`, and \`TypographyInlineCode\`.
- Class tokens: \`displayFont\`, \`monoFont\`, \`tuiFont\`, and \`inlineCode\`.
- Standard text element attributes like \`id\` and \`className\` are supported.

### Accessibility
- Preserve heading hierarchy in page composition.
- Use inline code only for short tokens and identifiers.

### Theming/tokens
- Headings use Manrope via \`font-display\`.
- Body text uses Inter through the default font family.
- Technical metadata uses Geist Mono with uppercase tracking.
`;

const fontSamples = [
  {
    name: "Manrope",
    role: "Display",
    token: "font-display",
    className: "font-display",
    sample: "Build serious workflows",
  },
  {
    name: "Geist Mono",
    role: "Mono",
    token: "font-mono",
    className: "font-mono tracking-wider",
    sample: "WORKSPACE_ID  RESPONSE_084  99.9% UPTIME",
  },
  {
    name: "Inter",
    role: "Default",
    token: "body default",
    className: "",
    sample: "FormBro keeps forms fast to build, easy to operate, and comfortable to answer.",
  },
] as const;

export default {
  title: "UI/Typography",
  id: "ui-typography",
  component: TypographyH1,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: docs,
      },
    },
  },
};

export const Basic = {
  render: () => (
    <article className="w-full max-w-xl">
      <TypographyH1>Build serious workflows</TypographyH1>
      <TypographyP>
        FormBro keeps forms fast to build, easy to operate, and comfortable for respondents.
      </TypographyP>
      <TypographyH2>Developer defaults</TypographyH2>
      <TypographyP>
        Use <TypographyInlineCode>formId</TypographyInlineCode> and{" "}
        <TypographyInlineCode>workspaceId</TypographyInlineCode> to connect records.
      </TypographyP>
    </article>
  ),
};

export const ClassTokens = {
  render: () => (
    <div className="grid w-full max-w-xl gap-4">
      <p className={displayFont}>Display font token</p>
      <p className={monoFont}>Mono font token</p>
      <p className={tuiFont}>Technical UI token</p>
      <code className={inlineCode}>inlineCode</code>
    </div>
  ),
};

export const FontFamilies = {
  render: () => (
    <div className="grid w-full max-w-3xl gap-4">
      {fontSamples.map((font) => (
        <section key={font.name} className="rounded-lg border bg-card p-6 text-card-foreground">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="border px-2 py-1 font-mono text-xs tracking-wider text-muted-foreground uppercase">
              {font.role}
            </span>
            <span className="border px-2 py-1 font-mono text-xs tracking-wider text-muted-foreground">
              {font.token}
            </span>
          </div>
          <h3 className={`${font.className} text-3xl font-bold tracking-tight`}>{font.name}</h3>
          <p className={`${font.className} mt-3 text-lg`}>{font.sample}</p>
          <div className={`${font.className} mt-4 grid gap-1 text-sm`}>
            <p className="font-normal">Regular: Aa Bb Cc 0123456789</p>
            <p className="font-medium">Medium: Aa Bb Cc 0123456789</p>
            <p className="font-semibold">Semibold: Aa Bb Cc 0123456789</p>
            <p className="font-bold">Bold: Aa Bb Cc 0123456789</p>
          </div>
        </section>
      ))}
    </div>
  ),
};
