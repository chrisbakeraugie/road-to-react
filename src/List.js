
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

const StyledColumn = styled.span` padding: 0 5px;
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
  console.log("B: List") || // This works because this is no a function body and the left hand side always evaluates to false
  list.map(item => (
    <Item
      key={item.objectID}
      item={item}
      onRemoveItem={onRemoveItem}
    />
  )));

const Item = ({ item, onRemoveItem }) => {
  return (
    <StyledItem>
      <StyledColumn style={{ width: '40%' }}>
        <a href={item.url}>{item.title}</a>
      </StyledColumn>
      <StyledColumn >{item.author}</StyledColumn>
      <StyledColumn style={{ width: '10%' }}>{item.num_comments}</StyledColumn>
      <StyledColumn style={{ width: '10%' }}>{item.points}</StyledColumn>
      <StyledColumn style={{ width: '10%' }}>
        <StyledButtonLarge type="button" onClick={() => onRemoveItem(item)}>
          Dismiss
        </StyledButtonLarge>
      </StyledColumn>
    </StyledItem>
  )
}

export { List, Item };