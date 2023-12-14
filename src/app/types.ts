// Represents the object created by a user's input in the search form
export type QueryItem = {
  fullName?: string;
  birthYear?: number;
  country?: string;
} & {
  [key: string]: string | number | undefined
};

// Represents the result of each match in a query
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
