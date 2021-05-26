import logo from './logo.svg';
import './App.css';
import React from 'react';

const App = () => {
  
  //Custom hooks example - naming conventions for hooks; start with 'use'
  const useSemiPersistentState = () => {
    const [searchTerm, setSearchTerm] = React.useState(localStorage.getItem('search') || '');

     /**
   * This React Hook is basically saying that whenever, wherever, searchTerm is updated through
   * setSearchTerm, localStorage will always be in sync
   */
    React.useEffect(() => {
      localStorage.setItem('search', searchTerm);
    }, [searchTerm]);

    return[searchTerm, setSearchTerm];
  }


  const stories = [
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

  const [searchTerm, setSearchTerm] = useSemiPersistentState();

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

      <Search onSearch={handleSearch} searchTerm={searchTerm} />
      <hr />
      <List list={searchedStories} />
    </div>
  );
}


const Search = (props) => {

  return (
    <div>
      <label htmlFor="search">Search:</label>
      <input id="search" type="text" onChange={props.onSearch}></input>

      <p>
        Searching for <strong>{props.searchTerm}</strong>
      </p>
    </div>
  );
};


const List = (props) =>
  props.list.map(item => (
    <div key={item.objectID}>
      <span>
        <a href={item.url}>{item.title} </a>
      </span>
      <span>{item.author} </span>
      <span>{item.num_comments}</span>
      <span>{item.points}</span>
    </div>
  ));

export default App;
