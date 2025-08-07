export function isHamiltonianDFS(graph) {
  const n = graph.length;
  const visited = Array(n).fill(false);
  const path = [];

  function dfs(v, depth) {
    path.push(v);
    visited[v] = true;

    if (depth === n) return true;

    for (let u = 0; u < n; u++) {
      if (graph[v][u] === 1 && !visited[u]) {
        if (dfs(u, depth + 1)) return true;
      }
    }

    visited[v] = false;
    path.pop();
    return false;
  }

  for (let i = 0; i < n; i++) {
    visited.fill(false);
    path.length = 0;
    if (dfs(i, 1)) return true;
  }

  return false;
}
