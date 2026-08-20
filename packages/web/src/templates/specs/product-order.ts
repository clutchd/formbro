import type { TemplateDefinition } from "../types";

export const template: TemplateDefinition = {
  id: "product_order",
  version: 1,
  description: "Collect a customer, product, quantity, and delivery notes in one order.",
  category: "order-form",
  tags: ["products", "orders", "sales"],
  schema: {
    id: "product_order",
    name: "Product Order",
    elements: [
      {
        id: "product_order_heading",
        name: "Place a product order",
        type: "heading",
        label: "Place a product order",
        level: 1,
      },
      {
        id: "product_order_intro",
        name: "Place a product order intro",
        type: "description",
        label: "Choose the product and quantity. We will confirm availability and next steps.",
      },
      {
        id: "customer_name",
        name: "Customer name",
        type: "short_text",
        label: "Customer name",
        placeholder: "Taylor Morgan",
        rules: [{ type: "required", value: true }],
      },
      {
        id: "customer_email",
        name: "Email",
        type: "email",
        label: "Email",
        placeholder: "you@example.com",
        rules: [{ type: "required", value: true }],
      },
      {
        id: "product",
        name: "Product",
        type: "single_select",
        label: "Product",
        placeholder: "Select a product",
        options: ["Starter kit", "Standard kit", "Pro kit"],
        rules: [{ type: "required", value: true }],
      },
      {
        id: "quantity",
        name: "Quantity",
        type: "number",
        label: "Quantity",
        placeholder: "1",
        rules: [{ type: "required", value: true }],
      },
      {
        id: "delivery_notes",
        name: "Delivery notes",
        type: "long_text",
        label: "Delivery notes",
        placeholder: "Timing, location, or handling notes.",
      },
    ],
    submit: {
      label: "Submit order",
      size: "full-width",
    },
  },
};
