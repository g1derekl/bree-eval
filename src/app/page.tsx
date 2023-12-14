'use client';

import { ChangeEvent, FormEvent, ReactElement, useEffect, useState } from 'react';
import { ReactSearchAutocomplete } from 'react-search-autocomplete'

import styles from './page.module.css'
import { CountryItem, QueryItem, ResultItem } from './types';
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
      {errors ? errors.map((error: string, i: number) =>
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
  const [searchResults, setSearchResults] = useState<ResultItem[]>();

  const getCountryList = async () => {
    const countries = await getCountries();
    setCountryList(countries);
  };

  useEffect(() => {
    getCountryList();
  }, []);

  // Event handlers for the typeahead select component
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
  // =================================================

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
    Object.keys(formState).forEach((key: string) => {
      if (formState[key]) {
        query[key] = formState[key];
      }
    });

    const result = await lookup(query);
    if (result.errors) {
      setErrors(result.errors);
      setSearchResults(undefined);
    } else {
      setErrors({});
      setSearchResults(result.matches);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h2>OFAC Lookup</h2>
      </div>
      <div className={styles.searchForm}>
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
        searchResults ? (
          <div className={styles.results}>
            <h4>Result: {searchResults.length ? 
              <b className={styles.hit}>HIT</b> : 
              <b className={styles.clear}>CLEAR</b>
            }</h4>
            {
              searchResults.map((result: ResultItem, i: number) => (
                <div className={styles.match} key={i}>{
                  Object.keys(result).map((key: string, i: number) => (
                    <div key={i} className={styles.field}>
                      {NAME_MAP[key]}: {result[key] ? '✅' : '❌'}
                    </div>
                  ))
                  }</div>
              ))
            }
          </div>
        ) : null
      }
    </main>
  )
}
