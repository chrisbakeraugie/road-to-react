import { render, screen } from '@testing-library/react';
import App, { storiesReducer, Item, List, SearchForm, InputWithLabel } from './App';
import { expression } from '@babel/template';


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
    const state = { data: stories, isLoading: false, isError: false};

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
