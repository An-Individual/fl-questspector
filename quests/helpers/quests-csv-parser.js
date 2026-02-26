import { ConditionParser } from "./conditions/condition-parser.js";
import { ConditionReader } from "./conditions/condition-reader.js";
import { CSVReader, CSVError } from "../../src/csv/csv-reader.js";
import { QuestStates } from "../../src/datatypes.js";

export class QuestsCSVParser {
    constructor() {
        this.conditionParser = new ConditionParser();
    }

    getDefaultState() {
        return {
            rowNumber: 0,
            categories: [],
            currentCategory: null,
            currentQuest: null,
            currentQuestState: null,
            mappings: {}
        };
    }

    parse(csvString, allowCategorySplitting) {
        let reader = new CSVReader(csvString);

        let state = this.getDefaultState();

        while(reader.readRow()) {
            let row = reader.row;
            if(row.length < 3) {
                throw new Error("CSV includes fewer than 4 columns");
            }

            state.rowNumber = reader.rowNumber;
            let firstCell = row[0]?.trim()?.toLowerCase() ?? "";

            // Skip comment rows.
            if(firstCell.startsWith("//")) {
                continue;
            }
            else if(firstCell == "category") {
                // Category splitting is used while building the base JSON
                // file so that large categories can be split across multiple
                // files. It allows CSVs to delcare empty categories and
                // build them in pieces from other files.
                this.parseCategoryRow(row, state, allowCategorySplitting);
            } else if(allowCategorySplitting && firstCell == "augcat") {
                this.parseAugCatRow(row, state);
            } else if(firstCell == "mappings" || firstCell == "mapping") {
                this.parseMappingsRow(row, state);
            } else if(firstCell == "quest") {
                this.parseQuestRow(row, state);
            } else if(this.getQuestState(firstCell)) {
                this.parseQuestStateRow(row, state);
            } else if(!firstCell) {
                this.parseTaskRow(row, state);
            } else {
                throw new CSVError(reader.rowNumber, 0, "Unexpected value");
            }
        }

        this.requireClosed(state, !allowCategorySplitting, true);

        // Apply ordering to unordered quests.
        state.categories.forEach(cat =>{
            for(let i = 0; i < cat.quests.length; i++) {
                if(!Object.hasOwn(cat.quests[i], "order")) {
                    cat.quests[i].order = cat.quests.length - i;
                }
            }
        })

        return {
            categories: state.categories
        }
    }

    isIntegerString(value) {
        return /^\d+$/.test(value);
    }

    isValidIDString(value) {
        return /^\w{1,100}$/.test(value);
    }

    parseCategoryRow(row, state, allowCategorySplitting) {
        this.requireClosed(state, !allowCategorySplitting, true);
        this.undeclare(state, true, true, true);

        let id = row[2]?.trim() ?? "";
        if(!this.isValidIDString(id)) {
            throw new CSVError(
                state.rowNumber, 
                2, 
                "Category ID is not a valid ID string. ID strings include only letters, numbers, and underscores and have a maximum length of 100 characters."
            );
        }

        if(row.length < 4) {
            throw new CSVError(
                state.rowNumber,
                3,
                "Category does not specify an order."
            );
        }
        let orderString = row[3]?.trim() ?? "";
        if(!this.isIntegerString(orderString)) {
            throw new CSVError(
                state.rowNumber, 
                3, 
                "Category order is not a valid integer."
            );
        }
        let order = parseInt(orderString);

        if(!row[1]?.trim()) {
            throw new CSVError(
                state.rowNumber, 
                1, 
                "Category title is empty."
            );
        }

        let cat = {
            id: id,
            title: row[1].trim(),
            order: order,
            quests: []
        };

        state.categories.push(cat);
        state.currentCategory = cat;
    }

    parseAugCatRow(row, state) {
        this.requireClosed(state, false, true);
        this.undeclare(state, true, true, true);

        let id = row[1]?.trim() ?? "";
        if(!this.isValidIDString(id)) {
            throw new CSVError(
                state.rowNumber, 
                1, 
                "Category ID is not a valid ID string. ID strings include only letters, numbers, and underscores and have a maximum length of 100 characters."
            );
        }

        let cat = {
            id: id,
            isAug: true,
            quests: []
        };

        state.categories.push(cat);
        state.currentCategory = cat;
    }

    parseMappingsRow(row, state) {
        if(!row[1]) {
            throw new CSVError(
                state.rowNumber, 
                1, 
                "Mappings cell is empty"
            );
        }
        let pairs = row[1].split(",");
        pairs.forEach(pair => {
            if(!pair?.trim()) {
                throw new CSVError(
                    state.rowNumber, 
                    1, 
                    `Mappings list has empty entries`
                );
            }
            let match = pair.match(/^\s*([a-zA-Z]+)\s*=\s*([0-9]+)\s*$/);
            if(!match) {
                throw new CSVError(
                    state.rowNumber, 
                    1, 
                    `Mapping "${pair}" is poorly formatted`
                );
            }
            state.mappings[match[1]] = parseInt(match[2]);
        });
    }

    parseQuestRow(row, state) {
        this.requireDeclared(state, true);
        this.requireClosed(state, false, true);
        this.undeclare(state, false, true, true);

        if(!row[1]?.trim()) {
            throw new CSVError(
                state.rowNumber, 
                1, 
                "Quest title is empty."
            );
        }

        let id = row[2]?.trim() ?? "";
        if(!this.isValidIDString(id)) {
            throw new CSVError(
                state.rowNumber, 
                2, 
                "Quest ID is not a valid ID string. ID strings include only letters, numbers, and underscores and have a maximum length of 100 characters."
            );
        }

        let quest = {
            title: row[1],
            id: id,
            states: []
        };

        state.currentCategory.quests.push(quest);
        state.currentQuest = quest;
    }

    parseQuestStateRow(row, state) {
        let check = this.requireDeclared(state, true, true);
        if(check.error) {
            return check;
        }
        this.undeclare(state, false, false, true);

        let questState = this.getQuestState(row[0]);
        if(questState < 1 || questState > 5) {
            throw new CSVError(
                state.rowNumber, 
                0, 
                "Invalid quest state type: " + row[0]
            );
        }

        if(!row[1]?.trim()) {
            throw new CSVError(
                state.rowNumber, 
                1, 
                "Quest state description is empty."
            );
        }

        let condition;
        try {
            condition = this.conditionParser.parse(row[2], state.mappings);
        } catch(error) {
            throw new CSVError(
                state.rowNumber, 
                2, 
                error.message
            );
        }
        if(!condition) {
            throw new CSVError(
                state.rowNumber, 
                2, 
                "Quest state condition is empty."
            );
        }

        let result = {
            state: questState,
            description: row[1],
            condition: condition,
            tasks: []
        };

        state.currentQuest.states.push(result);
        state.currentQuestState = result;
    }

    getQuestState(cell) {
        switch(cell.trim().toLowerCase()) {
            case "hidden":
            case "h":
                return QuestStates.HiddenStatus;
            case "not started":
            case "notstarted":
            case "ns":
                return QuestStates.NotStart;
            case "started":
            case "s":
            case "in progress":
            case "inprogress":
            case "ip":
                return QuestStates.InProgress;
            case "blocked":
            case "b":
                return QuestStates.Blocked;
            case "completed":
            case "complete":
            case "c":
                return QuestStates.Completed;
            default:
                return QuestStates.Undefined;
        }
    }

    parseTaskRow(row, state) {
        let check = this.requireDeclared(state, true, true, true);
        if(check.error) {
            return check;
        }

        if(!row[1]?.trim()) {
            throw new CSVError(
                state.rowNumber, 
                1, 
                "Task description is empty."
            );
        }
        
        let percentage = null;
        let completeCondition = null;

        let percentageMatch = row[2].match(/^\s*([a-zA-Z]+(?:\.[a-zA-Z]+)?|[0-9]+)\s*\/\s*([a-zA-Z]+(?:\.[a-zA-Z]+)?|[0-9]+)\s*$/);
        if(percentageMatch) {
            percentage = {
                value: this.parsePercentageValue(state, percentageMatch[1]),
                outOf: this.parsePercentageValue(state, percentageMatch[2])
            }
        }

        if(!percentage) {
            try {
                completeCondition = this.conditionParser.parse(row[2], state.mappings);
            } catch(error) {
                throw new CSVError(
                    state.rowNumber, 
                    2, 
                    error.message
                );
            }
            if(!completeCondition) {
                throw new CSVError(
                    state.rowNumber, 
                    2, 
                    "Task completed condition is empty."
                );
            }
        }

        let result = {
            description: row[1]
        }

        if(percentage){
            result.percentage = percentage;
        } else if (completeCondition) {
            result.completed = completeCondition;
        }

        if(row.length >= 4) {
            let visibleCondition;
            try {
                visibleCondition = this.conditionParser.parse(row[3], state.mappings);
            } catch(error) {
                throw new CSVError(
                    state.rowNumber, 
                    3, 
                    error.message
                );
            }
            if(visibleCondition) {
                result.visible = visibleCondition;
            }
        }

        state.currentQuestState.tasks.push(result);
    }

    parsePercentageValue(state, value) {
        const reader = new ConditionReader(value);
        let elem = reader.next();
        return this.conditionParser.parseValue(elem, reader, state.mappings);
    }

    requireClosed(state, category, quest) {
        if(category && state.currentCategory) {
            if(state.currentCategory.quests.length == 0){
                throw new CSVError(
                    state.rowNumber, 
                    0, 
                    "Category did not declare any quests."
                );
            }
        }

        if(quest && state.currentQuest) {
            if(state.currentQuest.states.length == 0) {
                throw new CSVError(
                    state.rowNumber, 
                    0, 
                    "Quest did not declare any states."
                );
            }
        }

        return true;
    }

    requireDeclared(state, category, quest, questState) {
        if(category && !state.currentCategory) {
            throw new CSVError(
                state.rowNumber, 
                0, 
                "A category has not been declared."
            );
        }

        if(quest && !state.currentQuest) {
            throw new CSVError(
                state.rowNumber, 
                0, 
                "A quest has not been declared."
            );
        }

        if(questState && !state.currentQuestState) {
            throw new CSVError(
                state.rowNumber, 
                0, 
                "A quest state has not been declared."
            );
        }

        return true;
    }

    undeclare(state, category, quest, questState) {
        if(category) {
            state.currentCategory = null;
        }

        if(quest){
            state.currentQuest = null;
        }

        if(questState) {
            state.currentQuestState = null;
        }

        return true;
    }
}