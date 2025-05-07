// src/components/Node.js
import React from 'react';
import './Node.css';  // Estilos específicos (caso deseje separá-los)

function Node(props) {
  const {
    row, col,
    isStart, isEnd, isWall, isVisited, isPath,
    onClick,
  } = props;

  // Determina a classe CSS com base no estado do nó
  const extraClassName = isStart
    ? 'node-start'
    : isEnd
      ? 'node-end'
      : isWall
        ? 'node-wall'
        : isPath
          ? 'node-path'
          : isVisited
            ? 'node-visited'
            : '';

  return (
    <div
      id={`node-${row}-${col}`}
      className={`node ${extraClassName}`}
      onClick={() => onClick(row, col)}
    ></div>
  );
}

export default Node;