import { Colors } from './colors.js';

const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");

let nodes = [];
let edges = [];
let nodeRadius = 20;
let selectedNode = null;
let selectedEdge = null;
let draggingNode = null;
let hoveredNode = null;
let hoveredEdge = null;

const deleteIconSize = 20;

canvas.addEventListener("mousedown", (e) => {
    const { x, y } = getMousePos(e);
    draggingNode = getNodeAtPosition(x, y);
});

canvas.addEventListener("mousemove", (e) => {
    const { x, y } = getMousePos(e);
    if (draggingNode) {
        draggingNode.x = x;
        draggingNode.y = y;
        drawGraph();
        return;
    }
    hoveredNode = getNodeAtPosition(x, y);
    hoveredEdge = getEdgeAtPosition(x, y);
    drawGraph();
});

canvas.addEventListener("mouseup", () => {
    draggingNode = null;
    updateMatrixTextarea();
});

canvas.addEventListener("click", (e) => {
    const { x, y } = getMousePos(e);
    if (draggingNode !== null) return;

    if (selectedNode && isClickOnDeleteIconNode(x, y, selectedNode)) {
        deleteNode(selectedNode);
        selectedNode = null;
        updateMatrixTextarea();
        drawGraph();
        return;
    }

    if (selectedEdge && isClickOnDeleteIconEdge(x, y, selectedEdge)) {
        deleteEdge(selectedEdge);
        selectedEdge = null;
        updateMatrixTextarea();
        drawGraph();
        return;
    }

    const clickedNode = getNodeAtPosition(x, y);
    if (clickedNode) {
        selectedEdge = null;
        if (selectedNode && selectedNode !== clickedNode) {
            edges.push([selectedNode.id, clickedNode.id]);
            updateMatrixTextarea();
            selectedNode = null;
        } else {
            selectedNode = clickedNode;
        }
        drawGraph();
        return;
    }

    const clickedEdge = getEdgeAtPosition(x, y);
    if (clickedEdge) {
        selectedNode = null;
        selectedEdge = clickedEdge;
        drawGraph();
        return;
    }

    const id = nodes.length;
    nodes.push({ id, x, y });
    selectedNode = null;
    selectedEdge = null;
    updateMatrixTextarea();
    drawGraph();
});

function pointToSegmentDistance(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    if (dx === 0 && dy === 0) return Math.hypot(px - x1, py - y1);
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
    const projX = x1 + t * dx;
    const projY = y1 + t * dy;
    return Math.hypot(px - projX, py - projY);
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
    };
}

function getNodeAtPosition(x, y) {
    return nodes.find(n => {
        const dx = n.x - x;
        const dy = n.y - y;
        return dx * dx + dy * dy < nodeRadius * nodeRadius;
    });
}

function getEdgeAtPosition(x, y) {
    for (const edge of edges) {
        const nodeA = nodes[edge[0]];
        const nodeB = nodes[edge[1]];
        if (pointToSegmentDistance(x, y, nodeA.x, nodeA.y, nodeB.x, nodeB.y) < 6) return edge;
    }
    return null;
}

function isClickOnDeleteIconNode(x, y, node) {
    const radius = deleteIconSize / 2;
    const iconX = node.x + nodeRadius * 1;
    const iconY = node.y - nodeRadius * 1.4;
    const dx = x - (iconX + radius);
    const dy = y - (iconY + radius);
    return dx * dx + dy * dy <= radius * radius;
}

function isClickOnDeleteIconEdge(x, y, edge) {
    const radius = deleteIconSize / 2;
    const nodeA = nodes[edge[0]];
    const nodeB = nodes[edge[1]];
    const iconX = (nodeA.x + nodeB.x) / 2 - radius;
    const iconY = (nodeA.y + nodeB.y) / 2 - radius;
    const dx = x - (iconX + radius);
    const dy = y - (iconY + radius);
    return dx * dx + dy * dy <= radius * radius;
}

function deleteNode(node) {
    nodes = nodes.filter(n => n !== node);
    edges = edges.filter(([a, b]) => a !== node.id && b !== node.id);
    const idMap = new Map();
    nodes.forEach((n, i) => {
        idMap.set(n.id, i);
        n.id = i;
    });
    edges = edges.map(([a, b]) => [idMap.get(a), idMap.get(b)]);
}

function deleteEdge(edge) {
    edges = edges.filter(e => !(e[0] === edge[0] && e[1] === edge[1]));
}

function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 4;
    for (const [from, to] of edges) {
        const nodeA = nodes[from];
        const nodeB = nodes[to];
        ctx.beginPath();
        ctx.moveTo(nodeA.x, nodeA.y);
        ctx.lineTo(nodeB.x, nodeB.y);

        ctx.strokeStyle = Colors.black_100;
        ctx.stroke();

        if (selectedEdge && selectedEdge[0] === from && selectedEdge[1] === to) {
            ctx.lineWidth = 2;
            ctx.strokeStyle = Colors.yellow_100;
            ctx.stroke();
            ctx.lineWidth = 4;
        } else if (hoveredEdge && hoveredEdge[0] === from && hoveredEdge[1] === to) {
            ctx.lineWidth = 2;
            ctx.strokeStyle = Colors.yellow_25;
            ctx.stroke();
            ctx.lineWidth = 4;
        }
    }

    if (selectedNode && hoveredNode && selectedNode !== hoveredNode) {
        ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(selectedNode.x, selectedNode.y);
        ctx.lineTo(hoveredNode.x, hoveredNode.y);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    for (const node of nodes) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = Colors.yellow_100;
        ctx.fill();

        if (node === hoveredNode && node !== selectedNode) {
            ctx.lineWidth = 5;
            ctx.strokeStyle = Colors.black_100;
            ctx.stroke();
        }

        if (node === selectedNode) {
            ctx.lineWidth = 5;
            ctx.strokeStyle = Colors.black_100;
            ctx.stroke();
            drawDeleteIconNode(node);
        }

        ctx.fillStyle = Colors.black_100;
        ctx.font = "16px Work Sans";
        ctx.fillText(node.id, node.x - 5, node.y + 5);
    }

    if (selectedEdge) {
        drawDeleteIconEdge(selectedEdge);
    }

    ctx.lineWidth = 1;
}

function drawDeleteIconNode(node) {
    const radius = deleteIconSize / 2;
    const iconX = node.x + nodeRadius * 1;
    const iconY = node.y - nodeRadius * 1.4;
    ctx.fillStyle = Colors.yellow_50;
    ctx.strokeStyle = Colors.black_100;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(iconX + radius, iconY + radius, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(iconX + 5, iconY + 5);
    ctx.lineTo(iconX + deleteIconSize - 5, iconY + deleteIconSize - 5);
    ctx.moveTo(iconX + deleteIconSize - 5, iconY + 5);
    ctx.lineTo(iconX + 5, iconY + deleteIconSize - 5);
    ctx.stroke();
}

function drawDeleteIconEdge(edge) {
    const radius = deleteIconSize / 2;
    const nodeA = nodes[edge[0]];
    const nodeB = nodes[edge[1]];
    const iconX = (nodeA.x + nodeB.x) / 2 - radius;
    const iconY = (nodeA.y + nodeB.y) / 2 - radius;
    ctx.fillStyle = Colors.yellow_50;
    ctx.strokeStyle = Colors.black_100;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(iconX + radius, iconY + radius, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(iconX + 5, iconY + 5);
    ctx.lineTo(iconX + deleteIconSize - 5, iconY + deleteIconSize - 5);
    ctx.moveTo(iconX + deleteIconSize - 5, iconY + 5);
    ctx.lineTo(iconX + 5, iconY + deleteIconSize - 5);
    ctx.stroke();
}

function updateMatrixTextarea() {
    const n = nodes.length;
    const matrix = Array.from({ length: n }, () => Array(n).fill(0));
    for (const [a, b] of edges) {
        matrix[a][b] = 1;
        matrix[b][a] = 1;
    }
    const matrixText = matrix.map(row => row.join(",")).join("\n");
    document.getElementById("matrixInput").value = matrixText;
}

const matrixInputEl = document.getElementById('matrixInput');

matrixInputEl.addEventListener('input', updateGraphFromMatrix);

function updateGraphFromMatrix() {
    const text = document.getElementById("matrixInput").value.trim();
    const rows = text.split("\n").map(row => row.split(",").map(Number));
    const size = rows.length;

    if (!rows.every(row => row.length === size)) return;

    nodes = [];
    edges = [];

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 50;
    for (let i = 0; i < size; i++) {
        const angle = (2 * Math.PI * i) / size;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        nodes.push({ id: i, x, y });
    }

    for (let i = 0; i < size; i++) {
        for (let j = i + 1; j < size; j++) {
            if (rows[i][j] === 1) {
                edges.push([i, j]);
            }
        }
    }

    selectedNode = null;
    selectedEdge = null;
    drawGraph();
}

updateGraphFromMatrix();
