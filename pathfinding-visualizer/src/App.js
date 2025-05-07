// src/App.js
import React, { useState, useEffect } from 'react';
import Node from './components/Node';
import { dijkstra, astar, reconstructPath } from './algorithms/pathfinding';
import './App.css';

const NUM_ROWS = 20;
const NUM_COLS = 50;

function App() {
  const [grid, setGrid] = useState([]);
  // Armazena coordenadas ao invés de objetos para manter referência correta
  const [startPos, setStartPos] = useState(null); // {row, col}
  const [endPos, setEndPos] = useState(null);     // {row, col}
  const [mode, setMode] = useState('start'); // 'start', 'end', 'wall'
  const [dijkstraResult, setDijkstraResult] = useState(null);
  const [astarResult, setAstarResult] = useState(null);

  useEffect(() => {
    setGrid(initializeGrid());
  }, []);

  // Cria grid inicial
  function initializeGrid() {
    return Array.from({ length: NUM_ROWS }, (_, row) =>
      Array.from({ length: NUM_COLS }, (_, col) => createNode(row, col))
    );
  }

  // Cria nó base
  function createNode(row, col) {
    return {
      row,
      col,
      isStart: false,
      isEnd: false,
      isWall: false,
      isVisited: false,
      isPath: false,
      distance: Infinity,
      previousNode: null,
      gCost: Infinity,
      fCost: Infinity,
    };
  }

  // Lida com clique no grid de acordo com modo atual
  function handleCellClick(row, col) {
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(r => r.map(node => ({ ...node })));
      const node = newGrid[row][col];

      if (mode === 'start') {
        // Remove antigo start
        if (startPos) newGrid[startPos.row][startPos.col].isStart = false;
        node.isStart = true;
        setStartPos({ row, col });
      } else if (mode === 'end') {
        if (endPos) newGrid[endPos.row][endPos.col].isEnd = false;
        node.isEnd = true;
        setEndPos({ row, col });
      } else if (mode === 'wall') {
        // Toggle parede
        if (!node.isStart && !node.isEnd) {
          node.isWall = !node.isWall;
        }
      }

      return newGrid;
    });
  }

  // Limpa marcações de busca e caminho
  function clearPath() {
    setGrid(prevGrid =>
      prevGrid.map(row =>
        row.map(node => ({
          ...node,
          isVisited: false,
          isPath: false,
          distance: Infinity,
          previousNode: null,
          gCost: Infinity,
          fCost: Infinity,
        }))
      )
    );
    setDijkstraResult(null);
    setAstarResult(null);
  }

  // Animação de nós visitados e caminho
  function animate(visitedNodes, pathNodes) {
    // Visitação
    visitedNodes.forEach((node, i) => {
      setTimeout(() => {
        setGrid(prevGrid =>
          prevGrid.map(row =>
            row.map(cell =>
              cell.row === node.row && cell.col === node.col && !cell.isStart && !cell.isEnd
                ? { ...cell, isVisited: true }
                : cell
            )
          )
        );
      }, 20 * i);
    });
    // Caminho final
    const delay = 20 * visitedNodes.length;
    pathNodes.forEach((node, j) => {
      setTimeout(() => {
        setGrid(prevGrid =>
          prevGrid.map(row =>
            row.map(cell =>
              cell.row === node.row && cell.col === node.col && !cell.isStart && !cell.isEnd
                ? { ...cell, isPath: true }
                : cell
            )
          )
        );
      }, delay + 50 * j);
    });
  }

  // Executa Dijkstra
  function visualizeDijkstra() {
    if (!startPos || !endPos) return;
    clearPath();
    const gridCopy = grid.map(row => row.map(node => ({ ...node })));
    const startNode = gridCopy[startPos.row][startPos.col];
    const endNode = gridCopy[endPos.row][endPos.col];

    const startTime = performance.now();
    const visited = dijkstra(gridCopy, startNode, endNode);
    const path = reconstructPath(endNode);
    const endTime = performance.now();

    setDijkstraResult({
      time: (endTime - startTime).toFixed(2),
      visited: visited.length,
      pathLength: path.length,
    });
    animate(visited, path);
  }

  // Executa A*
  function visualizeAstar() {
    if (!startPos || !endPos) return;
    clearPath();
    const gridCopy = grid.map(row => row.map(node => ({ ...node })));
    const startNode = gridCopy[startPos.row][startPos.col];
    const endNode = gridCopy[endPos.row][endPos.col];

    const startTime = performance.now();
    const visited = astar(gridCopy, startNode, endNode);
    const path = reconstructPath(endNode);
    const endTime = performance.now();

    setAstarResult({
      time: (endTime - startTime).toFixed(2),
      visited: visited.length,
      pathLength: path.length,
    });
    animate(visited, path);
  }

  // Reset completo
  function resetGrid() {
    setGrid(initializeGrid());
    setStartPos(null);
    setEndPos(null);
    setDijkstraResult(null);
    setAstarResult(null);
  }

  return (
    <div className="App">
      <h1>Visualizador de Pathfinding (Dijkstra vs A*)</h1>
      <div className="controls">
        <button className={mode === 'start' ? 'selected' : ''} onClick={() => setMode('start')}>
          Definir Início
        </button>
        <button className={mode === 'end' ? 'selected' : ''} onClick={() => setMode('end')}>
          Definir Fim
        </button>
        <button className={mode === 'wall' ? 'selected' : ''} onClick={() => setMode('wall')}>
          Obstáculos
        </button>
        <button onClick={visualizeDijkstra}>Executar Dijkstra</button>
        <button onClick={visualizeAstar}>Executar A*</button>
        <button onClick={resetGrid}>Resetar Grid</button>
      </div>
      <div className="metrics">
        {dijkstraResult && (
          <div>
            <h3>Dijkstra:</h3>
            <p>Tempo: {dijkstraResult.time} ms | Nós visitados: {dijkstraResult.visited} | Comprimento do caminho: {dijkstraResult.pathLength}</p>
          </div>
        )}
        {astarResult && (
          <div>
            <h3>A*:</h3>
            <p>Tempo: {astarResult.time} ms | Nós visitados: {astarResult.visited} | Comprimento do caminho: {astarResult.pathLength}</p>
          </div>
        )}
      </div>
      <div className="grid">
        {grid.map((row, rowIdx) => (
          <div key={rowIdx} className="grid-row">
            {row.map(node => (
              <Node
                key={`${node.row}-${node.col}`}
                row={node.row}
                col={node.col}
                isStart={node.isStart}
                isEnd={node.isEnd}
                isWall={node.isWall}
                isVisited={node.isVisited}
                isPath={node.isPath}
                onClick={handleCellClick}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;