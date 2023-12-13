'use server';

import { z } from 'zod';

import { QueryItem, ResultItem } from './types';

const API_KEY = process.env.API_KEY;

const schema = z.object({
  fullName: z.string({
    required_error: 'Name is required',
    invalid_type_error: 'Name must be a string'
  }),
  birthYear: z.number({
    required_error: 'Birth year is required',
    invalid_type_error: 'Birth year must be a number'
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
      ]
    })
  });
}

function _matchFields(matches: any): ResultItem {
    const matchResult: ResultItem = {
      fullName: false,
      birthYear: false,
      country: false
    };

    matches.forEach((match: any) => {

    });

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

  const response = await _apiLookup(formData);

  if (response.status !== 200) {
    throw new Error(await response.text());
  }

  const body = await response.json();

  return _matchFields(body.matches);
}
