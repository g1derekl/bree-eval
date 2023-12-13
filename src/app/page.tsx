'use client';

import { ChangeEvent, FormEvent, ReactElement, useEffect, useState } from 'react';
import { ReactSearchAutocomplete } from 'react-search-autocomplete'

import styles from './page.module.css'
import { CountryItem, QueryItem, Result, ResultItem, ValidationError } from './types';
import { getCountries, lookup } from './actions';

const NAME_MAP: { [key: string]: string | number } = {
  fullName: 'Full Name',
  birthYear: 'Year of Birth',
  country: 'Country'
};

type FormInputProps = {
  label: string;
  name: string;
  type: string;
  onChange: (evt: ChangeEvent) => void;
  value?: string | number;
  errors?: string[];
};

function FormInputWithValidation({
  label,
  name,
  type,
  onChange,
  value,
  errors
}: FormInputProps): ReactElement {
  return (
    <label className={styles.formGroup}>
      <span>{label}</span>
      <input name={name} type={type} value={value || ''} onChange={onChange} />
      {errors ? errors.map((error, i) =>
        <small className={styles.invalid} key={i}>{error}</small>) :
        <small>&nbsp;</small>
      }
    </label>
  )
}

export default function App(): ReactElement {
  const [countryList, setCountryList] = useState<CountryItem[]>([]);
  const [validationErrors, setErrors] = useState<any>({});
  const [formState, setFormState] = useState<QueryItem>({});
  const [searchResult, setSearchResult] = useState<ResultItem>();

  const getCountryList = async () => {
    const countries = await getCountries();
    setCountryList(countries);
  };

  useEffect(() => {
    getCountryList();
  }, []);

  const handleSelect = (item: CountryItem): void => {
    setFormState({
      ...formState,
      country: item.name
    });
  };

  const handleClear = (): void => {
    setFormState({
      ...formState,
      country: undefined
    });
  }

  const handleChange = (evt: ChangeEvent): void => {
    setFormState({
      ...formState,
      [(evt.target as HTMLInputElement).name]: (evt.target as HTMLInputElement).value
    });
  };

  const handleSubmit = async (evt: FormEvent<HTMLFormElement>): Promise<void> => {
    evt.preventDefault();
    const query: QueryItem = {};

    // Convert empty strings to null because Zod treats empty strings as truthy
    Object.keys(formState).forEach((key) => {
      if (formState[key]) {
        query[key] = formState[key];
      }
    });

    const result = await lookup(query);
    if ((result as ValidationError).errors) {
      setErrors(result.errors);
      setSearchResult(undefined);
    } else {
      setErrors({});
      setSearchResult(result);
    }
  };

  return (
    <main className={styles.main}>
      <div>
        <h2>OFAC Lookup</h2>
      </div>
      <div>
        <form className={styles.searchForm} onSubmit={handleSubmit}>
          <FormInputWithValidation
            label="Full Name"
            name="fullName"
            type="text"
            value={formState.fullName}
            onChange={handleChange}
            errors={validationErrors.fullName}
          />
          <FormInputWithValidation
            label="Year of Birth"
            name="birthYear"
            type="number"
            value={formState.birthYear}
            onChange={handleChange}
            errors={validationErrors.birthYear}
          />
          <label className={styles.countryInput}>
            <span>Country</span>
            <ReactSearchAutocomplete
              styling={{
                borderRadius: '4px',
                fontSize: '1rem'
              }}
              items={countryList}
              onSelect={handleSelect}
              onClear={handleClear}
              placeholder="Start typing..."
            />
            {validationErrors.country ? <small className={styles.invalid}>{validationErrors.country}</small> : null}
          </label>
          <button type="submit">Search</button>
        </form>
      </div>
      {
        searchResult ? (
          <div className={styles.results}>
            <h4>Results</h4>
            {
              Object.keys(searchResult as ResultItem).map((key, i) => (
                <div key={i} className={styles.entry}>
                  {NAME_MAP[key]}: {(searchResult as Result)[key] ? '✅' : '❌'}
                </div>
              ))
            }
          </div>
        ) : null
      }

    </main>
  )
}
