// Parser for the site minesweeper online

export function parseGameBoard() {
    const gameBoard = [];
    document.querySelectorAll('.site1-game-cell').forEach(cell => {
        gameBoard.push({
            x: cell.getAttribute('data-x'),
            y: cell.getAttribute('data-y'),
            state: cell.classList.contains('mine') ? 'mine' : 'safe'
        });
    });
    return gameBoard;
}
