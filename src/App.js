import React from 'react';
import axios from 'axios';

import styled from 'styled-components';
import { ReactComponent as Check } from './check.svg';
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


const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

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
        data: action.payload
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
  console.log('C');

  return stories.data.reduce(
    (result, value) => result + value.num_comments, 0
  );

};

const App = () => {

  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');

  // Replaced "useState" hook with a reducer, which can be used to handle more complicated state management
  // Then, replaced the multiple state hooks with ONE, to help manage/prevent "Impossible States"
  const [stories, dispatchStories] = React.useReducer(storiesReducer,
    { data: [], isLoading: false, isError: false });
  // const [isLoading, setIsLoading] = React.useState(false);
  // const [isError, setIsError] = React.useState(false); // Error handling if third party API errors

  const [url, setUrl] = React.useState(`${API_ENDPOINT}${searchTerm}`);

  const handleSearchInput = event => {
    setSearchTerm(event.target.value);
  }

  const handleSearchSubmit = (event) => {
    setUrl(`${API_ENDPOINT}${searchTerm}`)

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
      const result = await axios.get(url);

      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: result.data.hits
      })
    } catch {
      dispatchStories({ type: 'STORIES_FETCH_FAILURE' });
    }
  }, [url]);

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

  console.log("B: App");

  /**
   * The original function call would be run every time App (re)rendered. 
   * If the summComments function was more calculation heavy, that could
   * add up incredibly fast and even slow down the app noticeably. 
   * By using the React.memo hook, we can tell React to only re run the function
   * if the dependencies have changed (presented by the [stories] after the getSumComments(stories) call)
   */
  // const sumComments = getSumComments(stories);
  const sumComments = React.useMemo(() => getSumComments(stories), [stories]);

  return (
    <div className="App">
      <StyledContainer >
        <StyledHeadlinePrimary>Hacker Stories with {sumComments} comments</StyledHeadlinePrimary>

        <SearchForm
          searchTerm={searchTerm}
          onSearchInput={handleSearchInput}
          onSearchSubmit={handleSearchSubmit} />

        {stories.isError && <p>Something went wrong...</p>}

        {stories.isLoading ? (
          <p>Loading...</p>
        ) : <List list={stories.data} onRemoveItem={handleRemoveStory} /> // Changed data to list because it will be searching in the API, not on the client side
        }
      </StyledContainer>
    </div>
  );
}

export default App;

// Must be exported so that they may be used with testing
export { storiesReducer, SearchForm, InputWithLabel, List };
