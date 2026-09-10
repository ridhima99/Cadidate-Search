# My bug report — 13

You reported 7 confirmed bugs. For Phase 2, write an automated test that FAILS because of each one — fixing them is an optional bonus.

## 1. UI — pagination-bug

Issue: Pagination allows the current page to go beyond the available pages. When there are only 3 pages of results, the application can display an invalid page number such as "Page 10 of 3".
Expected vs actual: Expected: When there are only 3 pages, the last valid page should be page 3. The user should not be able to navigate beyond the last page, and the UI should not display a page number greater than 3.

Actual: The application displays "Page 10 of 3" with 0 results after navigating beyond the available pages. The current page number is greater than the total number of pages.

## 2. UI — wrong-format-display

Issue: The "Created On" column displays dates in the raw database format instead of the specified UI format.
Expected vs actual: Expected: The createdAt date must be displayed in the DD-MM-YYYY format (e.g., 25-01-2026) as per the specification.

Actual: The date is displayed in the YYYY-MM-DD format (e.g., 2026-01-25).

## 3. GET /api/candidates — pagination-bug

Issue: The API fails to enforce the maximum pageSize limit of 50 and incorrectly calculates the totalPages metadata.
Expected vs actual: Expected: When requesting pageSize=100, the API should clamp the value and return pageSize: 50. Additionally, based on the provided formula, a response with a total of 30 should result in totalPages: 1.

Actual: The API accepts the out-of-bounds parameter and returns pageSize: 100. Furthermore, it returns a mathematically invalid totalPages: 0.

## 4. GET /api/candidates — case-sensitivity-mismatch

Issue: The search query parameter (q) is strictly case-sensitive, which violates the requirement for case-insensitive substring matching.
Expected vs actual: Expected: Searching for "ISHAAN" in all caps should return case-insensitive matches, successfully finding "Ishaan.Nair".

Actual: Searching for "ISHAAN" returns 0 results because the search is enforcing strict case sensitivity.

## 5. GET /api/candidates — type-coercion

Issue: When providing a non-numeric string value for the integer page parameter, the API fails to validate or coerce the type, resulting in a broken state with a null page value.
Expected vs actual: Expected: The API should gracefully handle invalid types by either falling back to the default value (page=1) or returning a 400 Bad Request validation error.

Actual: The API accepts the invalid string, sets "page": null, and silently returns an empty data array [] instead of valid results or a proper error message.

## 6. UI — stale-or-mismatched-aggregate

Issue: The results count displayed next to the search button reflects the number of items currently visible on the screen, rather than the total number of matches across all pages.
Expected vs actual: Expected: An empty search matches all records, so the UI should use the API's total count and display "30 results".

Actual: The UI displays "9 results", which incorrectly counts only the data array length of the currently rendered page instead of the aggregate total.

## 7. GET /api/candidates — wrong-sort-order

Issue: The API fails to apply multi-column sorting rules, specifically ignoring the secondary sort parameter (the tie-breaker).
Expected vs actual: Expected: When passing sort=status:asc,name:desc, candidates within the same status group (e.g., VERIFIED) should be sorted in descending alphabetical order (Z to A) by their names.

Actual: The API groups the statuses but completely ignores the name:desc parameter. The names inside the groups (e.g., Vivaan, Diya, Karan) remain unsorted instead of following the requested descending order.

