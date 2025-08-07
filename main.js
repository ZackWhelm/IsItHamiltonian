import { isHamiltonianDFS } from './algos/dfs.js';
import { isHamiltonianExponential } from './algos/exponential.js';
import { isHamiltonianGreedy } from './algos/greedy.js';

const algorithmMap = {
  dfs: isHamiltonianDFS,
  exponential: isHamiltonianExponential,
  greedy: isHamiltonianGreedy,
};

document.getElementById('checkButton').addEventListener('click', () => {
  const matrixInput = document.getElementById('matrixInput').value;
  const selectedAlgo = document.getElementById('algorithmSelect').value;
  const resultEl = document.getElementById('result');
  const timeTakenEl = document.getElementById('timeTaken');

  let matrix;
  try {
    matrix = matrixInput
      .trim()
      .split('\n')
      .map(row => row.split(',').map(Number));
  } catch (e) {
    resultEl.textContent = "❌ Invalid matrix.";
    return;
  }

  const start = performance.now();
  let result;

  try {
    if (selectedAlgo === 'dfs') {
      result = isHamiltonianDFS(matrix);
    } else if (selectedAlgo === 'exponential') {
      result = isHamiltonianExponential(matrix);
    } else if (selectedAlgo === 'greedy') {
      result = isHamiltonianGreedy(matrix);
    } else if (selectedAlgo === 'custom') {
      const codeInput = document.getElementById('customAlgoInput').value;
      const customFunc = new Function(`${codeInput}; return customAlgo;`)();
      result = customFunc(matrix);
    } else {
      resultEl.textContent = "❌ Unknown algorithm.";
      return;
    }
  } catch (e) {
    resultEl.textContent = "❌ Error running algorithm.";
    console.error(e);
    return;
  }

  const end = performance.now();
  resultEl.textContent = result ? "✅ Hamiltonian" : "❌ Not Hamiltonian";
  timeTakenEl.textContent = `Time: ${(end - start).toFixed(2)}ms`;
});


function generateRandomAdjacencyMatrix(n, edgeProbability = 0.4) {
  const matrix = Array.from({ length: n }, () => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const edge = Math.random() < edgeProbability ? 1 : 0;
      matrix[i][j] = edge;
      matrix[j][i] = edge;
    }
  }

  return matrix;
}

function matrixToCSV(matrix) {
  return matrix.map(row => row.join(',')).join('\n');
}

document.querySelectorAll('.gen-btn').forEach(button => {
  button.addEventListener('click', () => {
    const n = parseInt(button.getAttribute('data-nodes'), 10);
    const matrix = generateRandomAdjacencyMatrix(n);
    const csv = matrixToCSV(matrix);
    document.getElementById('matrixInput').value = csv;
    document.getElementById('result').textContent = '';
  });
});

const batchResultsEl = document.getElementById('batchTestResults');

document.getElementById('testDevButton').addEventListener('click', async () => {
  const testCount = 100;
  const minNodes = 5;
  const maxNodes = 10;

  const lines = [];
  function appendLine(line) {
    console.log(line);
    lines.push(line);
    batchResultsEl.textContent = lines.join('\n');
  }

  appendLine(`Running ${testCount} tests on random graphs with node counts from ${minNodes} to ${maxNodes}...\n`);

  const inconsistencies = {};
  for (const alg of Object.keys(algorithmMap)) {
    if (alg !== 'dfs') inconsistencies[alg] = 0;
  }

  for (let i = 0; i < testCount; i++) {
    const n = Math.floor(Math.random() * (maxNodes - minNodes + 1)) + minNodes;
    const matrix = generateRandomAdjacencyMatrix(n);

    appendLine(`Test #${i + 1} (n=${n}):`);

    let dfsResult;
    try {
      const start = performance.now();
      dfsResult = algorithmMap.dfs(matrix);
      const duration = performance.now() - start;
      appendLine(`  dfs: ${dfsResult ? '✅' : '❌'} (${duration.toFixed(2)} ms)`);
    } catch (e) {
      appendLine(`  dfs: Error - ${e.message}`);
      dfsResult = null;
    }

    for (const [name, fn] of Object.entries(algorithmMap)) {
      if (name === 'dfs') continue;

      let result;
      try {
        const start = performance.now();
        result = fn(matrix);
        const duration = performance.now() - start;
        appendLine(`  ${name}: ${result === true ? '✅' : result === false ? '❌' : '⚠️'} (${duration.toFixed(2)} ms)`);
      } catch (e) {
        appendLine(`  ${name}: Error - ${e.message}`);
        result = null;
      }

      if (dfsResult !== null && result !== null && result !== dfsResult) {
        inconsistencies[name]++;
      }
    }

    appendLine('');

    if (i % 10 === 0) await new Promise(r => setTimeout(r, 10));
  }

  appendLine('Inconsistency summary (compared to DFS):');
  for (const [name, count] of Object.entries(inconsistencies)) {
    if (name === 'exponential') continue;
    appendLine(`- ${name}: ${count} inconsistent result(s) out of ${testCount}`);
  }
});

const algorithmSelect = document.getElementById('algorithmSelect');
const customAlgoSection = document.getElementById('customAlgoSection');

// Show/hide custom algo section on algorithm change
algorithmSelect.addEventListener('change', () => {
    customAlgoSection.style.display = algorithmSelect.value === 'custom' ? 'block' : 'none';
});

// Optional: trigger it on load in case someone refreshes while custom is selected
customAlgoSection.style.display = algorithmSelect.value === 'custom' ? 'block' : 'none';