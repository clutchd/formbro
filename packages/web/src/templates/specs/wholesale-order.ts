import type { TemplateDefinition } from "../types";

export const template: TemplateDefinition = {
  id: "wholesale_order",
  version: 1,
  description: "Capture a business buyer, product mix, unit count, and requested delivery window.",
  category: "order-form",
  tags: ["wholesale", "vendors", "bulk orders"],
  schema: {
    id: "wholesale_order",
    name: "Wholesale Order",
    elements: [
      {
        id: "wholesale_order_heading",
        name: "Wholesale order",
        type: "heading",
        label: "Wholesale order",
        level: 1,
      },
      {
        id: "wholesale_order_intro",
        name: "Wholesale order intro",
        type: "description",
        label: "Share the product mix and volume. We will confirm pricing and fulfillment.",
      },
      {
        id: "business_name",
        name: "Business name",
        type: "short_text",
        label: "Business name",
        placeholder: "Acme Supply Co.",
        rules: [{ type: "required", value: true }],
      },
      {
        id: "buyer_name",
        name: "Buyer name",
        type: "short_text",
        label: "Buyer name",
        placeholder: "Taylor Morgan",
        rules: [{ type: "required", value: true }],
      },
      {
        id: "buyer_email",
        name: "Buyer email",
        type: "email",
        label: "Buyer email",
        placeholder: "buyer@example.com",
        rules: [{ type: "required", value: true }],
      },
      {
        id: "product_mix",
        name: "Products and quantities",
        type: "long_text",
        label: "Products and quantities",
        placeholder: "List each SKU or product and the quantity needed.",
        rules: [{ type: "required", value: true }],
      },
      {
        id: "total_units",
        name: "Estimated total units",
        type: "number",
        label: "Estimated total units",
        placeholder: "250",
      },
      {
        id: "delivery_window",
        name: "Requested delivery window",
        type: "short_text",
        label: "Requested delivery window",
        placeholder: "First week of October",
      },
    ],
    submit: {
      label: "Request wholesale order",
      size: "full-width",
    },
  },
};
