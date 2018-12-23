import { Enum } from 'typescript-string-enums';

export const SearchType = Enum({
  GENERAL_SEARCH: 'GENERAL_SEARCH',
  TWIN_DIAMOND_SEARCH: 'TWIN_DIAMOND_SEARCH',
  DAYP_SEARCH: 'DAYP_SEARCH',
  GLOBAL_SEARCH: 'GLOBAL_SEARCH',
  EVENT_SEARCH: 'EVENT_SEARCH',
  SAVED_SEARCH: 'SAVED_SEARCH',
  EDIT_SEARCH: 'EDIT_SEARCH',
  B2B_SEARCH: 'B2B_SEARCH'
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
