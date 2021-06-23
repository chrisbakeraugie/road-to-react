import React from 'react';
import axios from 'axios';

import styled from 'styled-components';
// import { ReactComponent as Check } from './check.svg';
import SearchForm from './SearchForm';
import InputWithLabel from './InputWithLabel';
import List from './List';

const StyledContainer = styled.div`
height: 100vw;
padding: 20px;
background: #83a4d4;
background: linear-gradient(to left, #b6fbff, #83a4d4);
color: #171212;
`;
const StyledHeadlinePrimary = styled.h1`
font-size: 48px;
font-weight: 300;
letter-spacing: 2px;
`;


const API_BASE = 'https://hn.algolia.com/api/v1';
const API_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page='

const getUrl = (searchTerm, page) => {
  return (`${API_BASE}${API_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}`);
}

//Custom hooks example - naming conventions for hooks; start with 'use'
const useSemiPersistentState = (key, initialState) => {
  // This initializes the isMounted with an initial value 'false'
  // However, it doesn't get overwritten each time, for reasons that aren't 100% clear to me
  // It can be used to prevent rendering the first time, and re-render every time after
  const isMounted = React.useRef(false);
  const [value, setValue] = React.useState(localStorage.getItem(key) || initialState);

  /**
   * This React Hook is basically saying that whenever, wherever, searchTerm is updated through
   * setSearchTerm, localStorage will always be in sync
   */
  React.useEffect(() => {
    // This is where that React.useRef (above) came in handy
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      localStorage.setItem(key, value);
    }
  }, [value, key]);
  return [value, setValue];
}



// Can be used to create more "declarative programming", instead of "imperative programming"
// It is now in control of more predictable state transitions, as they are all managed in one spot
const storiesReducer = (state, action) => {
  switch (action.type) {
    case 'STORIES_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case 'STORIES_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload.page === 0 ?
          action.payload.list :
          state.data.concat(action.payload.list),
        page: action.payload.page
      };
    case 'STORIES_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true
      };
    case 'REMOVE_STORY':
      return {
        ...state,
        data: state.data.filter(story => (
          action.payload.objectID !== story.objectID
        ))
      };
    default: throw new Error();

  }
}

/**
 * While the function to count comments is outside the App component,
 * because the function has all arguments passed to it, it will work.
 * However, while it won't be re-created on each render, it WILL be ran
 * on each render.
 * @param {*} stories 
 */
const getSumComments = stories => {
  // console.log('C');

  return stories.data.reduce(
    (result, value) => result + value.num_comments, 0
  );
};

/**
 * Starts with an empty array as its 'result'
 * Every extracted searchTerm is compared to the one before
 * If they are different searchTerms, concat the result (as before)
 * If they are the same, just return un-edited
 * @param {*} urls 
 */
const getLastSearches = urls => {
  return (
    urls.reduce((result, url, index) => {
      const searchTerm = extractSearchTerm(url);

      if (index === 0) {
        return result.concat(searchTerm);
      }

      const previousSearchTerm = result[result.length - 1];

      if (searchTerm === previousSearchTerm) {
        return result;
      } else {
        return result.concat(searchTerm);
      }
    }, []))
    .slice(-6)
    .slice(0, -1);
};

const extractSearchTerm = url => url.substring(url.lastIndexOf('?') + 1, url.lastIndexOf('&')).replace(PARAM_SEARCH, '');

const LastSearches = ({ lastSearches, onLastSearch }) => (
  <div>
    {lastSearches.map((searchTerm, index) =>
      <button
        key={searchTerm + index}
        type="button"
        onClick={() => onLastSearch(searchTerm)}
      >
        {searchTerm}
      </button>
    )}
  </div>
)

const App = () => {

  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');

  // Replaced "useState" hook with a reducer, which can be used to handle more complicated state management
  // Then, replaced the multiple state hooks with ONE, to help manage/prevent "Impossible States"
  const [stories, dispatchStories] = React.useReducer(storiesReducer,
    { data: [], page: 0, isLoading: false, isError: false });

  /**
   * Changed state to an array to store past searches
   */
  const [urls, setUrls] = React.useState([getUrl(searchTerm, 0)]);

  const handleSearchInput = event => {
    setSearchTerm(event.target.value);
  }

  const handleSearchSubmit = (event) => {
    handleSearch(searchTerm, 0);

    // It may appear like it works without this,
    // but it causes a browser reload, which is against
    // the point of using frameworks like React
    event.preventDefault();
  }

  // Moved the fetching logic into a standalone function
  /**
   * This useCallback function is needed because it creates a memoized
   * function every time the dependency array (searchTerm) is changed.
   * Without it, a new handleFetchStories function would be created with each
   * App component that is rendered
   */
  const handleFetchStories = React.useCallback(async () => {
    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    try {
      const lastUrl = urls[urls.length - 1];
      const result = await axios.get(lastUrl);
      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: {
          list: result.data.hits,
          page: result.data.page
        }
      })
    } catch {
      dispatchStories({ type: 'STORIES_FETCH_FAILURE' });
    }
  }, [urls]);

  React.useEffect(() => {
    handleFetchStories()
  }, [handleFetchStories])

  /**
   *useCallback will return a memoized version of the callback that only changes if
   *one of the dependencies have changed
   */
  const handleRemoveStory = React.useCallback(item => {
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item
    });
  }, []);


  const handleLastSearch = searchTerm => {
    setSearchTerm(searchTerm);
    handleSearch(searchTerm, 0);
  };

  const handleSearch = (searchTerm, page) => {
    const url = getUrl(searchTerm, page);
    console.log(url);
    setUrls(urls.concat(url));
  }

  const lastSearches = getLastSearches(urls);

  // console.log("B: App");

  /**
   * The original function call would be run every time App (re)rendered. 
   * If the summComments function was more calculation heavy, that could
   * add up incredibly fast and even slow down the app noticeably. 
   * By using the React.memo hook, we can tell React to only re run the function
   * if the dependencies have changed (presented by the [stories] after the getSumComments(stories) call)
   */
  // const sumComments = getSumComments(stories);
  const sumComments = React.useMemo(() => getSumComments(stories), [stories]);

  const handleMore = () => {
    const lastUrl = urls[urls.length - 1];
    const searchTerm = extractSearchTerm(lastUrl);
    handleSearch(searchTerm, stories.page + 1);
  }

  return (
    <div className="App">
      <StyledContainer >
        <StyledHeadlinePrimary>Hacker Stories with {sumComments} comments</StyledHeadlinePrimary>

        <SearchForm
          searchTerm={searchTerm}
          onSearchInput={handleSearchInput}
          onSearchSubmit={handleSearchSubmit} />

        <LastSearches
          lastSearches={lastSearches}
          onLastSearch={handleLastSearch}
        />

        {stories.isError && <p>Something went wrong...</p>}

        <List list={stories.data} onRemoveItem={handleRemoveStory} />
        {stories.isLoading ? (
          <p>Loading...</p>
        ) : <button
          type='button'
          onClick={handleMore}
        >Load More...</button>
        }

      </StyledContainer>
    </div>
  );
}

export default App;

// Must be exported so that they may be used with testing
export { storiesReducer, SearchForm, InputWithLabel, List };
