// src/App.js
import React, { useState, useEffect } from 'react';
import Node from './components/Node';
import { dijkstra, astar, reconstructPath } from './algorithms/pathfinding';
import './App.css';

const NUM_ROWS = 20;
const NUM_COLS = 50;

function App() {
  // Estado do grid (matriz de nós)
  const [grid, setGrid] = useState([]);
  // Estado para rastrear pontos inicial e final
  const [startNode, setStartNode] = useState(null);
  const [endNode, setEndNode] = useState(null);
  // Resultados (métricas) para comparação
  const [dijkstraResult, setDijkstraResult] = useState(null);
  const [astarResult, setAstarResult] = useState(null);

  // Inicializa o grid ao montar o componente
  useEffect(() => {
    const initialGrid = createGrid();
    setGrid(initialGrid);
  }, []);

  // Cria um grid inicial com nós vazios
  function createGrid() {
    const grid = [];
    for (let row = 0; row < NUM_ROWS; row++) {
      const currentRow = [];
      for (let col = 0; col < NUM_COLS; col++) {
        currentRow.push(createNode(row, col));
      }
      grid.push(currentRow);
    }
    return grid;
  }

  // Cria um objeto nó básico
  function createNode(row, col) {
    return {
      row,
      col,
      isStart: false,
      isEnd: false,
      isWall: false,
      isVisited: false,
      isPath: false,
      distance: Infinity, // para Dijkstra
      previousNode: null,
      gCost: Infinity,     // para A*
      fCost: Infinity,
    };
  }

  // Função chamada ao clicar em uma célula do grid
  function handleCellClick(row, col) {
    const newGrid = grid.slice().map(r => r.slice()); // copia profunda superficial
    const node = newGrid[row][col];

    // Se ainda não houve ponto inicial definido
    if (!startNode) {
      node.isStart = true;
      setStartNode(node);
    }
    // Se já há início mas não há fim definido
    else if (!endNode) {
      node.isEnd = true;
      setEndNode(node);
    }
    // Se ambos já definidos, alterna parede (obstáculo), desde que não seja start ou end
    else {
      if (!node.isStart && !node.isEnd) {
        node.isWall = !node.isWall;
      }
    }
    setGrid(newGrid);
  }

  // Limpa marcações de caminho anterior (visitado, path) mantendo paredes e pontos fixos
  function clearPath() {
    const newGrid = grid.map(row =>
      row.map(node => {
        return {
          ...node,
          isVisited: false,
          isPath: false,
          distance: Infinity,
          previousNode: null,
          gCost: Infinity,
          fCost: Infinity,
        };
      })
    );
    setGrid(newGrid);
  }

  // Executa o algoritmo Dijkstra com animação
  async function visualizeDijkstra() {
    if (!startNode || !endNode) return; // precisa de início e fim
    clearPath();
    const startTime = performance.now();
    const visitedNodes = dijkstra(grid, startNode, endNode);
    const pathNodes = reconstructPath(endNode);
    const endTime = performance.now();
    // Guarda métricas
    setDijkstraResult({
      time: (endTime - startTime).toFixed(2),
      visited: visitedNodes.length,
      pathLength: pathNodes.length,
    });
    animate(visitedNodes, pathNodes);
  }

  // Executa o algoritmo A* com animação
  async function visualizeAstar() {
    if (!startNode || !endNode) return;
    clearPath();
    const startTime = performance.now();
    const visitedNodes = astar(grid, startNode, endNode);
    const pathNodes = reconstructPath(endNode);
    const endTime = performance.now();
    setAstarResult({
      time: (endTime - startTime).toFixed(2),
      visited: visitedNodes.length,
      pathLength: pathNodes.length,
    });
    animate(visitedNodes, pathNodes);
  }

  // Anima nós visitados e, depois, o caminho mais curto
  function animate(visitedNodes, pathNodes) {
    for (let i = 0; i <= visitedNodes.length; i++) {
      if (i === visitedNodes.length) {
        // Depois de visitar todos, inicia a animação do caminho final
        setTimeout(() => {
          for (let j = 0; j < pathNodes.length; j++) {
            const node = pathNodes[j];
            if (!node.isStart && !node.isEnd) {
              setTimeout(() => {
                node.isPath = true;
                setGrid(grid => [...grid]); // dispara re-render
              }, 50 * j);
            }
          }
        }, 10 * i);
        return;
      }
      // Marca cada nó como visitado, exceto start/end
      setTimeout(() => {
        const node = visitedNodes[i];
        if (!node.isStart && !node.isEnd) {
          node.isVisited = true;
          setGrid(grid => [...grid]); // dispara re-render
        }
      }, 10 * i);
    }
  }

  return (
    <div className="App">
      <h1>Visualizador de Pathfinding (Dijkstra vs A*)</h1>
      <div className="controls">
        <button onClick={visualizeDijkstra}>Executar Dijkstra</button>
        <button onClick={visualizeAstar}>Executar A*</button>
        <button onClick={() => {
          // Reinicializa grid completamente (remove paredes, start, end)
          const freshGrid = createGrid();
          setGrid(freshGrid);
          setStartNode(null);
          setEndNode(null);
          setDijkstraResult(null);
          setAstarResult(null);
        }}>Resetar Grid</button>
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
            {row.map((node, nodeIdx) => (
              <Node
                key={nodeIdx}
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
