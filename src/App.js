// import logo from './logo.svg';
import './App.css';
import React from 'react';
import { resolve } from 'dns';

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

const initialStories = [
  {
    title: 'React',
    url: 'https://reactjs.org/', author: 'Jordan Walke', num_comments: 3,
    points: 4,
    objectID: 0,
  },
  {
    title: 'Redux',
    url: 'https://redux.js.org/', author: 'Dan Abramov, Andrew Clark', num_comments: 2,
    points: 5,
    objectID: 1,
  }
];

/**
 * This simulates fetching data from an API by creating a Promise
 * with an intentionally delayed resolution to practice rendering 
 * data asynchronously using React Hooks
 */
const getAsyncStories = () => (
  // return (Promise.resolve({ data: { stories: initialStories } }));
  new Promise(resolve => (
    setTimeout(
      () => resolve({ data: { stories: initialStories } })
      , 2300)
  ))
);

// Can be used to create more "declarative programming", instead of "imperative programming"
const storiesReducer = (state, action) => {
  if (action.type === 'SET_STORIES') {
    return action.payload;
  } else if (action.type === 'REMOVE_STORY') {
    return (state.filter(story => (
      action.payload.objectID !== story.objectID
    )))
  }
  else {
    throw new Error();
  }
}

const App = () => {

  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');

  // Replaced "useState" hook with a reducer, which can be used to handle more complicated state management
  const [stories, dispatchStories] = React.useReducer(storiesReducer, []);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false); // Error handling if third party API errors

  React.useEffect(() => {
    setIsLoading(true);
    getAsyncStories().then(result => {
      dispatchStories({
        type: 'SET_STORIES',
        payload: result.data.stories
      });
      setIsLoading(false);
    }).catch(() => {
      setIsError(true);
    });
  }, [])

  // Removed the "removeStory" logic from the handler to the reducer
  const handleRemoveStory = item => {
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item
    });
  }

  const searchedStories = stories.filter((story) => {
    return story.title.toLowerCase().includes(searchTerm.toLowerCase());
  })

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    localStorage.setItem('search', event.target.value);
  }

  return (
    <div className="App">

      <h1>Hacker Stories</h1>

      <InputWithLabel
        id="search"
        value={searchTerm}
        isFocused
        onInputChange={handleSearch}
      >
        <strong>Search:</strong>
      </InputWithLabel>
      <hr />

      {isError && <p>Something went wrong...</p>}

      {isLoading ? (
        <p>Loading...</p>
      ) : <List list={searchedStories} onRemoveItem={handleRemoveStory} />
      }
    </div>
  );
}

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
  const handleRemoveItem = () => {
    onRemoveItem(item);
  }

  return (
    <div>
      <span>
        <a href={item.url}>{item.title}</a>
      </span>
      <span>{item.author}</span>
      <span>{item.num_comments}</span>
      <span>{item.points}</span>
      <span>
        {/* This first method of handler is recommended because: \
          1. It is easier to read (method is above anyway)
          2. It is easier to debug*/}
        <button type="button" onClick={onRemoveItem.bind(null, item)}>Dismiss</button>
        {/* This second method of handler is also acceptable, but is slightly harder to debug */}
        <button type="button" onClick={() => onRemoveItem(item)}>Dismiss (inline)</button>
        {/* This third method is never recommended */}
        <button type="button" onClick={() => {
          onRemoveItem(item);
        }}>Dismiss (wholly defined inline)</button>
      </span>
    </div>
  )
}
export default App;
