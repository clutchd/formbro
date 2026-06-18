import type { CompiledPage } from "@formbro/core/compile";
import { FieldGroup, FieldLegend, FieldSet } from "@formbro/ui/field";
import * as React from "react";
import type { TanStackFieldProps, TanStackForm } from "../hooks/tanstack";
import { ElementComponents } from "../registry";
import { Field } from "./field";

type PageElement = CompiledPage["sections"][number]["header"][number];

function renderElement(element: PageElement) {
  const Component = ElementComponents[element.type as keyof typeof ElementComponents]?.component;

  if (!Component) {
    return null;
  }

  return <Component key={element.id} {...element} />;
}

export function Page({
  tanstack,
  listeners,
  validators,
  page,
}: {
  tanstack: TanStackForm;
  listeners: Map<string, TanStackFieldProps["listeners"]>;
  validators: Map<string, TanStackFieldProps["validators"]>;
  page: CompiledPage;
}) {
  return (
    <>
      {page.label && (
        <FieldLegend className="font-display text-lg font-bold tracking-tight">
          {page.label}
        </FieldLegend>
      )}
      {page.sections.map((section) => (
        <div key={section.key}>
          {(section.header.length > 0 || section.body.length > 0) && (
            <FieldSet>
              {section.header.map((element) => renderElement(element))}
              {section.body.length > 0 && (
                <FieldGroup>
                  {section.body.map((element) =>
                    element.category === "field" ? (
                      <Field
                        key={element.id}
                        tanstack={tanstack}
                        schema={element}
                        listeners={listeners.get(element.id)}
                        validators={validators.get(element.id)}
                      />
                    ) : (
                      renderElement(element)
                    ),
                  )}
                </FieldGroup>
              )}
            </FieldSet>
          )}
          {section.separator ? renderElement(section.separator) : null}
        </div>
      ))}
    </>
  );
}
