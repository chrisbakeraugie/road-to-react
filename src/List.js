
import React from 'react';
import styled from 'styled-components';
import { sortBy } from 'lodash';

const StyledButton = styled.button` background: transparent;
border: 1px solid #171212; padding: 5px;
  cursor: pointer;
transition: all 0.1s ease-in;
  &:hover {
    background: #171212;
    color: #ffffff;
} `;

// const StyledButtonSmall = styled(StyledButton)` padding: 5px;
// `;
const StyledButtonLarge = styled(StyledButton)` padding: 10px;
`;

// const StyledItem = styled.div`
// display: flex;
// align-items: center;
// padding-bottom: 5px;
// `;

const span = styled.span` padding: 0 5px;
white-space: nowrap;
overflow: hidden;
white-space: nowrap; text-overflow: ellipsis;
a{
color: inherit;
}
width: ${props => props.width};
`;

/**
 * If your component renders the same result if given the same props,
 * you can wrap it in React.memo for a performance boost.
 * React will skip rendering the component and re-use the last rendered result
 */
const List = React.memo(({ list, onRemoveItem }) => {
  // console.log("B: List") || // This works because this is no a function body and the left hand side always evaluates to false

  const [sort, setSort] = React.useState('NONE');

  // Object that stores the return function for each sort type
  const SORTS = {
    NONE: list => list,
    TITLE: list => sortBy(list, 'title'),
    AUTHOR: list => sortBy(list, 'author'),
    COMMENT: list => sortBy(list, 'num_comments').reverse(),
    POINT: list => sortBy(list, 'points').reverse()
  };

  // Changes state for the new sort type
  const handleSort = sortKey => {
    setSort(sortKey);
  };

  // Stores the returned function from the SORTS object
  const sortFunction = SORTS[sort];
  // Stores sorted list returned from above function
  const sortedList = sortFunction(list);

  return (
    <div>
      <div style={{ display: 'flex' }}>
        <span style={{ width: '40%' }}><button type="button" onClick={() => handleSort('TITLE')}>Title</button></span>
        <span style={{ width: '30%' }}><button type="button" onClick={() => handleSort('AUTHOR')}>Author</button></span>
        <span style={{ width: '10%' }}><button type="button" onClick={() => handleSort('COMMENT')}>Comment</button></span>
        <span style={{ width: '10%' }}><button type="button" onClick={() => handleSort('POINT')}>Point</button></span>
        <span style={{ width: '10%' }}>Actions</span>
      </div>

      {sortedList.map(item => (
        <Item
          key={item.objectID}
          item={item}
          onRemoveItem={onRemoveItem}
        />
      ))}
    </div>
  )
}
);

const Item = ({ item, onRemoveItem }) => {
  return (
    <div style={{ display: 'flex' }}>
      <span style={{ width: '40%' }}>
        <a href={item.url}>{item.title}</a>
      </span>
      <span style={{ width: '30%' }} >{item.author}</span>
      <span style={{ width: '10%' }}>{item.num_comments}</span>
      <span style={{ width: '10%' }}>{item.points}</span>
      <span style={{ width: '10%' }}>
        <StyledButtonLarge type="button" onClick={() => onRemoveItem(item)}>
          Dismiss
        </StyledButtonLarge>
      </span>
    </div>
  )
}

export default List;