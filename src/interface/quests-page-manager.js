import { QuestsManager } from "../quests/quests-manager.js"
import { QuestsRenderer } from "../quests/quests-renderer.js";

export class QuestsPageManager {
    static initialize() {
        QuestsPageManager.quests = new QuestsManager();
        QuestsPageManager.quests.getQuests();
    }

    static async renderFromQualities(qualities) {
        const quests = await QuestsPageManager.quests.getQuests();
        const renderer = new QuestsRenderer(qualities);
        
        const rendered = renderer.renderQuests(quests);

        let pageElem = document.getElementById("page-quests");
        pageElem.innerText = JSON.stringify(rendered);
    }
}