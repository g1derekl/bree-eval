'use server';

import { z } from 'zod';

import { CountryItem, QueryItem, ResultItem, Result } from './types';
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

function _matchIndividual(query: QueryItem, match: any): ResultItem {
  const matchResult: ResultItem = {
    fullName: true,
    birthYear: false,
    country: false
  };

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

  return matchResult;
}

function _matchFields(query: QueryItem, matches: any): Result {
    const matchResults: ResultItem[] = matches[<string>query.fullName].map((match: any) => {
      return _matchIndividual(query, match);
    });

    return { matches: matchResults };
}

/**
 * Take the output of a form entry and check its fields against the SDN dataset
 * @param {QueryItem} formData The query parameters
 * @returns {Promise<ResultItem>} A promise that resolves to an object indicating which fields match
 */
export async function lookup(formData: QueryItem): Promise<Result> {
  const validatedFields = schema.safeParse(formData);

  // Return early if the form data is invalid
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      matches: []
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