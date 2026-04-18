import * as description from "./elements/description";
import * as divider from "./elements/divider";
import * as email from "./elements/email";
import * as heading from "./elements/heading";
import * as link from "./elements/link";
import * as long_text from "./elements/long-text";
import * as number from "./elements/number";
import * as page_break from "./elements/page-break";
import * as short_text from "./elements/short-text";
import * as single_select from "./elements/single-select";

export const ElementComponents = {
  description: description,
  divider: divider,
  heading: heading,
  page_break: page_break,
} as const;

export const FieldComponents = {
  email: email,
  link: link,
  long_text: long_text,
  number: number,
  single_select: single_select,
  short_text: short_text,
} as const;

export const ClientRegistryComponents = {
  ...ElementComponents,
  ...FieldComponents,
} as const;
