import { QuestStates } from "../../datatypes.js";
import { TextFormatter } from "./text-formatter.js";

export class ElementRenderer {
    static CharacterCodes = {
        TriangleUp: "&#9650;",
        TriangleUpOutline: "&#9651;",
        TriangleDown: "&#9660;",
        TriangleDownOutline: "&#9661",
        Checkmark: "&#10003;",
        Bars: "&#8801;",
        Eye: "&#x1F441;",
        Close: "&#10006;"
    }

    constructor() {
    }

    makeElement(tag, className, children){
        let result = document.createElement(tag);
        result.className = className;
        this.appendChildren(result, children);
        return result;
    }

    appendChildren(element, children) {
        if(!children) {
            return;
        }

        children.forEach(elem => {
            element.appendChild(elem);
        });
    }

    makeElementFromHTML(elementHtml) {
        const div = document.createElement("div");
        div.innerHTML = elementHtml.trim();
        return div.firstChild;
    }

    makeTextElement(tag, className, text, markdownLite) {
        let result = this.makeElement(tag, className);
        result.innerHTML = TextFormatter.sanitizeAndFormat(text, markdownLite);
        return result;
    }

    makeQuestElement(quest)
    {
        let statusElem;
        switch(quest.state){
            case QuestStates.NotStart:
                statusElem = this.makeElementFromHTML(`<div class="quest-status notstarted"><div>Not Started</div></div>`);
                break;
            case QuestStates.HiddenStatus:
                statusElem = this.makeElementFromHTML(`<div class="quest-status hiddenstatus"><div>Hidden</div></div>`);
                break;
            case QuestStates.InProgress:
                statusElem = this.makeElementFromHTML(`<div class="quest-status inprogress"><div>In Progress</div></div>`);
                break;
            case QuestStates.Blocked:
                statusElem = this.makeElementFromHTML(`<div class="quest-status blocked"><div>Blocked</div></div>`);
                break;
            case QuestStates.Completed:
                statusElem = this.makeElementFromHTML(`<div class="quest-status completed"><div>Completed</div></div>`);
                break;
            default:
                statusElem = this.makeElementFromHTML(`<div class="quest-status"><div>ERROR</div></div>`);
        }

        let toggleElem = this.makeElementFromHTML(`<div class="quest-toggle">+</div>`);

        let mainElem = this.makeElement("div", "quest-main clickable", [
            toggleElem,
            this.makeTextElement("div", "quest-title", quest.title, false),
            statusElem
        ]);

        let detailElems = [];
        let toRender = [];

        let descriptionElem = this.makeElement("div", "quest-detail", []);
        descriptionElem.flqToRender = quest.details;
        toRender.push(descriptionElem);
        if(quest.subtasks?.length > 0){
            descriptionElem.classList.add("quest-detail-line");
        }
        detailElems.push(descriptionElem);

        let taskIndex = 0;
        if(quest.subtasks){
            quest.subtasks.forEach((task) =>{
                let statusElem;
                if(task.percentage) {
                    let asInt = Math.round(task.percentage * 100);
                    asInt = asInt > 100 ? 100 : asInt;
                    asInt = asInt < 0 ? 0 : asInt;
                    statusElem = this.makeElementFromHTML(`<div class="subtask-status">${asInt}%</div>`);
                } else if(task.completed){
                    statusElem = this.makeElementFromHTML(`<div class="subtask-status">${ElementRenderer.CharacterCodes.Checkmark}</div>`);
                } else {
                    statusElem = this.makeElementFromHTML(`<div class="subtask-status" />`);
                }

                let subDescriptionElem = this.makeElement("div", "subtask-description", []);
                subDescriptionElem.flqToRender = task.description;
                toRender.push(subDescriptionElem);
                let taskElem = this.makeElement("div", "subtask", [
                    subDescriptionElem,
                    statusElem
                ])

                if(taskIndex % 2 == 1){
                    taskElem.classList.add("subtask-offsetrow");
                }
                taskIndex++;

                detailElems.push(taskElem);
            });
        }

        let detailsElem = this.makeElement("div", "quest-details", detailElems)

        mainElem.onclick = function(){
            if(!detailsElem.style.display || detailsElem.style.display == "none")
            {
                if(toRender.length > 0) {
                    toRender.forEach(elem => {
                        elem.innerHTML = TextFormatter.sanitizeAndFormat(elem.flqToRender, true);
                    });
                    toRender = [];
                }

                detailsElem.style.display = "block";
                toggleElem.innerText = "-";
            } else {
                detailsElem.style.display = "none";
                toggleElem.innerText = "+";
            }
        };

        return this.makeElement("div", "quest", [
            mainElem,
            detailsElem
        ]);
    }

    makeCategoryElement(category, collapsed, isHidden){

        let questElems = [];
        let completedElems = []
        let completed = 0;
        category.quests.forEach((quest) =>{
            const questElem = this.makeQuestElement(quest);
            if(quest.state == QuestStates.Completed){
                completed++;
                completedElems.push(questElem)
            } else {
                questElems.push(questElem);
            }
        });

        if(questElems.length == 0 && completedElems.length == 0) {
            return;
        }

        let result = this.makeElement("div", "cat", []);

        let titleElem = this.makeTextElement("div", "cat-title", `${category.title} (${completed}/${category.quests.length})`, false);
        let titleExpandElem = this.makeElementFromHTML(`<div class="cat-expand">${ElementRenderer.CharacterCodes.TriangleUp}</div>`);
        let expandableElem = this.makeElement("div", "cat-titlebar-sub", [titleElem, titleExpandElem]);

        if(completedElems.length > 0) {
            let completedBar = this.makeElementFromHTML(`
                <div class="cat-completed-bar clickable">
                    <div class="cat-completed-toggle"></div>
                    <div class="cat-completed-title">Completed (${completedElems.length})</div>
                    <div class="cat-completed-toggle"></div>
                </div>`);
            let completedToggleElems = completedBar.getElementsByClassName("cat-completed-toggle");
            let completedQuestsElem = this.makeElement("div", "cat-completed-quests", completedElems);
            completedQuestsElem.style.display = "none";
            completedToggleElems[0].innerHTML = ElementRenderer.CharacterCodes.TriangleDown;
            completedToggleElems[1].innerHTML = ElementRenderer.CharacterCodes.TriangleDown;

            completedBar.onclick = function() {
                if(completedQuestsElem.style.display == "none") {
                    completedQuestsElem.style.display = "block";
                    completedToggleElems[0].innerHTML = ElementRenderer.CharacterCodes.TriangleUp;
                    completedToggleElems[1].innerHTML = ElementRenderer.CharacterCodes.TriangleUp;
                } else {
                    completedQuestsElem.style.display = "none";
                    completedToggleElems[0].innerHTML = ElementRenderer.CharacterCodes.TriangleDown;
                    completedToggleElems[1].innerHTML = ElementRenderer.CharacterCodes.TriangleDown;
                }
            }

            questElems.push(completedBar);
            questElems.push(completedQuestsElem);
        }

        let titleBarElem = this.makeElement("div", "cat-titlebar clickable", [expandableElem]);
        let questsElem = this.makeElement("div", "cat-quests", questElems);

        if(isHidden) {
            menuButtonElem.style.opacity = 0.5;
            expandableElem.style.opacity = 0.5;
            questsElem.style.opacity = 0.5;
        }

        if(collapsed) {
            questsElem.style.display = "none";
            titleExpandElem.innerHTML = ElementRenderer.CharacterCodes.TriangleDown;
        }

        expandableElem.onclick = function(){
            if(questsElem.style.display != "none")
            {
                questsElem.style.display = "none";
                titleExpandElem.innerHTML = ElementRenderer.CharacterCodes.TriangleDown;
            } else {
                questsElem.style.display = "block";
                titleExpandElem.innerHTML = ElementRenderer.CharacterCodes.TriangleUp;
            }
        };

        result.appendChild(titleBarElem);
        result.appendChild(questsElem);

        result.flqID = category.id;
        result.flqOrder = category.order;
        result.flqHidden = isHidden;
        return result;
    }
}