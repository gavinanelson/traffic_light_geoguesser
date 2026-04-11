import React from "react";
import { describe, expect, it } from "vitest";

import RootLayout from "../app/layout";

describe("RootLayout", () => {
  it("suppresses hydration warnings on the html element", () => {
    const element = RootLayout({
      children: <div>content</div>,
    });

    expect(element.props.lang).toBe("en");
    expect(element.props.suppressHydrationWarning).toBe(true);
  });
});
