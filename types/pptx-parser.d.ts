declare module "pptx-parser" {
  /**
   * Parses a .pptx File/Blob/ArrayBuffer in the browser and returns a JSON representation.
   * The exact shape depends on library internals; treat as unknown and narrow where used.
   */
  const parse: (input: File | Blob | ArrayBuffer) => Promise<unknown>;
  export default parse;
}
