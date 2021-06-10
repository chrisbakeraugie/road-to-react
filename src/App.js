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
  // if (action.type === 'SET_STORIES') {
  //   return action.payload;
  // } else if (action.type === 'REMOVE_STORY') {
  //   return (state.filter(story => (
  //     action.payload.objectID !== story.objectID
  //   )))
  // }
  // else {
  //   throw new Error();
  // }
}

const App = () => {

  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');

  // Replaced "useState" hook with a reducer, which can be used to handle more complicated state management
  // Then, replaced the multiple state hooks with ONE, to help manage/prevent "Impossible States"
  const [stories, dispatchStories] = React.useReducer(storiesReducer,
    { data: [], isLoading: false, isError: false });
  // const [isLoading, setIsLoading] = React.useState(false);
  // const [isError, setIsError] = React.useState(false); // Error handling if third party API errors

  React.useEffect(() => {
    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    getAsyncStories().then(result => {
      dispatchStories({
        type: "STORIES_FETCH_SUCCESS",
        payload: result.data.stories
      });
    }).catch(() => {
      dispatchStories({ type: 'STORIES_FETCH_FAILURE' });
    })
    // setIsLoading(true);
    // getAsyncStories().then(result => {
    //   dispatchStories({
    //     type: 'SET_STORIES',
    //     payload: result.data.stories
    //   });
    //   setIsLoading(false);
    // }).catch(() => {
    //   setIsError(true);
    // });
  }, [])

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

      {stories.isError && <p>Something went wrong...</p>}

      {stories.isLoading ? (
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
