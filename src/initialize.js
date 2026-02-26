import { TabManager } from "./interface/tab-manager.js";

function initialize() {
    TabManager.attachEvents();
}

function modalCheckForDOM() {
    if (document.body && document.head) {
        initialize();
    } else {
        requestIdleCallback(modalCheckForDOM);
    }
}

requestIdleCallback(modalCheckForDOM);