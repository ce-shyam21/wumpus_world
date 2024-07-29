const gridSize = 4; // set index of 4*4
let playerPosition = { x: 0, y: 0 }; //init frm top-left
let initialPosition = { ...playerPosition }; // Keep track of the initial position
let wumpusPosition = getRandomPosition(); // randomly place wumpus-1 (1-wumpus)
let goldPosition = getRandomPosition(); //randomly place gold-1 (1-gold)
let pitPositions = [];// array of pit-3 (3pits)
const visitedCells = new Set(); // set for tracking visited cell

// drid initialization
function initializeGrid() {
    const gridContainer = document.getElementById('gridContainer');// this elemnt from html to make grid in that div
    gridContainer.innerHTML = ''; // clear exsting grid
    // thisi is creaing 4*4 grid
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = `cell-${x}-${y}`;
            gridContainer.appendChild(cell);

            // Set the initial cell to green
            if (x === initialPosition.x && y === initialPosition.y) {
                cell.style.backgroundColor = 'green';
            }
        }
    }
}

// return rendom postin within range of grid size=4
function getRandomPosition() {
    return { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
}

//check if two position are same
function isSamePosition(pos1, pos2) {
    return pos1.x === pos2.x && pos1.y === pos2.y;
}

// check two position are adjecent
function isAdjacent(pos1, pos2) {
    return (
        (Math.abs(pos1.x - pos2.x) === 1 && pos1.y === pos2.y) ||
        (Math.abs(pos1.y - pos2.y) === 1 && pos1.x === pos2.x)
    );
}

// this code is assing index to gold, wumpus and 3 pits randomly form 4*4 
// and check that the give positin is not adject or same position as player present
function ensureValidPositions() {
    // if this condition is will be true then it will chang the random postion and itrate it again
    // untill it is not make false
    // when it will false then that id will assign to cell 
    // which contains wumpus, pits and gold  
    while (isSamePosition(playerPosition, wumpusPosition) || isAdjacent(playerPosition, wumpusPosition)) {
        wumpusPosition = getRandomPosition();
    }

    while (
        isSamePosition(playerPosition, goldPosition) || isAdjacent(playerPosition, goldPosition) ||
        isSamePosition(wumpusPosition, goldPosition) || isAdjacent(wumpusPosition, goldPosition)
    ) {
        goldPosition = getRandomPosition();
    }

    for (let i = 0; i < 3; i++) {
        let pitPosition;
        do {
            pitPosition = getRandomPosition();
        } while (
            isSamePosition(playerPosition, pitPosition) || isAdjacent(playerPosition, pitPosition) ||
            isSamePosition(wumpusPosition, pitPosition) || isAdjacent(wumpusPosition, pitPosition) ||
            isSamePosition(goldPosition, pitPosition) || isAdjacent(goldPosition, pitPosition) ||
            pitPositions.some(p => isSamePosition(p, pitPosition) || isAdjacent(p, pitPosition))
        );
        pitPositions.push(pitPosition);
    }
}

// return the adjectnt cell of current position // filter for within 4*4 grid
function getAdjacentCells(x, y) {
    return [
        { x: x - 1, y: y },
        { x: x + 1, y: y },
        { x: x, y: y - 1 },
        { x: x, y: y + 1 }
    ].filter(cell => cell.x >= 0 && cell.x < gridSize && cell.y >= 0 && cell.y < gridSize);
}

// this functin is for the update grid of player position
function updateGrid() {
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = document.getElementById(`cell-${x}-${y}`);
            cell.textContent = '';

            if (isSamePosition({ x, y }, initialPosition)) {
                cell.style.backgroundColor = 'green';
            } else if (visitedCells.has(`${x},${y}`)) {
                cell.style.backgroundColor = 'green';
                cell.classList.add('visited');
            } else {
                cell.style.backgroundColor = ''; // reset background color
                cell.classList.remove('visited');
            }

            if (isSamePosition({ x, y }, playerPosition)) {
                cell.textContent = 'A';  // Agent
            } else if (isSamePosition({ x, y }, wumpusPosition) && visitedCells.has(`${x},${y}`)) {
                cell.textContent = 'W';  //Wumpus
            } else if (isSamePosition({ x, y }, goldPosition) && visitedCells.has(`${x},${y}`)) {
                cell.textContent = 'G'; // Gold
            } else if (pitPositions.some(p => isSamePosition({ x, y }, p)) && visitedCells.has(`${x},${y}`)) {
                cell.textContent = 'P';  //Pits
            }
        }
    }
}

// moves player position in specfis direction
function move(direction) {
    let moved = false;

    switch (direction) {
        case 'left':
            if (playerPosition.y > 0) {
                playerPosition.y--;
                moved = true;
            }
            break;
        case 'right':
            if (playerPosition.y < gridSize - 1) {
                playerPosition.y++;
                moved = true;
            }
            break;
        case 'up':
            if (playerPosition.x > 0) {
                playerPosition.x--;
                moved = true;
            }
            break;
        case 'down':
            if (playerPosition.x < gridSize - 1) {
                playerPosition.x++;
                moved = true;
            }
            break;
    }

    // this is adding moved place in to set of the visitedcells
    if (moved) {
        // Add current cell to visitedCells
        visitedCells.add(`${playerPosition.x},${playerPosition.y}`);
        logMove(direction);
        updateGrid();
        updateNodeInfo();
        checkGameState();
    }
}

// aading movelog in the html file by recognixng moveList id 
function logMove(direction) {
    const movesList = document.getElementById('movesList');
    const li = document.createElement('li');
    li.textContent = `Moved ${direction}`;
    movesList.appendChild(li);
}
const currentNodeInfo = document.getElementById('current-node-info');
// update current node info that what feel at that cell
function updateNodeInfo() {
    // this is geeting current-node-info id from html
    // const currentNodeInfo = document.getElementById('current-node-info');
    currentNodeInfo.innerHTML = '';

    let hasStench = false;
    let hasBreeze = false;

    getAdjacentCells(playerPosition.x, playerPosition.y).forEach(cell => {
        // it is cheking the all cell if it has visited and feel breeze
        // by condition isSamePosition(cell, pit)
        if (pitPositions.some(pit => isSamePosition(cell, pit))) {
            hasBreeze = true;
        }
        if (isSamePosition(cell, wumpusPosition)) {
            hasStench = true;
        }
    });

    if (!hasStench && !hasBreeze) {
        currentNodeInfo.textContent = 'Current node is safe 🟢.';
    } else if (hasStench && hasBreeze) {
        currentNodeInfo.textContent = 'Current node has breeze ❄️ + stench ♨️.';
    } else if (hasStench) {
        currentNodeInfo.textContent = 'Current node has stench ♨️.';
    } else if (hasBreeze) {
        currentNodeInfo.textContent = 'Current node has breeze ❄️.';
    }
}

// chekcing game codndion for that is win or lodt on based of posions comapre
function checkGameState() {
    if (isSamePosition(playerPosition, wumpusPosition)) {
        alert('You encountered the Wumpus! 👻 Game Over!');
        setTimeout(() => window.location.reload(), 1000);
    } else if (isSamePosition(playerPosition, goldPosition)) {
        alert(`You found the gold! 🪙 You win! 🎊🎉`);
        setTimeout(() => window.location.reload(), 1000);
        // this is check g conditon base on curerent postion commaring with data of pits locations 
    } else if (pitPositions.some(p => isSamePosition(playerPosition, p))) {
        alert('You fell into a pit! 🕳️ Game Over!');
        setTimeout(() => window.location.reload(), 1000);
    }
}

// this is part for solved by ai is print it
function findGold() {
    const path = findPathToGold(playerPosition, goldPosition, []);
    if (path) {
        moveAlongPath(path);
    } else {
        console.log("Gold is unreachable from current position.");
    }
}

//finds path for gold, with avoid pis ans wumpus
function findPathToGold(start, target, visited) {
    // Base case: if the start position is the same as the target, return an array containing the target.
    if (isSamePosition(start, target)) {
        return [start];
    }

    visited.push(start); // Mark the current cell as visited.

    const adjacentCells = getAdjacentCells(start.x, start.y); // Get all adjacent cells to the current cell.
 
    for (let cell of adjacentCells) {
         // check if the cell has not visited, is not a pit, and is not the Wumpus position.
        if (
            !visited.some(v => isSamePosition(v, cell)) &&
            !pitPositions.some(p => isSamePosition(p, cell)) &&
            !isSamePosition(cell, wumpusPosition)
        ) {
             // recursively find a path from the current cell to the target, passing along the updated visited array.
            const path = findPathToGold(cell, target, [...visited]);
            if (path) {
                path.unshift(start); // add the current cell to the beginning of the path.
                return path;
            }
        }
    }
    return null;
}

// move tha player along a given path to gold, logging and updating grid.
function moveAlongPath(path) {
    let index = 1;
    const interval = setInterval(() => {
        if (index < path.length) {
            const currentPos = path[index - 1];
            const nextPos = path[index];

            let direction;
            if (nextPos.x === currentPos.x && nextPos.y === currentPos.y - 1) {
                direction = 'LEFT';
            } else if (nextPos.x === currentPos.x && nextPos.y === currentPos.y + 1) {
                direction = 'RIGHT';
            } else if (nextPos.x === currentPos.x - 1 && nextPos.y === currentPos.y) {
                direction = 'UP';
            } else if (nextPos.x === currentPos.x + 1 && nextPos.y === currentPos.y) {
                direction = 'DOWN';
            } else {
                direction = 'unknown';
            }

            playerPosition = nextPos;
            visitedCells.add(`${playerPosition.x},${playerPosition.y}`); // Mark the cell as visited
            updateGrid();
            updateNodeInfo();
            checkGameState();

            logMove(` ${direction} to (${playerPosition.x}, ${playerPosition.y}) to find gold`);
            index++;
        } else {
            clearInterval(interval);
        }
    }, 500);
}

//event listeners to buttons for moving the player and finding the gold.
document.addEventListener('DOMContentLoaded', () => {
    const directions = ['up', 'down', 'left', 'right'];
    directions.forEach(direction => {
        document.getElementById(direction).addEventListener('click', () => move(direction));
    });
    document.getElementById('findGold').addEventListener('click', findGold);
});

//calling all function for run it.
initializeGrid();
ensureValidPositions();
updateGrid();
updateNodeInfo();
