// Dijkstra's Algorithm for shortest path
export function dijkstra(nodes, edges, startId, endId) {
  const graph = buildAdjacencyList(edges);
  const distances = {};
  const previous = {};
  const visited = new Set();
  const pq = [];

  nodes.forEach(node => {
    distances[node.id] = Infinity;
    previous[node.id] = null;
  });
  distances[startId] = 0;
  pq.push({ id: startId, dist: 0 });

  while (pq.length > 0) {
    pq.sort((a, b) => a.dist - b.dist);
    const { id: current } = pq.shift();

    if (current === endId) break;
    if (visited.has(current)) continue;
    visited.add(current);

    const neighbors = graph[current] || [];
    for (const { to, weight, edge } of neighbors) {
      if (edge.status === 'blocked') continue;
      const trafficMultiplier = 1 + (edge.traffic || 0);
      const adjustedWeight = weight * trafficMultiplier;
      const newDist = distances[current] + adjustedWeight;

      if (newDist < distances[to]) {
        distances[to] = newDist;
        previous[to] = { node: current, edge };
        pq.push({ id: to, dist: newDist });
      }
    }
  }

  // Reconstruct path
  const path = [];
  const pathEdges = [];
  let current = endId;
  while (current && previous[current]) {
    path.unshift(current);
    pathEdges.unshift(previous[current].edge);
    current = previous[current].node;
  }
  if (current === startId) path.unshift(startId);

  return {
    path,
    edges: pathEdges,
    distance: distances[endId],
    found: distances[endId] !== Infinity,
  };
}

// A* Algorithm
export function aStar(nodes, edges, startId, endId) {
  const nodeMap = {};
  nodes.forEach(n => nodeMap[n.id] = n);
  const graph = buildAdjacencyList(edges);

  const heuristic = (a, b) => {
    const nodeA = nodeMap[a];
    const nodeB = nodeMap[b];
    if (!nodeA || !nodeB) return 0;
    const dx = nodeA.lat - nodeB.lat;
    const dy = nodeA.lng - nodeB.lng;
    return Math.sqrt(dx * dx + dy * dy) * 111; // approx km
  };

  const openSet = [{ id: startId, f: 0, g: 0 }];
  const gScores = {};
  const previous = {};
  const closed = new Set();

  nodes.forEach(n => { gScores[n.id] = Infinity; });
  gScores[startId] = 0;

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();

    if (current.id === endId) break;
    if (closed.has(current.id)) continue;
    closed.add(current.id);

    const neighbors = graph[current.id] || [];
    for (const { to, weight, edge } of neighbors) {
      if (edge.status === 'blocked') continue;
      const trafficMultiplier = 1 + (edge.traffic || 0);
      const tentativeG = gScores[current.id] + weight * trafficMultiplier;

      if (tentativeG < gScores[to]) {
        gScores[to] = tentativeG;
        previous[to] = { node: current.id, edge };
        const f = tentativeG + heuristic(to, endId);
        openSet.push({ id: to, f, g: tentativeG });
      }
    }
  }

  const path = [];
  const pathEdges = [];
  let current = endId;
  while (current && previous[current]) {
    path.unshift(current);
    pathEdges.unshift(previous[current].edge);
    current = previous[current].node;
  }
  if (current === startId) path.unshift(startId);

  return {
    path,
    edges: pathEdges,
    distance: gScores[endId],
    found: gScores[endId] !== Infinity,
  };
}

// BFS for connectivity check
export function bfs(nodes, edges, startId) {
  const graph = buildAdjacencyList(edges.filter(e => e.status !== 'blocked'));
  const visited = new Set();
  const queue = [startId];
  visited.add(startId);

  while (queue.length > 0) {
    const current = queue.shift();
    const neighbors = graph[current] || [];
    for (const { to } of neighbors) {
      if (!visited.has(to)) {
        visited.add(to);
        queue.push(to);
      }
    }
  }
  return visited;
}

// Find articulation points (critical nodes)
export function findArticulationPoints(nodes, edges) {
  const graph = buildAdjacencyList(edges.filter(e => e.status !== 'blocked'));
  const visited = new Set();
  const disc = {};
  const low = {};
  const parent = {};
  const ap = new Set();
  let time = 0;

  function dfs(u) {
    visited.add(u);
    disc[u] = low[u] = ++time;
    let children = 0;

    for (const { to: v } of (graph[u] || [])) {
      if (!visited.has(v)) {
        children++;
        parent[v] = u;
        dfs(v);
        low[u] = Math.min(low[u], low[v]);
        if (!parent[u] && children > 1) ap.add(u);
        if (parent[u] && low[v] >= disc[u]) ap.add(u);
      } else if (v !== parent[u]) {
        low[u] = Math.min(low[u], disc[v]);
      }
    }
  }

  nodes.forEach(n => {
    if (!visited.has(n.id)) {
      parent[n.id] = null;
      dfs(n.id);
    }
  });

  return Array.from(ap);
}

// Find bridge edges (critical edges)
export function findBridgeEdges(nodes, edges) {
  const graph = buildAdjacencyList(edges.filter(e => e.status !== 'blocked'));
  const visited = new Set();
  const disc = {};
  const low = {};
  const parent = {};
  const bridges = [];
  let time = 0;

  function dfs(u) {
    visited.add(u);
    disc[u] = low[u] = ++time;

    for (const { to: v, edge } of (graph[u] || [])) {
      if (!visited.has(v)) {
        parent[v] = u;
        dfs(v);
        low[u] = Math.min(low[u], low[v]);
        if (low[v] > disc[u]) bridges.push(edge);
      } else if (v !== parent[u]) {
        low[u] = Math.min(low[u], disc[v]);
      }
    }
  }

  nodes.forEach(n => {
    if (!visited.has(n.id)) {
      parent[n.id] = null;
      dfs(n.id);
    }
  });

  return bridges;
}

// Calculate betweenness centrality
export function betweennessCentrality(nodes, edges) {
  const centrality = {};
  nodes.forEach(n => { centrality[n.id] = 0; });

  for (const source of nodes) {
    for (const target of nodes) {
      if (source.id === target.id) continue;
      const result = dijkstra(nodes, edges, source.id, target.id);
      if (result.found && result.path.length > 2) {
        result.path.slice(1, -1).forEach(nodeId => {
          centrality[nodeId] = (centrality[nodeId] || 0) + 1;
        });
      }
    }
  }

  // Normalize
  const n = nodes.length;
  const maxPossible = (n - 1) * (n - 2);
  if (maxPossible > 0) {
    Object.keys(centrality).forEach(key => {
      centrality[key] /= maxPossible;
    });
  }

  return centrality;
}

// Helper: build adjacency list
function buildAdjacencyList(edges) {
  const graph = {};
  edges.forEach(edge => {
    if (!graph[edge.from]) graph[edge.from] = [];
    if (!graph[edge.to]) graph[edge.to] = [];
    graph[edge.from].push({ to: edge.to, weight: edge.time, edge });
    graph[edge.to].push({ to: edge.from, weight: edge.time, edge });
  });
  return graph;
}
