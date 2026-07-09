import { APP_URL } from "@formbro/shared/brand";
import { describe, expect, test } from "bun:test";
import { copyPublicFormShareUrl, getPublicFormShareUrl } from "./share-link";

describe("public form share links", () => {
  test("builds an absolute, encoded public form URL", () => {
    expect(getPublicFormShareUrl("customer intake")).toBe(`${APP_URL}/f/customer%20intake`);
  });

  test("copies the public URL through the provided clipboard", async () => {
    const copied: string[] = [];
    const clipboard = {
      writeText(value: string) {
        copied.push(value);
        return Promise.resolve();
      },
    };

    await copyPublicFormShareUrl(`${APP_URL}/f/test`, clipboard);

    expect(copied).toEqual([`${APP_URL}/f/test`]);
  });

  test("surfaces clipboard failures", async () => {
    const clipboard = {
      writeText() {
        return Promise.reject(new Error("clipboard denied"));
      },
    };

    expect(copyPublicFormShareUrl(`${APP_URL}/f/test`, clipboard)).rejects.toThrow(
      "clipboard denied",
    );
  });
});
