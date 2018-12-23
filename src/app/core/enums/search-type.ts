import { Enum } from 'typescript-string-enums';

export const SearchType = Enum({
  GENERAL_SEARCH: 'GENERAL SEARCH',
  TWIN_DIAMOND_SEARCH: 'TWIN DIAMOND SEARCH',
  DAYP_SEARCH: 'DAYP SEARCH',
  GLOBAL_SEARCH: 'GLOBAL SEARCH',
  EVENT_SEARCH: 'EVENT SEARCH',
  B2B_SEARCH: 'B2B SEARCH'
});

export type SearchType = Enum<typeof SearchType>;

export class SearchTypeComparator {

  static AreEqual(code: string, searchTypeValue: any): boolean {
    let matched = false;
    const codeEnumValue = SearchType[code];
    if (codeEnumValue === searchTypeValue) {
      matched = true;
    }
    return matched;
  }

}
