class Cell {
    constructor(x, y, state) {
        this.x = x;
        this.y = y;
        this.state = state;  // "blank", "flag", or "openX" (X = number of neighboring bombs)
        this.numberOfBomb = parseInt(state.slice(4), 10);
        this.isOpen = state.startsWith("open");
        this.isFlagged = state === "flag";
        this.isBlank = state === "blank";
    }

    updateState(newState) {
        this.state = newState;
        this.isFlagged = newState === "flag";
        this.isBlank = newState === "blank";
        this.isOpen = newState.startsWith("open");;
        if (this.isOpen) {
            this.numberOfBomb = parseInt(newState.slice(4), 10);
        }
    }

    getBombCount() {
        return this.isOpen ? this.numberOfBomb : null;
    }
}

class GameState {
    constructor(cells) {
        this.cells = cells.map(cell => new Cell(cell.x, cell.y, cell.state));
        this.cellMap = this.buildCellMap();
    }

    buildCellMap() {
        this.height = 0;
        this.width = 0;
        const map = new Map();
        for (let cell of this.cells) {
            map.set(`${cell.x}_${cell.y}`, cell);
            this.height = Math.max(cell.y, this.height);
            this.width = Math.max(cell.x, this.width);
        }
        return map;
    }

    clone() {
        const cells = this.cells.map(cell => new Cell(cell.x, cell.y, cell.state));
        return new GameState(cells);
    }

    getCell(x, y) {
        return this.cellMap.get(`${x}_${y}`) || null;
    }

    isWin() {
        return this.cells.every(cell => cell.isOpen || cell.isFlagged);
    }

    isLose() {
        const consistentConfig = this.cells.every(cell => {
            if (cell.isOpen) {
                const bombCount = cell.getBombCount();
                const flaggedNeighbors = this.flaggedNeighbors(cell);
                const blankNeighbors = this.getNeighbors(cell).filter(neighbor => neighbor.isBlank && !neighbor.isFlagged);

                // If flagged neighbors + blank neighbors can't equal bomb count, it's unsolvable
                return flaggedNeighbors.length + blankNeighbors.length >= bombCount;
            }
            return true;
        });
        return !consistentConfig;
    }

    openCell(cell) {
        if (cell.isBlank && !cell.isFlagged) {
            cell.updateState(`open`);
        }
    }

    flagCell(cell) {
        if (cell.isBlank) {
            cell.updateState("flag");
        }
    }
    
    getNeighbors(cell) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        return directions
            .map(([dx, dy]) => this.getCell(cell.x + dx, cell.y + dy))
            .filter(neighbor => neighbor !== null);
    }

    flaggedNeighbors(cell) {
        return this.getNeighbors(cell).filter(neighbor => neighbor.isFlagged).length;
    }

    findCellsToFlagAndOpen() {
        const cellsToFlag = [];
        const cellsToOpen = [];

        for (let cell of this.cells) {
            if (!cell.isOpen) continue;

            const bombCount = cell.getBombCount();
            const neighbors = this.getNeighbors(cell);
            const blankNeighbors = neighbors.filter(n => n.isBlank);
            const flaggedNeighbors = neighbors.filter(n => n.isFlagged);

            // If all surrounding bombs are flagged, open remaining blank neighbors
            if (flaggedNeighbors.length === bombCount) {
                cellsToOpen.push(...blankNeighbors);
            }
            // If remaining blanks equal the bomb count, flag remaining blank neighbors
            else if (blankNeighbors.length === bombCount - flaggedNeighbors.length) {
                cellsToFlag.push(...blankNeighbors);
            }
        }

        return {
            cellsToFlag: Array.from(new Set(cellsToFlag)), // unique cells to flag
            cellsToOpen: Array.from(new Set(cellsToOpen))  // unique cells to open
        };
    }
}

export default GameState;
