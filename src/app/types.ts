export type QueryItem = {
  fullName?: string;
  birthYear?: number;
  country?: string;
};

type Results = {
  fullName: boolean;
  birthYear: boolean;
  country: boolean;
};

type ValidationError = {
  errors: any;
};

export type ResultItem = Results | ValidationError;

export type CountryItem = {
  id: number,
  name: string
};
