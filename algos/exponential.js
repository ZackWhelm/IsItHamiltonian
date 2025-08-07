export function isHamiltonianExponential(graph) {
  const n = graph.length;
  const nodes = Array.from({ length: n }, (_, i) => i);

  function isHamiltonianPath(perm) {
    for (let i = 0; i < perm.length - 1; i++) {
      if (graph[perm[i]][perm[i + 1]] !== 1) return false;
    }
    // Check if it forms a cycle
    return graph[perm[perm.length - 1]][perm[0]] === 1;
  }

  function* permutations(arr, l = 0) {
    if (l === arr.length - 1) {
      yield arr.slice();
    } else {
      for (let i = l; i < arr.length; i++) {
        [arr[l], arr[i]] = [arr[i], arr[l]];
        yield* permutations(arr, l + 1);
        [arr[l], arr[i]] = [arr[i], arr[l]];
      }
    }
  }

  for (const perm of permutations(nodes)) {
    if (isHamiltonianPath(perm)) return true;
  }

  return false;
}
