import { TabManager } from "./interface/tab-manager.js";
import { QuestsPageManager } from "./interface/quests-page-manager.js";
import { UploadPageManager } from "./interface/upload-page-manager.js";

function initialize() {
    TabManager.attachEvents();
    QuestsPageManager.initialize();
    UploadPageManager.initialize();
}

document.addEventListener("DOMContentLoaded", (event) => {
	initialize();
});