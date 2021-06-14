// import logo from './logo.svg';
import React from 'react';
import { resolve } from 'dns';
import axios from 'axios';

import styles from './App.module.css';

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

//Custom hooks example - naming conventions for hooks; start with 'use'
const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = React.useState(localStorage.getItem(key) || initialState);

  /**
   * This React Hook is basically saying that whenever, wherever, searchTerm is updated through
   * setSearchTerm, localStorage will always be in sync
   */
  React.useEffect(() => {
    localStorage.setItem(key, value);
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

  // Removed the "removeStory" logic from the handler to the reducer
  const handleRemoveStory = item => {
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item
    });
  }

  const searchedStories = stories.data.filter((story) => {
    return story.title.toLowerCase().includes(searchTerm.toLowerCase());
  })

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    localStorage.setItem('search', event.target.value);
  }

  return (
    <div className="App">
      <div className={styles.container}>
        <h1 className={styles.headlinePrimary}>Hacker Stories</h1>

        <SearchForm
          searchTerm={searchTerm}
          onSearchInput={handleSearchInput}
          onSearchSubmit={handleSearchSubmit} />

        {stories.isError && <p>Something went wrong...</p>}

        {stories.isLoading ? (
          <p>Loading...</p>
        ) : <List list={stories.data} onRemoveItem={handleRemoveStory} /> // Changed data to list because it will be searching in the API, not on the client side
        }
      </div>
    </div>
  );
}


const SearchForm = (({
  searchTerm,
  onSearchInput,
  onSearchSubmit }) => {
  return (
    <form onSubmit={onSearchSubmit} className={styles.SearchForm}>
      <InputWithLabel
        id="search"
        value={searchTerm}
        isFocused
        onInputChange={onSearchInput}
      >
        <strong>Search:</strong>
      </InputWithLabel>

      <button
        type="submit"
        disabled={!searchTerm}>
        Submit
</button>
    </form>)
})

// We can give the default value for type, but it can still be changed from outside
const InputWithLabel = ({ id, value, type = 'text', isFocused, onInputChange, children }) => {
  // Create a 'ref' with React's "useRef" hook
  // This is a persistent value over the lifecycle of a React component.
  const inputRef = React.useRef();

  // Use a hook into the lifecycle to focus when the component renders
  React.useEffect(() => {
    if (isFocused && inputRef.current) {
      // Access the ref attribute and set the focus
      inputRef.current.focus();
    }
  }, [isFocused])
  return (<div>
    <label htmlFor={id}>{children}</label>
    &nbsp;
    {/* JSX-reserved 'ref' attribute will get the inputRef value */}
    <input ref={inputRef} id={id} type={type} value={value} onChange={onInputChange} autoFocus={isFocused}></input>
  </div>)

};


const List = ({ list, onRemoveItem }) =>
  list.map(item => (
    <Item
      key={item.objectID}
      item={item}
      onRemoveItem={onRemoveItem}
    />
  ));

const Item = ({ item, onRemoveItem }) => {
  return (
    <div className={styles.item}>
      <span style={{width: '40%'}}>
        <a href={item.url}>{item.title}</a>
      </span>
      <span  style={{ width: '30%' }}>{item.author}</span>
      <span  style={{ width: '10%' }}>{item.num_comments}</span>
      <span style={{ width: '10%' }}>{item.points}</span>
      <span style={{ width: '10%' }}>
        <button type="button" className={`${styles.button} ${styles.buttonLarge}`} onClick={onRemoveItem.bind(null, item)}>Dismiss</button>
      </span>
    </div>
  )
}
export default App;
