import type { CompiledPage } from "@formbro/core/compile";
import * as React from "react";
import type { TanStackFieldProps, TanStackForm } from "../hooks/tanstack.js";
import { getElementComponent } from "../registry.js";
import { Field } from "./field.js";
import { FieldGroup, FieldLegend, FieldSet } from "./primitives.js";

type PageElement = CompiledPage["sections"][number]["header"][number];

function renderElement(element: PageElement) {
  const Component = getElementComponent(element.type);

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
      <div className="[&>[data-form-section]:first-child>[data-slot=field-set]>*:first-child]:pt-0! [&>[data-form-section]:first-child>[data-slot=field-set]>[data-slot=field-group]:first-child>*:first-child]:pt-0!">
        {page.sections.map((section) => {
          const hasContent = section.header.length > 0 || section.body.length > 0;

          return (
            <div key={section.key} data-form-section>
              {hasContent && (
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
          );
        })}
      </div>
    </>
  );
}
