import { render, screen } from '@testing-library/react';
import App from './App';


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