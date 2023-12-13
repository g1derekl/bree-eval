'use server';

import { z } from 'zod';

import { CountryItem, QueryItem, ResultItem } from './types';
import countries from './countries.json';

const API_KEY = process.env.API_KEY;

const schema = z.object({
  fullName: z.string({
    required_error: 'Name is required',
    invalid_type_error: 'Name must be a string'
  }).trim(),
  birthYear: z.coerce.number({
    required_error: 'Birth year is required',
    invalid_type_error: 'Birth year is required'
  }).positive().lte(new Date().getFullYear()),
  country: z.string({
    required_error: 'Country is required',
    invalid_type_error: 'Country must be a string'
  })
});

async function _apiLookup(query: QueryItem): Promise<Response> {
  return await fetch(process.env.API_SERVER as string, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      apiKey: API_KEY,
      minScore: 100,
      source: ['SDN'],
      cases: [
        {
          name: query.fullName
        }
      ],
      type: ['individual']
    })
  });
}

function _matchFields(query: QueryItem, matches: any): ResultItem {
    const matchResult: ResultItem = {
      fullName: false,
      birthYear: false,
      country: false
    };

    const match = matches[<string>query.fullName][0];

    if (!match) {
      return matchResult;
    }

    matchResult.fullName = true;

    try {
      const birthYear = parseInt(match.dob.split(' ').pop());
      if (birthYear === query.birthYear) {
        matchResult.birthYear = true;
      }
    } catch {} // Do nothing if DOB not available or other error

    try {
      const country = match.addresses[0].country;
      if (country === query.country) {
        matchResult.country = true;
      }
    } catch {} // Do nothing if location not available

    console.log(matchResult);

    return matchResult;
}

export async function lookup(formData: QueryItem): Promise<ResultItem> {
  const validatedFields = schema.safeParse(formData);

  // Return early if the form data is invalid
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors
    };
  }

  const response = await _apiLookup(validatedFields.data);

  if (response.status !== 200) {
    console.log(response.statusText);
    throw new Error(response.statusText);
  }

  const body = await response.json();

  return _matchFields(validatedFields.data, body.matches);
}

export async function getCountries(): Promise<CountryItem[]> {
  return countries.map((country, i) => ({ id: i, name: country.name }));
}