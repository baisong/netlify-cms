import fuzzy from 'fuzzy';
import { currentBackend } from 'Backends/backend';
import { WAIT_UNTIL_ACTION } from 'Redux/middleware/waitUntilAction';

/*
 * Contant Declarations
 */
export const SEARCH_ENTRIES_REQUEST = 'SEARCH_ENTRIES_REQUEST';
export const SEARCH_ENTRIES_SUCCESS = 'SEARCH_ENTRIES_SUCCESS';
export const SEARCH_ENTRIES_FAILURE = 'SEARCH_ENTRIES_FAILURE';

export const QUERY_REQUEST = 'INIT_QUERY';
export const QUERY_SUCCESS = 'QUERY_OK';
export const QUERY_FAILURE = 'QUERY_ERROR';

export const SEARCH_CLEAR = 'SEARCH_CLEAR';

/*
 * Simple Action Creators (Internal)
 * We still need to export them for tests
 */
export function searchingEntries(searchTerm) {
  return {
    type: SEARCH_ENTRIES_REQUEST,
    payload: { searchTerm },
  };
}

export function searchSuccess(searchTerm, entries, page) {
  return {
    type: SEARCH_ENTRIES_SUCCESS,
    payload: {
      searchTerm,
      entries,
      page,
    },
  };
}

export function searchFailure(searchTerm, error) {
  return {
    type: SEARCH_ENTRIES_FAILURE,
    payload: {
      searchTerm,
      error,
    },
  };
}

export function querying(namespace, collection, searchFields, searchTerm) {
  return {
    type: QUERY_REQUEST,
    payload: {
      namespace,
      collection,
      searchFields,
      searchTerm,
    },
  };
}

export function querySuccess(namespace, collection, searchFields, searchTerm, response) {
  return {
    type: QUERY_SUCCESS,
    payload: {
      namespace,
      collection,
      searchFields,
      searchTerm,
      response,
    },
  };
}

export function queryFailure(namespace, collection, searchFields, searchTerm, error) {
  return {
    type: QUERY_SUCCESS,
    payload: {
      namespace,
      collection,
      searchFields,
      searchTerm,
      error,
    },
  };
}

/*
 * Exported simple Action Creators
 */

export function clearSearch() {
  return { type: SEARCH_CLEAR };
}


/*
 * Exported Thunk Action Creators
 */

// SearchEntries will search for complete entries in all collections.
export function searchEntries(searchTerm, page = 0) {
  return (dispatch, getState) => {
    const state = getState();
    dispatch(searchingEntries(searchTerm));
    const backend = currentBackend(state.config);
    const collections = state.collections.valueSeq().toArray();
    return backend.search(collections, searchTerm, page).then(
      response => dispatch(searchSuccess(searchTerm, response.entries, response.pagination)),
      error => dispatch(searchFailure(searchTerm, error))
    );
  };
}

// Instead of searching for complete entries, query will search for specific fields
// in specific collections and return raw data (no entries).
export function query(namespace, collectionName, searchFields, searchTerm) {
  return (dispatch, getState) => {
    const state = getState();
    dispatch(querying(namespace, collectionName, searchFields, searchTerm));
    const backend = currentBackend(state.config);
    const collection = state.collections.find(collection => collection.get('name') === collectionName);
    return backend.query(collection, searchFields, searchTerm)
      .then(
      response => dispatch(querySuccess(namespace, collection, searchFields, searchTerm, response)),
      error => dispatch(queryFailure(namespace, collection, searchFields, searchTerm, error)),
    );
  };
}
