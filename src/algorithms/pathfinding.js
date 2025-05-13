// src/algorithms/pathfinding.js

// Obtém todos os nós do grid (flatten 2D -> 1D)
function getAllNodes(grid) {
    const nodes = [];
    for (const row of grid) {
      for (const node of row) {
        nodes.push(node);
      }
    }
    return nodes;
  }
  
  // Remove nós já visitados e ordena pelo menor "distance" (para Dijkstra)
  function sortNodesByDistance(unvisited) {
    unvisited.sort((a, b) => a.distance - b.distance);
  }
  
  // Calcula vizinhos não visitados de um nó (cima, baixo, esquerda, direita)
  function getUnvisitedNeighbors(node, grid) {
    const neighbors = [];
    const {row, col} = node;
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
    return neighbors.filter(neighbor => !neighbor.isVisited);
  }
  
  // Algoritmo de Dijkstra (grade com pesos iguais, similar a BFS)
  export function dijkstra(grid, startNode, endNode) {
    const visitedNodesInOrder = [];
    // Inicializa distâncias
    for (const row of grid) {
      for (const node of row) {
        node.distance = Infinity;
        node.previousNode = null;
        node.isVisited = false;
      }
    }
    startNode.distance = 0;
    
    const unvisited = getAllNodes(grid);
  
    while (unvisited.length > 0) {
      sortNodesByDistance(unvisited);
      const closestNode = unvisited.shift(); // nó com menor distância
      if (closestNode.isWall) continue;       // ignora obstáculos
      if (closestNode.distance === Infinity) break; // não alcançável
  
      closestNode.isVisited = true;
      visitedNodesInOrder.push(closestNode);
      
      if (closestNode === endNode) {
        // Encontrou o final; encerra o loop
        break;
      }
  
      const unvisitedNeighbors = getUnvisitedNeighbors(closestNode, grid);
      for (const neighbor of unvisitedNeighbors) {
        if (neighbor.isWall) continue;
        const newDist = closestNode.distance + 1;
        if (newDist < neighbor.distance) {
          neighbor.distance = newDist;
          neighbor.previousNode = closestNode;
        }
      }
    }
    return visitedNodesInOrder;
  }
  
  // Heurística de Manhattan para A*
  function heuristic(nodeA, nodeB) {
    return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
  }
  
  // Algoritmo A* (usando heurística de Manhattan)
  export function astar(grid, startNode, endNode) {
    const visitedNodesInOrder = [];
    // Inicializa custos
    for (const row of grid) {
      for (const node of row) {
        node.gCost = Infinity;
        node.fCost = Infinity;
        node.previousNode = null;
        node.isVisited = false;
      }
    }
    startNode.gCost = 0;
    startNode.fCost = heuristic(startNode, endNode);
  
    const openSet = [startNode];
  
    while (openSet.length > 0) {
      // Seleciona nó com menor fCost
      openSet.sort((a, b) => a.fCost - b.fCost);
      const current = openSet.shift();
      if (current.isWall) continue;
      if (current.gCost === Infinity) break;
  
      current.isVisited = true;
      visitedNodesInOrder.push(current);
  
      if (current === endNode) {
        // Encontrou o final
        break;
      }
  
      // Para cada vizinho
      const neighbors = getUnvisitedNeighbors(current, grid);
      for (const neighbor of neighbors) {
        if (neighbor.isWall || neighbor.isVisited) continue;
  
        const tentativeG = current.gCost + 1;
        if (tentativeG < neighbor.gCost) {
          neighbor.previousNode = current;
          neighbor.gCost = tentativeG;
          neighbor.fCost = tentativeG + heuristic(neighbor, endNode);
          if (!openSet.includes(neighbor)) {
            openSet.push(neighbor);
          }
        }
      }
    }
    return visitedNodesInOrder;
  }
  
  // Reconstrói o caminho mais curto de endNode até startNode
  export function reconstructPath(endNode) {
    const nodesInPath = [];
    let current = endNode;
    while (current !== null) {
      nodesInPath.unshift(current);
      current = current.previousNode;
    }
    return nodesInPath;
  }
  