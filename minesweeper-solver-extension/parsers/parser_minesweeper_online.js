// Parser for the site minesweeper.online

export function parseGameBoard() {
    console.log("Parsing board");

    const gameBoard = [];
    
    // Select all cells with the "square" class inside the game container
    document.querySelectorAll('#AreaBlock .cell').forEach(cell => {
        // Check if the cell is hidden with "display: none"
        const computedStyle = window.getComputedStyle(cell);
        if (computedStyle.display === "none") {
            return; // Skip this cell
        }

        // Extract the position from the cell's ID (formatted as "cell_x_y")
        const [_, x, y] = cell.id.split('_').map(Number);

        // Determine the cell's state based on its class
        let state;
        if (cell.classList.contains('hd_flag')) {
            state = "flag";
        } else if (cell.classList.contains('hd_closed')) {
            state = "blank";
        } else if (cell.classList.contains('hd_opened')) {
            // Check if it has an "openX" class (indicating a number 0-8)
            const key = 'hd_type';
            const openClass = Array.from(cell.classList).find(c => c.startsWith(key));
            if (openClass) {
                const number = parseInt(openClass.slice(key.length), 10); // Extract number from "openX"
                state = `open${number}`;
            }
        }

        gameBoard.push({x, y, state});
    });

    return gameBoard;
}