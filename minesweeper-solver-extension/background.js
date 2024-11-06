// background.js
import GameState from './game/game_state.js';
import { Solver } from './game/solver.js';

// // Import each parser statically
import * as parserDefault from './parsers/parser_default.js';
import * as parserMinesweeperOnline from './parsers/parser_minesweeperonline.js';

// Map the hostname to the correct parser
function getParserForSite(hostname) {
    switch (hostname) {
        case 'minesweeperonline.com':
            return parserMinesweeperOnline;
        default:
            return parserDefault;
    }
}

let gameState = null;


chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    console.log("Message received", message);

    if (message.type === 'SOLVE_GAME') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            console.log("Query!!", tabs);

            if (!tabs[0]) return;
            const url = new URL(tabs[0].url);

            if (!url) return;
            const parser = getParserForSite(url.hostname);

            // Execute the parser script in the active tab
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: parser.parseGameBoard,
            }).then((results) => {
                console.log("Script run !", results);
                gameState = new GameState(results[0].result);
                let solution;
                if (message.full === false) {
                    solution = gameState.findCellsToFlagAndOpen();
                } else {
                    const solver = new Solver(gameState);
                    solution = solver.recommend();
                }
                chrome.runtime.sendMessage({ type: 'SOLUTION_RESULT', 
                    data: solution, 
                    board: gameState  });
            });
        });
    }
});
