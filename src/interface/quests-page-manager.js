import { QuestsManager } from "../quests/quests-manager.js"
import { QuestsRenderer } from "../quests/quests-renderer.js";
import { ElementRenderer } from "./helpers/element-renderer.js";

export class QuestsPageManager {
    static initialize() {
        QuestsPageManager.quests = new QuestsManager();
        QuestsPageManager.quests.getQuests();
    }

    static async renderFromQualities(qualities) {
        try {
            const quests = await QuestsPageManager.quests.getQuests();
            const renderer = new QuestsRenderer(qualities);
            
            const rendered = renderer.renderQuests(quests);

            const elemRenderer = new ElementRenderer();
            const catElems = [];
            rendered.forEach(cat => {
                const catElem = elemRenderer.makeCategoryElement(cat);
                catElems.push(catElem);
            });

            let pageElem = document.getElementById("page-quests");
            QuestsPageManager.clearChildren(pageElem);
            catElems.forEach(elem => {
                pageElem.appendChild(elem);
            });
        } catch (error) {
            QuestsPageManager.setTabError(error);
        }
    }

    static setTabError(error) {
        let pageElem = document.getElementById("page-quests");
        QuestsPageManager.clearChildren(pageElem);
        pageElem.innerHTML = `
            <div id="error-title">Error Rendering Quests</div>
            <div id="error-message"></div>
            <div id="error-trace"></div>
        `;
        let messageElem = document.getElementById("error-message");
        let traceElem = document.getElementById("error-trace");

        messageElem.innerHTML = TextFormatter.sanitizeAndFormat(error.message);
        traceElem.innerHTML = TextFormatter.sanitizeAndFormat(error.stack);
    }

    static clearChildren(element) {
        while(element.firstChild){
            element.removeChild(element.lastChild);
        }
    }
}