import { fileURLToPath } from "node:url";

import { expect, it } from "vitest";

it("should be importable", async () => {
  const imported = await import("..");

  expect(imported).toMatchObject({
    parsers: {},
  });
});

it("should be importable", async () => {
  const imported = await import("../dist");

  expect(imported).toMatchObject({
    parsers: {},
  });
});

it("should be resolvable", () => {
  const actualPath = fileURLToPath(
    new URL("../dist/index.js", import.meta.url),
  );

  const resolved = require.resolve("../dist");

  expect(resolved).toEqual(actualPath);
});
