import { format } from "prettier";
import { describe, expect, it } from "vitest";

// TODO

describe("should", () => {
	it("sort", async () => {
		await expect(
			format(
				`
{
  "name": "foo",
  "version": "1.0.0",

  "dependencies": {

   }
  }


  `,
				{
					plugins: ["./dist/index.js"],
					filepath: "foo/package.json",
				},
			),
		).resolves.toMatchSnapshot();
	});
});
