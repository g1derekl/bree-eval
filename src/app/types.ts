export type QueryItem = {
  fullName?: string;
  birthYear?: number;
  country?: string;
} & {
  [key: string]: string | number | undefined
};

export type Result = {
  fullName: boolean;
  birthYear: boolean;
  country: boolean;
} & {
  [key: string]: boolean
};

export type ValidationError = {
  errors: any;
};

export type ResultItem = ValidationError | Result;

export type CountryItem = {
  id: number,
  name: string
};
