
document.getElementById('dummy-solve-game').addEventListener('click', () => {
    console.log("Solve game asked");
    chrome.runtime.sendMessage({ type: 'SOLVE_GAME', full:false });
});


document.getElementById('solve-game').addEventListener('click', () => {
    console.log("Solve game asked");
    chrome.runtime.sendMessage({ type: 'SOLVE_GAME', full:true });
});

chrome.runtime.onMessage.addListener((message) => {
    console.log("Message received", message);
    if (message.type === 'SOLUTION_RESULT') {
        renderSolution(message.data, message.board);
    }
});

function renderSolution(data, board) {
    const { cellsToFlag, cellsToOpen } = data;

    // Clear the previous solution
    const solutionContainer = document.getElementById('solution-output');
    solutionContainer.innerHTML = ''; // Clear existing content

    console.log("Board", board);

    // Find the board dimensions
    const maxX = board.width;
    const maxY = board.height;
    const minX = board.startX;
    const minY = board.startY;

    // Create a table element
    const table = document.createElement('table');
    table.classList.add('solution-table');

    for (let y = minY; y <= maxY; y++) {
        const row = document.createElement('tr');
        for (let x = minX; x <= maxX; x++) {
            const cellElement = document.createElement('td');
            cellElement.classList.add('solution-cell');

            // Get the current cell from the board
            const cell = board.cells.find(c => c.x === x && c.y === y);

            // Determine the state of the cell (e.g., flagged, openable, or known number)
            const isFlagged = cellsToFlag.some(c => c.x === x && c.y === y);
            const isOpenable = cellsToOpen.some(c => c.x === x && c.y === y);

            if (isFlagged) {
                cellElement.innerText = '🚩';  // Flag icon
                cellElement.classList.add('flag-cell');
            } else if (isOpenable) {
                cellElement.innerText = '⬜';  // Openable cell icon
                cellElement.classList.add('open-cell');
            } else if (cell.isOpen) {
                cellElement.innerText = cell.numberOfBomb > 0 ? cell.numberOfBomb : ' ';
                cellElement.classList.add(`bomb-count-${cell.numberOfBomb}`); // Different style per bomb count
            } else {
                cellElement.innerText = ' ';
                cellElement.classList.add('unknown-cell');
            }

            // Append cell to row
            row.appendChild(cellElement);
        }
        // Append row to table
        table.appendChild(row);
    }

    solutionContainer.appendChild(table);

    // Optional: Add a legend for cell colors/icons
    renderLegend(solutionContainer);
}

function renderLegend(container) {
    const legend = document.createElement('div');
    legend.classList.add('solution-legend');
    
    legend.innerHTML = `
        <div><span class="legend-flag">🚩</span> - Flagged bomb</div>
        <div><span class="legend-open">⬜</span> - Safe to open</div>
        <div><span class="legend-number">1-8</span> - Bomb count around cell</div>
    `;
    
    container.appendChild(legend);
}
