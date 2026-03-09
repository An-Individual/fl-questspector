import { TabManager } from "./interface/tab-manager.js";
import { QuestsPageManager } from "./interface/quests-page-manager.js";
import { UploadPageManager } from "./interface/upload-page-manager.js";

async function initialize() {
    try {
        QuestsPageManager.initialize();
        UploadPageManager.initialize();
        TabManager.attachEvents();
    } catch (error) {
        alert(error);
        throw error;
    }
}

document.addEventListener("DOMContentLoaded", async (event) => {
	await initialize();
});