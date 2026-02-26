import { TabManager } from "./interface/tab-manager.js";
import { QuestsPageManager } from "./interface/quests-page-manager.js";
import { UploadPageManager } from "./interface/upload-page-manager.js";

function initialize() {
    TabManager.attachEvents();
    QuestsPageManager.initialize();
    UploadPageManager.initialize();
}

function modalCheckForDOM() {
    if (document.body && document.head) {
        initialize();
    } else {
        requestIdleCallback(modalCheckForDOM);
    }
}

requestIdleCallback(modalCheckForDOM);