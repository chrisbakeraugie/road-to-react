// create-react-app includes these necessary functions for component testing
import { render, screen, fireEvent, act } from '@testing-library/react';
import App, { storiesReducer, Item, List, SearchForm, InputWithLabel } from './App';
import { expression } from '@babel/template';
import { notDeepStrictEqual } from 'assert';


// the describe() is our TEST SUITE
describe('something truthy and falsy', () => {

  // test() is our TEST CASE
  test('true to be true', () => {
    // expect(true).toBe(true);
    expect(true).toBeTruthy();
  });

  test('false to be false', () => {
    // expect(false).toBe(false);
    expect(false).toBeFalsy();
  })
})

describe('App component', () => {
  test('removes an item when clicking the Dismiss button', () => {

  });

  test('requests some intial stories from an API', () => {

  });
})

// ---------------------- UNIT TESTING: FUNCTIONS ---------------------- //

// Just made up test data
const storyOne = {
  title: 'React',
  url: 'https://reactjs.org/', author: 'Jordan Walke', num_comments: 3,
  points: 4,
  objectID: 0,
};

const storyTwo = {
  title: 'Redux',
  url: 'https://redux.js.org/', author: 'Dan Abramov, Andrew Clark', num_comments: 2,
  points: 5,
  objectID: 1,
};

const stories = [storyOne, storyTwo];

describe('storiesReducer', () => {
  test('removes a story from all stories', () => {
    const action = { type: 'REMOVE_STORY', payload: storyOne };
    const state = { data: stories, isLoading: false, isError: false };

    const newState = storiesReducer(state, action);

    const expectedState = {
      data: [storyTwo],
      isLoading: false,
      isError: false
    };

    // toBe comparison will fail because it doesn't compare the content of the objects;
    // it is comparing the object reference. toStrictEqual will compare content instead
    expect(newState).toStrictEqual(expectedState);
  })
})

// ---------------------- UNIT TESTING: COMPONENTS ---------------------- //
describe('Item', () => {
  test('renders all properties', () => {
    render(<Item item={storyOne} />);

    // getByText grabs the element by the text and the "toBeInTheDoc.." and 
    // "toHaveAttribute" test if the characteristics are correct
    expect(screen.getByText('Jordan Walke')).toBeInTheDocument();
    expect(screen.getByText('React')).toHaveAttribute('href', 'https://reactjs.org/')

    // Get in the habit of using React Testing Library's (RTL's) debug function
    // It gives a useful overview of what is rendered and informs best way to proceed
    // with testing
    screen.debug();
  });

  test('renders clickable "Dismiss" button', () => {
    render(<Item item={storyOne} />, () => {
      // getByRole retrieves by aria-label attributes
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  /**
   * This tests that the button calls the callback handler.
   * It does NOT actually execute the logic of that handler
   */
  test('clicking the dismiss button calls the callback handler', () => {
    // This returns us a "mock" for the actual function and lets us capture when it's called
    const handleRemoveItem = jest.fn();

    render(<Item item={storyOne} onRemoveItem={handleRemoveItem} />);

    fireEvent.click(screen.getByRole('button'));

    expect(handleRemoveItem).toHaveBeenCalledTimes(1);
  })
});

describe('SearchForm', () => {
  const searchFormProps = {
    searchTerm: 'React',
    onSearchInput: jest.fn(),
    onSearchSubmit: jest.fn()
  };

  test('renders the input field with its value', () => {
    render(<SearchForm {...searchFormProps} />);

    expect(screen.getByDisplayValue('React')).toBeInTheDocument();

  });

  test('renders the correct label', () => {
    render(<SearchForm {...searchFormProps} />);

    // Using a basic regex to match 'Search', we can find the search text
    // without having to use the colon (Example: getByLabelText('Search:'))
    expect(screen.getByLabelText(/Search/)).toBeInTheDocument(); 
  });

  test('calls onSearchInput on input field change', () => {
    render(<SearchForm {...searchFormProps} />);

    fireEvent.change(screen.getByDisplayValue('React'),{
      target: {value: 'Redux'}
    });

    expect(searchFormProps.onSearchInput).toHaveBeenCalledTimes(1);
  });

  test('calls searchSubmit on button submit click', () => {
    render(<SearchForm {...searchFormProps} />);

    fireEvent.submit(screen.getByRole('button'));
    
    expect(searchFormProps.onSearchSubmit).toHaveBeenCalledTimes(1);
  })
})