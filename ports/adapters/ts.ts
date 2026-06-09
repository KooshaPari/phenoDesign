import type { DesignToken, TokenSource } from "../token_source";

export class TsTokenSource implements TokenSource {
  readonly format = "ts" as const;
  async tokens(): Promise<readonly DesignToken[]> {
    return [];
  }
  async resolve(name: string): Promise<string | null> {
    return null;
  }
}
