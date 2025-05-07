// src/App.js
import React, { useState, useEffect } from 'react';
import Node from './components/Node';
import { dijkstra, astar, reconstructPath } from './algorithms/pathfinding';
import './App.css';

const NUM_ROWS = 20;
const NUM_COLS = 50;

function App() {
  const [grid, setGrid] = useState([]);
  const [startPos, setStartPos] = useState(null);
  const [endPos, setEndPos] = useState(null);
  const [mode, setMode] = useState('start');
  const [dijkstraResult, setDijkstraResult] = useState(null);
  const [astarResult, setAstarResult] = useState(null);

  useEffect(() => {
    setGrid(initGrid());
  }, []);

  const initGrid = () =>
    Array.from({ length: NUM_ROWS }, (_, row) =>
      Array.from({ length: NUM_COLS }, (_, col) => createNode(row, col))
    );

  const createNode = (row, col) => ({
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
  });

  const handleCellClick = (row, col) => {
    setGrid(prev => {
      const newGrid = prev.map(r => r.map(n => ({ ...n })));
      const node = newGrid[row][col];
      if (mode === 'start') {
        if (startPos) newGrid[startPos.row][startPos.col].isStart = false;
        node.isStart = true;
        setStartPos({ row, col });
      } else if (mode === 'end') {
        if (endPos) newGrid[endPos.row][endPos.col].isEnd = false;
        node.isEnd = true;
        setEndPos({ row, col });
      } else if (mode === 'wall') {
        if (!node.isStart && !node.isEnd) node.isWall = !node.isWall;
      }
      return newGrid;
    });
  };

  const clearPath = () => {
    setGrid(prev =>
      prev.map(row =>
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
  };

  const animate = (visited, path, callback) => {
    visited.forEach((node, i) => {
      setTimeout(() => {
        setGrid(prev =>
          prev.map(row =>
            row.map(cell =>
              cell.row === node.row && cell.col === node.col && !cell.isStart && !cell.isEnd
                ? { ...cell, isVisited: true }
                : cell
            )
          )
        );
      }, 20 * i);
    });
    const visitDelay = 20 * visited.length;
    path.forEach((node, j) => {
      setTimeout(() => {
        setGrid(prev =>
          prev.map(row =>
            row.map(cell =>
              cell.row === node.row && cell.col === node.col && !cell.isStart && !cell.isEnd
                ? { ...cell, isPath: true }
                : cell
            )
          )
        );
      }, visitDelay + 50 * j);
    });
    // Call callback after full animation
    if (callback) {
      const totalDelay = visitDelay + 50 * path.length;
      setTimeout(callback, totalDelay);
    }
  };

  const visualizeDijkstra = () => {
    if (!startPos || !endPos) return;
    clearPath();
    const gridCopy = grid.map(row => row.map(n => ({ ...n })));
    const startNode = gridCopy[startPos.row][startPos.col];
    const endNode = gridCopy[endPos.row][endPos.col];
    const visited = dijkstra(gridCopy, startNode, endNode);
    const path = reconstructPath(endNode);
    // Executa animação e só então define resultados
    animate(visited, path, () => {
      const time = (visited.length + path.length).toFixed(2); // opcional calcular real tempo
      setDijkstraResult({
        time: '---', // ou medir separadamente
        visited: visited.length,
        pathLength: path.length,
      });
    });
  };

  const visualizeAstar = () => {
    if (!startPos || !endPos) return;
    clearPath();
    const gridCopy = grid.map(row => row.map(n => ({ ...n })));
    const startNode = gridCopy[startPos.row][startPos.col];
    const endNode = gridCopy[endPos.row][endPos.col];
    const visited = astar(gridCopy, startNode, endNode);
    const path = reconstructPath(endNode);
    animate(visited, path, () => {
      setAstarResult({
        time: '---',
        visited: visited.length,
        pathLength: path.length,
      });
    });
  };

  const resetGrid = () => {
    setGrid(initGrid());
    setStartPos(null);
    setEndPos(null);
    setDijkstraResult(null);
    setAstarResult(null);
  };

  return (
    <div className="App">
      <h1>Visualizador de Pathfinding</h1>
      <div className="controls">
        <button className={mode === 'start' ? 'selected' : ''} onClick={() => setMode('start')}>Definir Início</button>
        <button className={mode === 'end' ? 'selected' : ''} onClick={() => setMode('end')}>Definir Fim</button>
        <button className={mode === 'wall' ? 'selected' : ''} onClick={() => setMode('wall')}>Obstáculos</button>
        <button onClick={visualizeDijkstra}>Executar Dijkstra</button>
        <button onClick={visualizeAstar}>Executar A*</button>
        <button onClick={resetGrid}>Resetar Grid</button>
      </div>
      <div className="metrics">
        {dijkstraResult && (
          <div>
            <h3>Dijkstra:</h3>
            <p>Nós visitados: {dijkstraResult.visited} | Comprimento do caminho: {dijkstraResult.pathLength}</p>
          </div>
        )}
        {astarResult && (
          <div>
            <h3>A*:</h3>
            <p>Nós visitados: {astarResult.visited} | Comprimento do caminho: {astarResult.pathLength}</p>
          </div>
        )}
      </div>
      <div className="grid">
        {grid.map((row, i) => (
          <div key={i} className="grid-row">
            {row.map(node => (
              <Node key={`${node.row}-${node.col}`} {...node} onClick={handleCellClick} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
