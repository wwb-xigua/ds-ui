interface ImportMeta {
  glob: {
    (
      path: string,
      options?: { eager?: boolean; import?: string },
    ): Record<string, () => Promise<any>>;
  };
}
