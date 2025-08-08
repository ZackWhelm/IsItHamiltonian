import { isHamiltonianDFS } from './algos/dfs.js';
import { isHamiltonianExponential } from './algos/exponential.js';
import { isHamiltonianGreedy } from './algos/greedy.js';

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
  timeTakenEl.textContent = `Time it took for browser to compute: ${(end - start).toFixed(2)}ms`;
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

const algorithmSelect = document.getElementById('algorithmSelect');
const customAlgoSection = document.getElementById('customAlgoSection');

algorithmSelect.addEventListener('change', () => {
    customAlgoSection.style.display = algorithmSelect.value === 'custom' ? 'block' : 'none';
});

customAlgoSection.style.display = algorithmSelect.value === 'custom' ? 'block' : 'none';

document.getElementById('uploadCsvBtn').addEventListener('click', () => {
  document.getElementById('csvUpload').click();
});