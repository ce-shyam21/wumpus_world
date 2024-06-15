const gridSize = 4;
let playerPosition = { x: 0, y: 0 };
let wumpusPosition = getRandomPosition();
let goldPosition = getRandomPosition();
let pitPositions = [];
const visitedCells = new Set();

// Example JavaScript for dynamic grid creation 
const gridContainer = document.getElementById('gridContainer');

function createGrid() {
    gridContainer.innerHTML = '';
    for (let i = 0; i < gridSize * gridSize; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.textContent = 'Cell ' + i;
        gridContainer.appendChild(cell);
    }
}

// Call the function to create grid on page load
createGrid();

// Utility functions
function getRandomPosition() {
    const x = Math.floor(Math.random() * gridSize);
    const y = Math.floor(Math.random() * gridSize);
    return { x, y };
}

function isSamePosition(pos1, pos2) {
    return pos1.x === pos2.x && pos1.y === pos2.y;
}

// Ensure that wumpus, gold, and pits are not at the player's start position
// and not adjacent to the player's start position
while (isSamePosition(playerPosition, wumpusPosition) || isAdjacent(playerPosition, wumpusPosition)) {
    wumpusPosition = getRandomPosition();
}

while (isSamePosition(playerPosition, goldPosition) || isAdjacent(playerPosition, goldPosition) || isSamePosition(wumpusPosition, goldPosition) || isAdjacent(wumpusPosition, goldPosition)) {
    goldPosition = getRandomPosition();
}

for (let i = 0; i < 3; i++) {
    let pitPosition;
    do {
        pitPosition = getRandomPosition();
    } while (
        isSamePosition(playerPosition, pitPosition) ||
        isAdjacent(playerPosition, pitPosition) ||
        isSamePosition(wumpusPosition, pitPosition) ||
        isAdjacent(wumpusPosition, pitPosition) ||
        isSamePosition(goldPosition, pitPosition) ||
        isAdjacent(goldPosition, pitPosition) ||
        pitPositions.some(p => isSamePosition(p, pitPosition) || isAdjacent(p, pitPosition))
    );
    pitPositions.push(pitPosition);
}

function initializeGrid() {
    const gridContainer = document.getElementById('gridContainer');

    // Clear existing grid
    gridContainer.innerHTML = '';

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = `cell-${x}-${y}`; // Unique ID for each cell
            gridContainer.appendChild(cell);
        }
    }
}

function revealInitialSafeCells() {
    revealCell(playerPosition.x, playerPosition.y);
    revealAdjacentCells(playerPosition.x, playerPosition.y);
}

function revealAdjacentCells(x, y) {
    const adjacentCells = [
        { x: x - 1, y: y },
        { x: x + 1, y: y },
        { x: x, y: y - 1 },
        { x: x, y: y + 1 }
    ];

    adjacentCells.forEach(cell => {
        if (cell.x >= 0 && cell.x < gridSize && cell.y >= 0 && cell.y < gridSize) {
            if (!visitedCells.has(`${cell.x},${cell.y}`)) {
                // Check for breeze and stench
                let breeze = false;
                let stench = false;

                // Check if any adjacent pit has a breeze
                pitPositions.forEach(pit => {
                    if (isAdjacent(cell, pit)) {
                        breeze = true;
                    }
                });

                // Check if the cell is adjacent to the Wumpus
                if (isAdjacent(cell, wumpusPosition)) {
                    stench = true;
                }

                // Display the appropriate symbol based on breeze and stench
                const cellElement = document.getElementById(`cell-${cell.x}-${cell.y}`);
                if (breeze && stench) {
                    cellElement.textContent = 'B,S';
                } else if (breeze) {
                    cellElement.textContent = 'B';
                } else if (stench) {
                    cellElement.textContent = 'S';
                }
            }
        }
    });
}

function revealCell(x, y) {
    const cell = document.getElementById(`cell-${x}-${y}`);
    cell.style.backgroundColor = 'green';
    visitedCells.add(`${x},${y}`);
}

// Utility function to check if two positions are adjacent

function isAdjacent(pos1, pos2) {
    return (
        (Math.abs(pos1.x - pos2.x) === 1 && pos1.y === pos2.y) ||
        (Math.abs(pos1.y - pos2.y) === 1 && pos1.x === pos2.x)
    );
}


function updateGrid() {
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = document.getElementById(`cell-${x}-${y}`);
            cell.textContent = '';

            if (visitedCells.has(`${x},${y}`)) {
                cell.style.backgroundColor = 'green';
            } else {
                cell.style.backgroundColor = 'red';
            }

            if (x === playerPosition.x && y === playerPosition.y) {
                cell.textContent = 'P';

            } else if (isSamePosition({ x, y }, wumpusPosition) && visitedCells.has(`${x},${y}`)) {
                cell.textContent = 'W';

            } else if (isSamePosition({ x, y }, goldPosition) && visitedCells.has(`${x},${y}`)) {
                cell.textContent = 'G';

            } else if (pitPositions.some(p => isSamePosition({ x, y }, p)) && visitedCells.has(`${x},${y}`)) {
                cell.textContent = 'P';

            }
        }
    }
}


function move(direction) {
    let moved = false;

    switch (direction) {
        case 'up':
            if (playerPosition.y > 0) {
                playerPosition.y--;
                moved = true;
            }
            break;
        case 'down':
            if (playerPosition.y < gridSize - 1) {
                playerPosition.y++;
                moved = true;
            }
            break;
        case 'left':
            if (playerPosition.x > 0) {
                playerPosition.x--;
                moved = true;
            }
            break;
        case 'right':
            if (playerPosition.x < gridSize - 1) {
                playerPosition.x++;
                moved = true;
            }
            break;
    }

    if (moved) {
        console.log(`Moved ${direction}`);

        // Log the move in the movesList
        const movesList = document.getElementById('movesList');
        const li = document.createElement('li');
        li.textContent = `Moved ${direction}`;
        movesList.appendChild(li);

        revealCell(playerPosition.x, playerPosition.y);
        updateGrid();
        updateNodeInfo();
        checkGameState();
    }
}



function updateNodeInfo() {
    const currentNodeInfo = document.getElementById('current-node-info');
    currentNodeInfo.innerHTML = '';

    // Define player's adjacent cells
    const adjacentCells = [
        { x: playerPosition.x - 1, y: playerPosition.y },
        { x: playerPosition.x + 1, y: playerPosition.y },
        { x: playerPosition.x, y: playerPosition.y - 1 },
        { x: playerPosition.x, y: playerPosition.y + 1 }
    ];

    let hasStench = false;
    let hasBreeze = false;

    // Check each adjacent cell for pits and wumpus
    adjacentCells.forEach(cell => {
        // Check if the cell is within grid bounds
        if (cell.x >= 0 && cell.x < gridSize && cell.y >= 0 && cell.y < gridSize) {
            pitPositions.forEach(pit => {
                // Check if there's a pit adjacent to the current cell
                if (isSamePosition(cell, pit)) {
                    hasBreeze = true;
                }
            });
            // Check if there's a Wumpus adjacent to the current cell
            if (isSamePosition(cell, wumpusPosition)) {
                hasStench = true;
            }
        }
    });

    if (!hasStench && !hasBreeze) {
        currentNodeInfo.textContent = 'Current node is safe.';
    } else if (hasStench && hasBreeze) {
        currentNodeInfo.textContent = 'Current node has breeze + stench.';
    } else if (hasStench) {
        currentNodeInfo.textContent = 'Current node has stench.';
    } else if (hasBreeze) {
        currentNodeInfo.textContent = 'Current node has breeze.';
    }
}

function update() {
    updateGrid();
    updateNodeInfo();
}

function checkGameState() {
    if (isSamePosition(playerPosition, wumpusPosition)) {
        alert('You encountered the Wumpus! Game Over!');
        resetGame();
    } else if (isSamePosition(playerPosition, goldPosition)) {
        alert('You found the gold! You win!');
        resetGame();
    } else if (pitPositions.some(p => isSamePosition(playerPosition, p))) {
        alert('You fell into a pit! Game Over!');
        resetGame();
    }
}

function resetGame() {
    playerPosition = { x: 0, y: 0 };
    visitedCells.clear();
    wumpusPosition = getRandomPosition();
    goldPosition = getRandomPosition();
    pitPositions = [];

    while (isSamePosition(playerPosition, wumpusPosition)) {
        wumpusPosition = getRandomPosition();
    }

    while (isSamePosition(playerPosition, goldPosition) || isSamePosition(wumpusPosition, goldPosition)) {
        goldPosition = getRandomPosition();
    }

    for (let i = 0; i < 3; i++) {
        let pitPosition;
        do {
            pitPosition = getRandomPosition();
        } while (
            isSamePosition(playerPosition, pitPosition) ||
            isSamePosition(wumpusPosition, pitPosition) ||
            isSamePosition(goldPosition, pitPosition) ||
            pitPositions.some(p => isSamePosition(p, pitPosition))
        );
        pitPositions.push(pitPosition);
    }

    initializeGrid();
    revealInitialSafeCells();
    updateGrid();
    updateNodeInfo();
}


function findGold() {
    const path = findPathToGold(playerPosition, goldPosition, []);
    if (path) {
        moveAlongPath(path);
    } else {
        console.log("Gold is unreachable from current position.");
    }
}

function findPathToGold(start, target, visited) {
    if (isSamePosition(start, target)) {
        return [start];
    }

    visited.push(start);

    const adjacentCells = [
        { x: start.x - 1, y: start.y },
        { x: start.x + 1, y: start.y },
        { x: start.x, y: start.y - 1 },
        { x: start.x, y: start.y + 1 }
    ];

    for (let cell of adjacentCells) {
        if (
            cell.x >= 0 && cell.x < gridSize &&
            cell.y >= 0 && cell.y < gridSize &&
            !visited.some(v => isSamePosition(v, cell)) &&
            !pitPositions.some(p => isSamePosition(p, cell)) &&
            !isSamePosition(cell, wumpusPosition)
        ) {
            const path = findPathToGold(cell, target, [...visited]);
            if (path) {
                path.unshift(start);
                return path;
            }
        }
    }

    return null;
}

function moveAlongPath(path) {
    let index = 1;
    const interval = setInterval(() => {
        if (index < path.length) {
            const currentPos = path[index - 1];
            const nextPos = path[index];

            let direction;
            if (nextPos.x === currentPos.x && nextPos.y === currentPos.y - 1) {
                direction = 'up';
            } else if (nextPos.x === currentPos.x && nextPos.y === currentPos.y + 1) {
                direction = 'down';
            } else if (nextPos.x === currentPos.x - 1 && nextPos.y === currentPos.y) {
                direction = 'left';
            } else if (nextPos.x === currentPos.x + 1 && nextPos.y === currentPos.y) {
                direction = 'right';
            } else {
                direction = 'unknown';
            }

            playerPosition = nextPos;
            revealCell(playerPosition.x, playerPosition.y);
            updateGrid();
            updateNodeInfo();
            checkGameState();

            // Log the move in the movesList
            const movesList = document.getElementById('movesList');
            const li = document.createElement('li');
            li.textContent = `Moved ${direction} to (${playerPosition.x}, ${playerPosition.y}) to find gold`;
            movesList.appendChild(li);

            index++;
        } else {
            clearInterval(interval);
        }
    }, 500); // Adjust speed as needed (milliseconds)
}


document.addEventListener('DOMContentLoaded', () => {
    initializeGrid();
    revealInitialSafeCells();
    updateGrid();
    updateNodeInfo();

    document.getElementById('up').addEventListener('click', () => move('up'));
    document.getElementById('down').addEventListener('click', () => move('down'));
    document.getElementById('left').addEventListener('click', () => move('left'));
    document.getElementById('right').addEventListener('click', () => move('right'));
    document.getElementById('findGold').addEventListener('click', findGold);
});
