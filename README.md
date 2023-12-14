#### OFAC Lookup

###### A small web application that looks up a person's name against the OFAC Specially Designated Nationals dataset

##### Implementation

This application is built on Next.js and bootstrapped using `create-next-app`, consisting of a single page in the `src/app` folder that outputs the React component `App`.
It has minimal external dependencies; the only 3rd-party component is a search autocomplete text field for looking up countries. The user enters a name, year of birth and country of residence and the application searches against SDN data using the [OFAC API](https://ofac-api.com/documentation/v3/index.html) service. If a match is found, a results panel will display and show which fields match that of the initial query.

 Server-side actions are performed in the `actions.ts` file; it makes the requests to the SDN API and analyzes each match. It also fetches a list of countries as listed by ISO-3166 (taken from [here](https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/slim-2/slim-2.json)) for the country autocomplete component.

 ##### Notes and possible improvements

 - Currently, the backend submits a query to the OFAC API and then analyzes each result for matching fields. It works well enough for now, but if we want to build this out and scale up, we should consider implementing our own search solution with the publicly-available data. We could run a dedicated search engine (e.g. ElasticSearch, Atlas, Algolia) mapped to the raw data files and have a daily/weekly job that would download the files from its source and add them to the search index. This would allow us to have more robust search functionality, such as sorting and filtering by fields other than a person's name, as well as the ability to show matching fields and include additional information structured to exactly fit our needs.

- There is no way to obtain a list of all countries included in the dataset via the OFAC API, so we simply downloaded a JSON file of ISO-3166 country codes and are using that to populate the countries list in the search form. With a custom search solution, we would be able to limit the list to only countries appearing in the dataset, as well as catch if an entry is using a different spelling or alternate name of a country.

- We could also show more detailed match results. One possibility is having a tooltip appear when the user hovers over a mismatching field to show the exactly value of that field. A "Show more" or "+" button that opens a modal dialog showing more detailed information could also work.

- If we do implement the above and expand on this concept significantly, we should create a dedicated backend service to handle the functionality rather than using Next's server actions alone.