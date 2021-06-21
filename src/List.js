
import React from 'react';
import styled from 'styled-components';

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

const StyledItem = styled.div`
display: flex;
align-items: center;
padding-bottom: 5px;
`;

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
const List = React.memo(({ list, onRemoveItem }) =>
  // console.log("B: List") || // This works because this is no a function body and the left hand side always evaluates to false
  <div>
    <div style={{ display: 'flex' }}>
      <span style={{ width: '40%' }}>Title</span>
      <span style={{ width: '30%' }}>Author</span>
      <span style={{ width: '10%' }}>Comments</span>
      <span style={{ width: '10%' }}>Points</span>
      <span style={{ width: '10%' }}>Actions</span>
    </div>

    {list.map(item => (
      <Item
        key={item.objectID}
        item={item}
        onRemoveItem={onRemoveItem}
      />
    ))}
  </div>
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