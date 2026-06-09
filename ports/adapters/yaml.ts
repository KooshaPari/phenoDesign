import type { DesignToken, TokenSource } from "../token_source";

export class YamlTokenSource implements TokenSource {
  readonly format = "yaml" as const;
  async tokens(): Promise<readonly DesignToken[]> {
    return [];
  }
  async resolve(name: string): Promise<string | null> {
    return null;
  }
}
