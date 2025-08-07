export function isHamiltonianGreedy(graph) {
  const n = graph.length;
  const visited = Array(n).fill(false);
  const path = [0];
  visited[0] = true;

  for (let i = 1; i < n; i++) {
    const last = path[path.length - 1];
    let found = false;
    for (let j = 0; j < n; j++) {
      if (!visited[j] && graph[last][j] === 1) {
        path.push(j);
        visited[j] = true;
        found = true;
        break;
      }
    }
    if (!found) return false;
  }

  return true;
}
