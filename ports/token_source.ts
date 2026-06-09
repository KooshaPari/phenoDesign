/** T73: phenoDesign hexagonal port — TokenSource. 3 adapters: TS, MD, YAML. */
export interface DesignToken {
  readonly name: string;
  readonly value: string;
  readonly type: "color" | "spacing" | "typography" | "shadow" | "radius";
}
export interface TokenSource {
  readonly format: "ts" | "md" | "yaml";
  tokens(): Promise<readonly DesignToken[]>;
  resolve(name: string): Promise<string | null>;
}
