import { Tailwind as ReactEmailTailwind } from "@react-email/components";
import React from "react";

export default function Tailwind({ children }: { children: React.ReactNode }) {
  return (
    <ReactEmailTailwind
      config={{
        theme: {
          extend: {
            colors: {
              background: {
                DEFAULT: "#fefdfe",
                dark: "#0b0b0c",
              },
              foreground: {
                DEFAULT: "#0b0b0c",
                dark: "#ffffff",
              },
              card: {
                DEFAULT: "#ffffff",
                dark: "#100f10",
              },
              "card-foreground": {
                DEFAULT: "#0b0b0c",
                dark: "#ffffff",
              },
              primary: {
                DEFAULT: "#181718",
                dark: "#e5e4e6",
              },
              "primary-foreground": {
                DEFAULT: "#fafafb",
                dark: "#181718",
              },
              "muted-foreground": {
                DEFAULT: "#646364",
                dark: "#818081",
              },
              border: {
                DEFAULT: "#cecdce",
                dark: "#484749",
              },
            },
          },
        },
      }}
    >
      {children}
    </ReactEmailTailwind>
  );
}
