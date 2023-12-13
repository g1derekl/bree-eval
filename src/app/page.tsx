'use client';

import { ChangeEvent, FormEvent, ReactElement, useState } from 'react';
import { ReactSearchAutocomplete } from 'react-search-autocomplete'

import styles from './page.module.css'
import { CountryItem, QueryItem, ResultItem } from './types';
import { lookup } from './actions';

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
      {errors ? errors.map((error, i) => <small className={styles.invalid} key={i}>{error}</small>) : null}
    </label>
  )
}

export default function App(): ReactElement {
  const [validationErrors, setErrors] = useState<any>({});
  const [formState, setFormState] = useState<QueryItem>({});

  const items: CountryItem[] = [
    { id: 0, name: 'Canada' },
    { id: 1, name: 'USA' },
    { id: 2, name: 'Mexico' },
    { id: 3, name: 'Guatemala' }
  ]

  const handleOnSelect = (item: CountryItem): void => {
    setFormState({
      ...formState,
      country: item.name
    });
  };

  const handleChange = (evt: ChangeEvent): void => {
    setFormState({
      ...formState,
      [(evt.target as HTMLInputElement).name]: (evt.target as HTMLInputElement).value
    });
  };

  const handleSubmit = async (evt: FormEvent<HTMLFormElement>): Promise<void> => {
    evt.preventDefault();
    const result = await lookup(formState);
    if ('errors' in result) {
      setErrors(result.errors);
    }
  };

  return (
    <main className={styles.main}>
      <div>
        <h2>OFAC Lookup</h2>
      </div>
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
            items={items}
            onSelect={handleOnSelect}
            placeholder="Start typing..."
          />
          {validationErrors.country ? <small className={styles.invalid}>{validationErrors.country}</small> : null}
        </label>
        <button type="submit">Search</button>
      </form>
    </main>
  )
}
