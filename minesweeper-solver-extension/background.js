// background.js
import GameState from './game/game_state.js';
import { Solver } from './game/solver.js';

// // Import each parser statically
import * as parserDefault from './parsers/parser_default.js';
import * as parserMinesweeperOnlineCom from './parsers/parser_minesweeperonline_com.js';
import * as parserMinesweeperOnline from './parsers/parser_minesweeper_online.js';

// Map the hostname to the correct parser
function getParserForSite(hostname) {
    switch (hostname) {
        case 'minesweeperonline.com':
            return {parser: parserMinesweeperOnlineCom, content: 'contents/content_script_minesweeperonline_com.js'};
        case 'minesweeper.online':
            return {parser: parserMinesweeperOnline, content: 'contents/content_script_minesweeper_online.js'};
        default:
            return {parser: parserDefault};
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
            const tabId = tabs[0].id;

            if (!url) return;
            const {parser, content} = getParserForSite(url.hostname);

            console.log("content:", content);

            // Execute the parser script in the active tab
            chrome.scripting.executeScript({
                target: { tabId: tabId },
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
                
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['contents/styles.css', content]
                }).then(() => {
                    // Once content_renderer.js is loaded, send the data to render
                    chrome.tabs.sendMessage(tabId, {
                        type: 'UPDATE_VISUALS',
                        data: solution
                    });
                }).catch((error) => {
                    console.error("Failed to inject script:", error);
                });
            });
        });
    }
});
