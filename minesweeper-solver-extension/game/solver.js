class Solver {
    constructor(gameState, simulations = 100) {
        this.gameState = gameState;
        this.simulations = simulations;
        this.simulations_tries = 10;
        this.limit_simulations_failed = 5;
    }

    recommend() {
        const unexploredCells = this.gameState.cells.filter(cell => cell.isBlank && !cell.isFlagged);
        const cellProbabilities = unexploredCells.map(cell => ({
            cell,
            bombProbability: this.simulateBombConfigurations(cell)
        }));

        const cellsToOpen = cellProbabilities.filter(c => c.bombProbability === 0).map(c => c.cell);
        const cellsToFlag = cellProbabilities.filter(c => c.bombProbability === 1).map(c => c.cell);

        if (cellsToOpen.length > 0 || cellsToFlag.length > 0) {
            return { cellsToOpen, cellsToFlag };
        }

        const lowestRiskCell = cellProbabilities.reduce((lowest, current) =>
            current.bombProbability !== null && (current.bombProbability < lowest.bombProbability) ? current : lowest,
            { bombProbability: 1 }
        );

        return {
            cellsToOpen: [],
            cellsToFlag: [],
            lowestRiskCell: lowestRiskCell.bombProbability < 1 ? lowestRiskCell.cell : null
        };
    }

    simulateBombConfigurations(targetCell) {
        let bombCounts = 0;
        let noInfo = 0;
        let failed = 0;

        for (let i = 0; i < this.simulations; i++) {
            const simulatedGame = this.gameState.clone();
            const possibleBombLayout = this.createPossibleBombLayout(simulatedGame);
            if (possibleBombLayout === null) {
                if (failed > this.limit_simulations_failed) {
                    console.log("Failed simulation");
                    return null;
                }
                failed++;
                continue;
            } else {
                failed = 0;
            }

            if (!possibleBombLayout[`${targetCell.x}_${targetCell.y}`]) {
                noInfo++;
            }
            else if (possibleBombLayout[`${targetCell.x}_${targetCell.y}`] === 'bomb') {
                bombCounts++;
            }
        }

        if (bombCounts === 0 && noInfo === this.simulations) {
            return null;
        }

        return bombCounts / this.simulations;
    }

    createPossibleBombLayout(simulatedGame, tries = 0) {
        if (tries > this.simulations_tries) {
            return null;
        }


        const layout = {};
        const openCells = simulatedGame.cells.filter(cell => cell.isOpen);

        const { cellsToOpen, cellsToFlag } = simulatedGame.findCellsToFlagAndOpen();

        simulatedGame.cells.filter(cell => cell.isFlagged).forEach(cell =>
            layout[`${cell.x}_${cell.y}`] = 'bomb'
        )

        cellsToOpen.forEach(cell => layout[`${cell.x}_${cell.y}`] = 'safe');
        cellsToFlag.forEach(cell => layout[`${cell.x}_${cell.y}`] = 'bomb')

        let change = true;
        while (change) {   
            change = false;
            // Mark all cells that are certain to be bombs or safe
            for (let cell of openCells) {
                const bombCount = cell.getBombCount();
                if (bombCount === 0) continue;
                const neighbors = simulatedGame.getNeighbors(cell);
                const blankNeighbors = neighbors.filter(n => n.isBlank && !layout[`${n.x}_${n.y}`]);
                if (blankNeighbors.length === 0) continue;
                const flaggedNeighbors = neighbors.filter(n => n.isFlagged || layout[`${n.x}_${n.y}`] === 'bomb');
                const bombsNeeded = bombCount - flaggedNeighbors.length;
                
                
                if (bombsNeeded === blankNeighbors.length) {
                    blankNeighbors.forEach(neighbor => {
                        if (!layout[`${neighbor.x}_${neighbor.y}`]) {
                            layout[`${neighbor.x}_${neighbor.y}`] = 'bomb'
                            change = true;
                        }
                    });
                } else if (bombsNeeded === 0) {
                    blankNeighbors.forEach(neighbor => {
                        if (!layout[`${neighbor.x}_${neighbor.y}`]) {
                            layout[`${neighbor.x}_${neighbor.y}`] = 'safe'
                            change = true;
                        }
                    });
                }
            }
        }
            
        // // Place remaining bombs randomly, based on probability, while checking for consistency
        // const remainingBlanks = simulatedGame.cells.filter(cell => cell.isBlank && !cell.isFlagged && !layout[`${cell.x}_${cell.y}`]);
        // const bombsRemaining = this.gameState.bombCount - simulatedGame.cells.filter(c => c.isFlagged).length;
        // const bombProbability = bombsRemaining / remainingBlanks.length;

        // for (let cell of remainingBlanks) {
        //     if (layout[`${cell.x}_${cell.y}`] === undefined) {
        //         layout[`${cell.x}_${cell.y}`] = Math.random() < bombProbability ? 'bomb' : 'safe';
        //     }
        // }

        // Validate layout to ensure it matches open cell constraints
        if (!this.verifyLayout(layout, simulatedGame)) {
            console.log("Not good layout");
            return this.createPossibleBombLayout(simulatedGame, tries + 1);
        }

        return layout;
    }

    verifyLayout(layout, simulatedGame) {
        for (let cell of simulatedGame.cells.filter(c => c.isOpen)) {
            const neighbors = simulatedGame.getNeighbors(cell);
            const bombCount = neighbors.reduce((count, n) => {
                return count + (layout[`${n.x}_${n.y}`] === 'bomb' || n.isFlagged ? 1 : 0);
            }, 0);

            if (bombCount > cell.getBombCount()) {
                return false;
            }
        }

        // Ensure consistency with initial certain placements
        for (let cell of simulatedGame.cells) {
            if (cell.isFlagged && layout[`${cell.x}_${cell.y}`] !== 'bomb') {
                console.log(`Inconsistency: flagged cell at ${cell.x}, ${cell.y} should be a bomb.`);
                return false;
            }
            if (cell.isOpen && layout[`${cell.x}_${cell.y}`] === 'bomb') {
                console.log(`Inconsistency: open cell at ${cell.x}, ${cell.y} contains a bomb.`);
                return false;
            }
        }

        return true;
    }
}


export { Solver };
