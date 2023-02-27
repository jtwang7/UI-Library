export type DeepPartial<T> = T extends object
  ? Partial<
      {
        [P in keyof T]: DeepPartial<T[P]>;
      }
    >
  : T;

export type DeepRequired<T> = T extends object
  ? Required<
      {
        [P in keyof T]: DeepRequired<T[P]>;
      }
    >
  : T;
