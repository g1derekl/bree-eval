export type QueryItem = {
  fullName?: string;
  birthYear?: number;
  country?: string;
} & {
  [key: string]: string | number | undefined
};

export type ResultItem = {
  fullName: boolean;
  birthYear: boolean;
  country: boolean;
} & {
  [key: string]: boolean
};

export type Result = {
  matches: ResultItem[];
  errors?: any;
};

export type CountryItem = {
  id: number,
  name: string
};
