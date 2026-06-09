import { describe, expect, it } from "vitest";
import { TsTokenSource } from "../adapters/ts";
import { YamlTokenSource } from "../adapters/yaml";

describe("phenoDesign ports", () => {
  it("TsTokenSource.format", () => {
    expect(new TsTokenSource().format).toBe("ts");
  });
  it("YamlTokenSource.format", () => {
    expect(new YamlTokenSource().format).toBe("yaml");
  });
  it("TsTokenSource.tokens empty", async () => {
    expect((await new TsTokenSource().tokens()).length).toBe(0);
  });
  it("TsTokenSource.resolve returns null", async () => {
    expect(await new TsTokenSource().resolve("color.brand")).toBeNull();
  });
  it("TokenSource interface object-safe", () => {
    const _s: import("../token_source").TokenSource = new TsTokenSource();
  });
});
