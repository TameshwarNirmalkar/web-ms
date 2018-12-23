import { Enum } from 'typescript-string-enums';

export const SearchCriteriaType = Enum({
  RANGE: 'RANGE',
  VALUES:'VALUES'
});

export type SearchCriteriaType = Enum<typeof SearchCriteriaType>;

export class SearchCriteriaTypeComparator {

  static AreEqual(code: string, criteriaType: any): boolean {
    let matched = false;
    const codeEnumValue = SearchCriteriaType[code];
    if (codeEnumValue === criteriaType) {
      matched = true;
    }
    return matched;
  }
}
