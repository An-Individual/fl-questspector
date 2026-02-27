/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./src/interface/tab-manager.js
class TabManager {
    static tabs = [
        "upload",
        "quests",
        "help"
    ]

    static classes = {
        clickable: "clickable",
        selected: "tab-selected",
        unselected: "tab-unselected"
    }

    static selectTab(name) {
        TabManager.tabs.forEach(tab => {
                const tabElem = document.getElementById(`tab-${tab}`);
                const pageElem = document.getElementById(`page-${tab}`);
                if(tab == name) {
                    tabElem.classList.remove(TabManager.classes.clickable);
                    tabElem.classList.remove(TabManager.classes.unselected);
                    tabElem.classList.add(TabManager.classes.selected);
                    pageElem.style.display = "block";
                } else {
                    tabElem.classList.remove(TabManager.classes.selected);
                    tabElem.classList.add(TabManager.classes.clickable);
                    tabElem.classList.add(TabManager.classes.unselected);
                    pageElem.style.display = "none";
                }
            });
    }

    static attachEvents() {
        document.getElementById("tab-upload").onclick = function() {
            TabManager.selectTab("upload");
        }

        document.getElementById("tab-quests").onclick = function() {
            TabManager.selectTab("quests");
        }

        document.getElementById("tab-help").onclick = function() {
            TabManager.selectTab("help");
        }

        TabManager.selectTab("upload");
    }
}
;// ./src/datatypes.js
const QuestStates = {
    Undefined: 0,
    NotStart: 1,
    InProgress: 2,
    Blocked: 3,
    Completed: 4,
    HiddenStatus: 5
}

const QuestSortPriority = {
    [QuestStates.InProgress]: 1,
    [QuestStates.Blocked]: 2,
    [QuestStates.NotStart]: 3,
    [QuestStates.HiddenStatus]: 4,
    [QuestStates.Completed]: 5,
    [QuestStates.Undefined]: 6
}

const LogicTypes = {
    Undefined: 0,
    Comparison: 1,
    And: 2,
    Or: 3,
    Not: 4
}

const ComparisonTypes = {
    Undefined: 0,
    Equal: 1,
    NotEqual: 2,
    Greater: 3,
    GreaterEqual: 4,
    Less: 5,
    LessEqual: 6
}

const ValueTypes = {
    Undefined: 0,
    Integer: 1,
    Quality: 2
}

const AllowedQualityProperties = [
    "level",
    "effectiveLevel",
    "baseLevel",
    "cap"
]
;// ./src/quests/quests-validator.js


class QuestsValidationError extends Error{
    constructor(property, message) {
        super(`${property}: ${message}`);
    }

    addElemStack(name) {
        this.message = `${name} -> ${this.message}`;
    }
}

class QuestsValidator {
    validate(quests, ignoreVersion) {
        if(!quests) {
            throw new Error("Quests JSON was undefined");
        }

        if(!ignoreVersion){
            this.isValidStringProperty(quests.version, "Version Property Error");
        }

        this.isValidArray(quests.categories, "Category List Error", true);

        for (let i = 0; i < quests.categories.length; i++) {
            try {
                this.validateCategory(quests.categories[i]);
            }catch(error) {
                error.addElemStack?.(`Category ${i + 1}`);
                throw error;
            }
        }

        let existingIds = [];
        for (let i = 0; i < quests.categories.length; i++) {
            if(existingIds.indexOf(quests.categories[i].id) >= 0) {
                throw new Error("Category ID Not Unique: " + quests.categories[i].id);
            }
            existingIds.push(quests.categories[i].id);
        }
    }

    validateCategory(category) {
        this.isValidIDProperty(category.id, "ID Error");
        this.isValidStringProperty(category.title, "Title Error");
        this.isValidInteger(category.order, "Order Error");
        this.isValidArray(category.quests, "Quest List Error", true);

        let existingIds = [];
        for(let i = 0; i < category.quests.length; i++) {
            try {
                this.validateQuest(category.quests[i]);
            }catch(error) {
                error.addElemStack?.(`Quest ${i + 1}`);
                throw error;
            }

            if(existingIds.indexOf(category.quests[i].id) >= 0) {
                throw new Error("Quest ID Not Unique: " + category.quests[i].id);
            }
            existingIds.push(category.quests[i].id);
        }
    }

    validateQuest(quest) {
        this.isValidIDProperty(quest.id, "ID Error");
        this.isValidStringProperty(quest.title, "Title Error");
        this.isValidArray(quest.states, "States Error", true);
        
        for(let i = 0; i < quest.states.length; i++) {
            try {
                this.validateState(quest.states[i]);
            } catch (error) {
                error.addElemStack?.(`Quest State ${i + 1}`);
                throw error;
            }
        }
    }

    validateState(state) {
        this.isValidInteger(state.state, "State Error", 1, 5);
        this.isValidStringProperty(state.description, "Description Error");

        try {
            this.validateCondition(state.condition);
        } catch (error) {
            error.addElemStack?.(`Condition`);
            throw error;
        }
        if(state.tasks) {
            this.isValidArray(state.tasks, "Tasks Error");
            for(let i = 0; i < state.tasks.length; i++) {
                try {
                    this.validateTask(state.tasks[i]);
                } catch (error) {
                    error.addElemStack?.(`Task ${i + 1}`);
                    throw error;
                }
            }
        }
    }

    validateTask(task) {
        this.isValidStringProperty(task.description, `Description Error`);

        if(task.percentage) {
            try {
                this.validateValue(task.percentage.value);
            } catch (error) {
                error.addElemStack?.(`Percentage Value`);
                throw error;
            }

            try {
                this.validateValue(task.percentage.outOf);
            } catch (error) {
                error.addElemStack?.(`Percentage Out Of`);
                throw error;
            }
        } else {
            try {
                this.validateCondition(task.completed);
            } catch (error) {
                error.addElemStack?.(`Completed`);
                throw error;
            }
        }

        if(task.visible) {
            try {
                this.validateCondition(task.visible);
            } catch (error) {
                error.addElemStack?.(`Visible`);
                throw error;
            }
        }
    }

    validateCondition(condition) {
        if(!condition){
            throw new QuestsValidationError("Condition Error", "No condition defined");
        }

        this.isValidInteger(condition.type, "Condition Type Error");

        switch(condition.type) {
            case LogicTypes.And:
            case LogicTypes.Or:
                if(!condition.left) {
                    throw new QuestsValidationError("Condition Error", "Left logic statement undefined.")
                }
                if(!condition.right) {
                    throw new QuestsValidationError("Condition Error", "Right logic statement undefined.")
                }
                this.validateCondition(condition.left);
                this.validateCondition(condition.right);
                break;
            case LogicTypes.Not:
                if(!condition.statement) {
                    throw new QuestsValidationError("Condition Error", "NOT target undefined.")
                }
                this.validateCondition(condition.statement);
                break;
            case LogicTypes.Comparison:
                this.isValidInteger(condition.comparison, "Condition Comparison Error", 1, 6);
                this.validateValue(condition.left);
                this.validateValue(condition.right);
                break;
            default:
                throw new QuestsValidationError("Condition Error", `Unknown condition type "${condition.type}"`);
        }
    }

    validateValue(value) {
        if(!value) {
            throw new QuestsValidationError("Value Error", "No value defined.");
        }

        switch(value.type) {
            case ValueTypes.Integer:
                this.isValidInteger(value.value, "Integer Value Error");
                break;
            case ValueTypes.Quality:
                this.isValidInteger(value.quality, "Quality ID Error");
                if(Object.hasOwn(value, "property")) {
                    this.isValidStringProperty(value.property, "Quality Property Error");
                    if(!AllowedQualityProperties.includes(value.property)) {
                        throw new QuestsValidationError("Quality Property Error", `Unknown quality property "${value.property}"`);
                    }
                }
                break;
            default:
                throw new QuestsValidationError("Value Type Error", `Unknown value type "${value.type}"`);
        }
    }

    isValidStringProperty(propValue, message) {
        if(!propValue) {
            throw new QuestsValidationError(message, "Undefined");
        }

        if(!this.isString(propValue)) {
            throw new QuestsValidationError(message, `Not a string`);
        }

        if(!propValue.trim()) {
            throw new QuestsValidationError(message, "Is Empty");
        }
    }

    isValidIDProperty(propValue, message) {
        this.isValidStringProperty(propValue, message);

        if(!/^\w{1,100}$/.test(propValue)) {
            throw new QuestsValidationError(message, `IDs must contain only letters, numbers, and underscores and be fewer than 500 characters.`);
        }
    }

    isValidArray(propValue, message, requireValues){
        if(!propValue) {
            throw new QuestsValidationError(message, `Undefined`);
        }

        if(!Array.isArray(propValue)) {
            throw new QuestsValidationError(message, `Not an Array`);
        }

        if(requireValues && propValue.length == 0) {
            throw new QuestsValidationError(message, `Is Empty`);
        }
    }

    isValidInteger(propValue, message, minValue, maxValue){
        if(!Number.isInteger(propValue)){
            throw new QuestsValidationError(message, `Is not an Integer`);
        }

        // This will break if either value is 0
        // but I've carefully avoided using 0 as
        // a valid value so we're just going to
        // ignore that.
        if(minValue && maxValue)
        {
            if(propValue < minValue || propValue > maxValue) {
                throw new QuestsValidationError(message, `Invalid value`);
            }
        }
    }

    isString(obj) {
        return typeof obj === "string" || obj instanceof String;
    }
}
;// ./src/quests/quests-manager.js


class QuestsManager {

    constructor() {
        this.validator = new QuestsValidator();
        this.getQuests();
    }

    clear() {
        this.quests = null;
        this.questsRaw = null;
    }

    clearImported() {
        this.quests = null;
    }

    async getQuests() {
        if(this.quests) {
            return this.quests
        }

        while(this.fetching) {
            await new Promise(r => setTimeout(r, 10));
            if(this.quests) {
                return this.quests;
            }
        }

        try {
            this.fetching = true;

            const response = await fetch("quests.json");

            if(!response.ok) {
                throw new Error("HTTP error: " + response.status);
            }

            const fetchedQuests = await response.json();

            this.validator.validate(fetchedQuests);

            this.quests = fetchedQuests;
            return this.quests;
        } finally {
            this.fetching = false;
        }
    }

    async getCategories() {
        let questWrapper = await this.getQuests();
        return questWrapper.categories;
    }
}
;// ./src/quests/quests-renderer.js


class QuestsRenderer {
    constructor(qualities){
        this.qualities = qualities;
    }

    renderQuests(quests) {
        if(!quests || !quests.categories || !quests.categories.length) {
            return [];
        }

        let result = [];
        for(let i = 0; i < quests.categories.length; i++) {
            let category = quests.categories[i];
            if(!category.quests) {
                continue;
            }

            let outputCat = {
                "id": category.id,
                "title": category.title,
                "order": category.order,
                "quests": []
            }

            category.quests.forEach(quest =>{
                let outputQuest = this.renderQuest(quest);
                if(outputQuest){
                    outputCat.quests.push(outputQuest);
                }
            });

            if(outputCat.quests.length > 0) {
                this.sortQuests(outputCat.quests);
                result.push(outputCat);
            }
        }

        result.sort((a,b) => b.order - a.order);

        return result;
    }

    sortQuests(questList) {
        questList?.sort((a,b) => {
            let typeDif = QuestSortPriority[a.state] - QuestSortPriority[b.state];
            if(typeDif != 0){
                return typeDif;
            }
            if(a.title < b.title) {
                return -1;   
            }
            if(a.title > b.title) {
                return 1;
            }
            return 0;
        })
    }

    renderQuest(quest)
    {
        if(!quest || !quest.states) {
            return null;
        }

        let result = {
            title: quest.title,
            id: quest.id,
            subtasks: []
        }

        let state;
        for (let i = quest.states.length-1; i >= 0; i--)
        {
            if(this.evaluateCondition(quest.states[i].condition))
            {
                state = quest.states[i];
                break;
            }
        }

        if(!state) {
            return null;
        }

        result.state = state.state;
        result.details = state.description;

        if(state.tasks) {
            state.tasks.forEach(task =>{
                if(!task.completed && !task.percentage) {
                    throw new Error("Task does not include a completed condition.")
                }

                if(task.visible && !this.evaluateCondition(task.visible)) {
                    return;
                }

                const renderedTask = {
                    description: task.description,
                }

                if(task.percentage) {
                    renderedTask.percentage = this.processValue(task.percentage.value) / this.processValue(task.percentage.outOf);
                } else if (task.completed) {
                    renderedTask.completed = this.evaluateCondition(task.completed);
                }

                result.subtasks.push(renderedTask);
            });
        }

        return result;
    }

    evaluateCondition(condition) {
        if(!condition) {
            throw new Error("Condition Undefined")
        }
        switch(condition.type) {
            case LogicTypes.And:
                if(!condition.left) {
                    throw new Error("AND left condition undefined.")
                }
                if(!condition.right) {
                    throw new Error("AND right condition undefined.")
                }
                return this.evaluateCondition(condition.left) && this.evaluateCondition(condition.right);
            case LogicTypes.Or:
                if(!condition.left) {
                    throw new Error("OR left condition undefined.")
                }
                if(!condition.right) {
                    throw new Error("OR right condition undefined.")
                }
                return this.evaluateCondition(condition.left) || this.evaluateCondition(condition.right);
            case LogicTypes.Not:
                if(!condition.statement) {
                    throw new Error("NOT statement undefined.");
                }
                return !this.evaluateCondition(condition.statement);
            case LogicTypes.Comparison:
                return this.evaluateComparison(condition);
            default:
                throw new Error("Unknown condition type: " + condition.type);
        }
    }

    evaluateComparison(comparision) {
        if(!comparision) {
            throw new Error("Comparison Undefined");
        }

        const left = this.processValue(comparision.left);
        const right = this.processValue(comparision.right);

        switch(comparision.comparison) {
            case ComparisonTypes.Equal:
                return left == right;
            case ComparisonTypes.NotEqual:
                return left != right;
            case ComparisonTypes.Greater:
                return left > right;
            case ComparisonTypes.GreaterEqual:
                return left >= right;
            case ComparisonTypes.Less:
                return left < right;
            case ComparisonTypes.LessEqual:
                return left <= right;
            default:
                throw new Error("Unknown comparison type: " + comparision.comparison);
        }
    }

    processValue(value) {
        if(!value) {
            throw new Error("Value Undefined");
        }

        switch(value.type) {
            case ValueTypes.Integer:
                return value.value;
            case ValueTypes.Quality:
                return this.qualities.getValue(value.quality, value.property);
            default:
                throw new Error("Unknown value type: " + value.type);
        }
    }
}
;// ./src/interface/helpers/text-formatter.js
class TextFormatter {
    static Expressions = {
        Header: /^\s*(#{1,6}) ?/,
        ListPoint: /^(\s*)([-+]|\* )/
    }

    static ChunkType = {
        Unknown: 0,
        Text: 1,
        Heading: 2,
        List: 3
    }

    /**
     * This function makes text safe for insertion
     * into the UI as HTML. It can also, optionally,
     * insert line breaks and do some light formatting
     * based on markdown syntax. This includes headings,
     * bold/italic/strikethrough text, and unordered 
     * lists. It does not include links as I do not want
     * to risk someone distributing quest files 
     * containing malicious links.
     */
    static sanitizeAndFormat(str, markdownLite) {
        if(!str) {
            return str;
        }

        let escaped = TextFormatter.htmlEscape(str);

        if(!markdownLite) {
            return escaped;
        }

        let result = "";
        let chunks = TextFormatter.mardownSplitChunks(escaped);
        chunks.forEach(chunk =>{
            if(!chunk.trim()) {
                return;
            }

            let headingMatch = chunk.match(TextFormatter.Expressions.Header);
            if(headingMatch) {
                let hNum = headingMatch[1].length;
                let hBody = chunk.substring(headingMatch[0].length);
                result += `<h${hNum}>${TextFormatter.formatTextChunk(hBody)}</h${hNum}>`
            } else if(chunk.match(TextFormatter.Expressions.ListPoint)) {
                result += TextFormatter.handleListChunk(chunk);
            } else {
                result += "<p>" + TextFormatter.formatTextChunk(chunk) + "</p>";
            }
        });

        return result;
    }

    /**
     * Splits the string along double return lines
     * and standardizes the returns within a chunk
     * to use just "\n" so the chunk handling code
     * doesn't need to account for the "\r\n" case.
     */
    static mardownSplitChunks(str) {
        if(!str){
            return [];
        }

        /**
         * Markdown carves things up into meaningful
        * chunks via double new line characters. But
        * there are two. "\r" and "\n". And Windows
        * can make our life hard by using "\r\n" for
        * a single new line. The lone "\r" case is
        * old enough we're going to ignore it, but
        * we have to account for the other two.
         */
        let winLines = str.split("\r\n");
        let lines = [];
        winLines.forEach(wl =>{
            wl.split("\n").forEach(l =>{
                lines.push(l);
            })
        })
        
        let chunks = [];
        let currentChunk;
        let currentType = TextFormatter.ChunkType.Unknown;
        for(const i in lines) {
            if(!lines[i]) {
                if(currentChunk) {
                    chunks.push(currentChunk);
                    currentChunk = null;
                    currentType = TextFormatter.ChunkType.Unknown;
                }
                continue;
            }

            let line = lines[i];
            let type = TextFormatter.getLineType(line);
            if(type == TextFormatter.ChunkType.Text) {
                line = line.trim();
                if(currentChunk) {
                    currentChunk += " " + line;
                } else {
                    currentChunk = line;
                    currentType = type;
                }
            } else {
                line = line.trimEnd();
                if(type != currentType || type == TextFormatter.ChunkType.Heading) {
                    if(currentChunk) {
                        chunks.push(currentChunk);
                    }
                    currentChunk = line;
                    currentType = type;
                } else {
                    // If we get here we have chained
                    // list item rows.
                    if(currentChunk) {
                        currentChunk += "\n" + line;
                    } else {
                        currentChunk = line;
                    }
                }
            }

            if(i == lines.length - 1 && currentChunk) {
                chunks.push(currentChunk);
            }
        }

        return chunks
    }

    static getLineType(line) {
        if(!line) {
            return TextFormatter.ChunkType.Unknown;
        }

        if(line.match(TextFormatter.Expressions.Header)) {
            return TextFormatter.ChunkType.Heading;
        }

        if(line.match(TextFormatter.Expressions.ListPoint)) {
            return TextFormatter.ChunkType.ListPoint;
        }

        return TextFormatter.ChunkType.Text;
    }

    static handleListChunk(chunk) {
        let lines = chunk.split("\n");
        let points = [];
        lines.forEach(line =>{
            // Vertical tab (\v) and form feeder (\f) characters
            // risk breaking this. We're just going to assume
            // people aren't going to be typing those and 
            // let it break.
            let match = line.match(TextFormatter.Expressions.ListPoint);
            if(!match) {
                if(points.length == 0) {
                    throw new Error("Cannot listify non-list chunk.");
                }
                points[points.length - 1].chunk += "\n" + line;
            } else {
                /**
                 * The possibility of tabs is complicated because
                 * how they'll look to the writer differes based
                 * on the editor they're looking at it through.
                 * For example, both Notepad and Notepad++ push
                 * text ahead in fixed increments that ignore
                 * preceeding spaces if they don't exceed that
                 * distance, but Notepad uses 8 spaces and 
                 * Notepad++ uses 4. The correct thing to do
                 * is not use tabs at all. But if we encounter
                 * them I've decided to just let them count
                 * as a flat 4 spaces.
                 */
                points.push({
                    depth: match[1].length + ((match[1].match(/\t/g)?.length ?? 0) * 3),
                    chunk: line.substring(match[0].length)
                });
            }
        });

        return TextFormatter.collapsePoints(points);
    }

    /**
     * Recursive helper method for handleListChunks that takes the list
     * of points and depths it generates and creates a string with
     * appropriate <ul> and <li> tag wrappings. 
     */
    static collapsePoints(points) {
        let depths = points.map(p => p.depth);
        let depth = Math.min.apply(Math, depths);
        let subPoints = [];
        let lines = [];
        for(let i = 0; i < points.length; i++) {
            let point = points[i];
            if(point.depth > depth) {
                subPoints.push(point);
            }
            
            if(i == points.length - 1 || point.depth == depth) {
                if(subPoints.length > 0) {
                    lines.push(TextFormatter.collapsePoints(subPoints));
                    subPoints = [];
                }
            }

            if(point.depth == depth){
                lines.push(`<li>${TextFormatter.formatTextChunk(point.chunk)}</li>`);
            }
        }

        return `<ul>${lines.join("")}</ul>`;
    }

    /**
     * Takes the new line characters remaining in
     * text chunks after the chunk split that breaks
     * up text on double new line characters and
     * replaces them, and any lingery white space
     * between them, with a single regular space.
     */
    static formatTextChunk(chunk) {
        if(!chunk) {
            return chunk;
        }

        let lines = chunk.split("\n");
        let result = "";
        lines.forEach(line => {
            let l = line.trim();
            if(result){
                result += " ";
            }
            result += TextFormatter.markdownCharacterEmphasis(l);
        });

        return result;
    }

    static markdownCharacterEmphasis(line){
        /**
         * These all work in a similar way. First they find a sequence of the wrapper
         * character (one, two, or three instances) followed by a non-space, non-wrapper
         * character. They end by matching the same sequence in reverse (using a lookbehind
         * to check for the non-wrapper character so we can match cases that wrap a single
         * character). Between those points they match either any character that isn't the 
         * wrapper charactor, or an instance of the wrapper character that doesn't match the 
         * end sequence when you do a reverse lookbehind.
         */
        const boldItalic = /\*{3}([^*\s]([^*]|(?<![^*\s]\*\*)\*)*)(?<=[^*\s])\*{3}/;
        const bold = /\*{2}([^*\s]([^*]|(?<![^*\s]\*)\*)*)(?<=[^*\s])\*{2}/;
        const italic = /\*([^*\s]([^*]|(?<![^\s*])\*)*)(?<=[^*\s])\*/;
        const strikethrough = /~{2}([^~\s]([^~]|(?<![^~\s]~)~)*)(?<=[^~\s])~{2}/;

        const patterns = [
            boldItalic,
            bold,
            italic,
            strikethrough
        ]

        let result = "";
        let remainingLine = line;
        while(remainingLine) {
            let closestMatch;
            let closestType;
            for(let i = 0; i < patterns.length; i++) {
                let match = patterns[i].exec(remainingLine);
                if(match){
                    if(!closestMatch || match.index < closestMatch.index) {
                        closestMatch = match;
                        closestType = i;
                    }
                }
            }

            if(!closestMatch) {
                result += remainingLine;
                remainingLine = "";
            } else {
                // Run the conversion logic recursively. This is done to handle
                // nested tags without risking the possibility that tags overlap
                // each other.
                let innerText = this.markdownCharacterEmphasis(closestMatch[1]);
                result += remainingLine.substring(0, closestMatch.index);
                remainingLine = remainingLine.substring(closestMatch.index + closestMatch[0].length);
                switch(closestType){
                    case 0:
                        result += "<b><i>" + innerText + "</i></b>";
                        break;
                    case 1:
                        result += "<b>" + innerText + "</b>";
                        break;
                    case 2:
                        result += "<i>" + innerText + "</i>";
                        break;
                    case 3:
                        result += "<s>" + innerText + "</s>";
                        break;
                    default:
                        throw new Error("Markdown emphasis type not implemented");
                }
            }
        }

        return result;
    }

    static htmlEscape(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/'/g, '&apos;')
            .replace(/"/g, '&quot;')
            .replace(/>/g, '&gt;')
            .replace(/</g, '&lt;');
    }
}
;// ./src/interface/helpers/element-renderer.js



class ElementRenderer {
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
;// ./src/interface/help-page-manager.js
class HelpPageManager {
    static updateVersionBox(quests, qualities) {
        let versionString = "Quests Information"
        if(!quests) {
            versionString += "\n    Undefined";
        } else {
            versionString += `\n    Version: ${quests.version}`;

            let categories = quests.categories.length;
            let questsCount = 0;
            quests.categories.forEach(cat => {
                questsCount += cat.quests.length;
            });

            versionString += `\n    Categories: ${categories}`;
            versionString += `\n    Quests: ${questsCount}`;
        }

        versionString += "\nQualities Information";
        if(!qualities) {
            versionString += "\n    None";
        } else {
            versionString += `\n    Count: ${qualities.getCount()}`;
        }

        const versionElem = document.getElementById("version-box");
        versionElem.innerText = versionString;
    }
}
;// ./src/interface/quests-page-manager.js






class QuestsPageManager {
    static initialize() {
        QuestsPageManager.quests = new QuestsManager();
        QuestsPageManager.initQuests();
    }

    static async initQuests() {
        const quests = await QuestsPageManager.quests.getQuests();
        HelpPageManager.updateVersionBox(quests);
    }

    static async renderFromQualities(qualities) {
        try {
            const quests = await QuestsPageManager.quests.getQuests();

            HelpPageManager.updateVersionBox(quests, qualities);

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
;// ./src/csv/csv-reader.js
class CSVReader {
    constructor(csvString) {
        this.remaining = csvString;
        this.rowNumber = 0;
    }

    readRow() {
        if(!this.remaining) {
            this.row = undefined;
            return;
        }

        let cells = [];
        while(this.remaining) {
            let quoteCell = this.remaining.match(/^"(([^"]|"{2})*)"/);
            if(quoteCell) {
                cells.push(quoteCell[1].replace(/""/g,`"`));
                this.remaining = this.remaining.slice(quoteCell[0].length);
            } else {
                // This will match even on an empty string
                let plainCell = this.remaining.match(/^[^,\r\n]*/);
                cells.push(plainCell[0]);
                this.remaining = this.remaining.slice(plainCell[0].length);
            }

            // Overly defensive, but we're just going to allow
            // any combination and number of return and new line
            // characters to end a line rather than strictly
            // requiring one row per line. The goal is to reliably
            // parse a CSV exported from various spreadsheet
            // programs, not be pedantic about CSV formatting.
            let endline = this.remaining.match(/^[\r\n]+/);
            if(endline) {
                this.remaining = this.remaining.slice(endline[0].length);
                break;
            }

            if(this.remaining && this.remaining[0] == ",") {
                this.remaining = this.remaining.slice(1);
                if(!this.remaining) {
                    cells.push("");
                }
            }
        }

        if(this.row && this.row.length != cells.length) {
            throw new Error("CSV Parsing Error: Row length is not consistent.")
        }

        this.row = cells;
        this.rowNumber++;
        return cells;
    }
}

class CSVError extends Error {
    constructor(row, column, message) {
        // Convert the column number to 
        // it's text representation.
        const letterNum = column % 26;
        const letter = (10+letterNum).toString(36).toUpperCase()
        const letterCount = Math.floor(column / 26) + 1;
        let columnLetters = "";
        for(let i = 0; i < letterCount; i++) {
            columnLetters += letter;
        }
        let cell = columnLetters + row;
        super(`Error at cell ${cell}: ${message}`);
        this.column = columnLetters;
        this.row = row;
        this.cell = cell;
        this.text = message;
    }
}
;// ./src/qualities/qualities-store.js


class QualitiesStore {
    
    static fromCSV(csvString) {
        const reader = new CSVReader(csvString);
        let list = [];
        let columns = [];
        while(reader.readRow()) {
            if(reader.rowNumber == 1) {
                for(let i = 0; i < reader.row.length; i++) {
                    columns.push(reader.row[i]?.trim());
                }

                if(!columns.includes("id")) {
                    throw new Error(`Does not include an "id" column`);
                }

                if(!columns.includes("level")) {
                    throw new Error(`Does not include a "level" column`);
                }

                if(!columns.includes("effectiveLevel")) {
                    throw new Error(`Does not include a "effectiveLevel" column`);
                }
            } else {
                let quality = {};
                for(let i = 0; i < reader.row.length; i++) {
                    quality[columns[i]] = reader.row[i];
                }
                list.push(quality);
            }
        }

        return new QualitiesStore(list);
    }

    constructor(qualityList) {
        this.qualities = {};
        qualityList.forEach(q => {
            this.qualities[q.id] = q;
        });
    }

    getValue(id, property) {
        if(!property) {
            property = "effectiveLevel"
        }
        if(property == "baseLevel") {
            property = "level";
        }
        return this.qualities[id]?.[property] ?? 0;
    }

    getCount() {
        return Object.keys(this.qualities).length;
    }
}
;// ./src/interface/upload-page-manager.js




class UploadPageManager {
    static initialize() {
        UploadPageManager.addEventInterrupts();
        UploadPageManager.attachFileDropEvent(UploadPageManager.onFileUploaded);
    }

    // Lovingly borrowed from: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop
    static addEventInterrupts() {

        window.addEventListener("drop", (e) => {
            if ([...e.dataTransfer.items].some((item) => item.kind === "file")) {
                e.preventDefault();
            }
        });

        window.addEventListener("dragover", (e) => {
            const fileItems = [...e.dataTransfer.items].filter(
                (item) => item.kind === "file",
            );
            if (fileItems.length > 0) {
                e.preventDefault();
                if (!document.getElementById("drop-zone").contains(e.target)) {
                    e.dataTransfer.dropEffect = "none";
                }
            }
        });

        document.getElementById("drop-zone").addEventListener("dragover", (e) => {
            const fileItems = [...e.dataTransfer.items].filter(
                (item) => item.kind === "file",
            );
            if (fileItems.length > 0) {
                e.preventDefault();
                if (fileItems.some((item) => item.type.startsWith("text/"))) {
                    e.dataTransfer.dropEffect = "copy";
                } else {
                    e.dataTransfer.dropEffect = "none";
                }
            }
        });
    }

    static attachFileDropEvent(onFileUploaded) {
        const dropZone = document.getElementById("drop-zone");
        dropZone.addEventListener("drop", ev => {
            ev.preventDefault();
            const files = [...ev.dataTransfer.items];
            if(files.length > 0) {
                onFileUploaded(files[0].getAsFile());
            }
        });

        const fileInput = document.getElementById("file-input");
        fileInput.addEventListener("change", (e) => {
            if(e.target.files.length > 0) {
                onFileUploaded(e.target.files[0]);
            }
        });
    }

    static async onFileUploaded(file) {
        try {
            let rawFile = await UploadPageManager.readFile(file);
            let qualities = QualitiesStore.fromCSV(rawFile);
            await QuestsPageManager.renderFromQualities(qualities);
            TabManager.selectTab("quests");
        } catch (error) {
            alert(error);
        }
    }

    static readFile(file) {
        return new Promise((resolve,reject) =>{
            let reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.onerror = () => {
                reject(new Error(`An error occurred reading file: ${file.name}`));
            };
            reader.readAsText(file);
        })
    }
}
;// ./src/initialize.js




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
/******/ })()
;
//# sourceMappingURL=questspector.js.map