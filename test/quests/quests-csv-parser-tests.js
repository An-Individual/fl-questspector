import { QuestsCSVParser } from "../../quests/helpers/quests-csv-parser.js";
import { QuestStates, LogicTypes, ComparisonTypes, ValueTypes } from "../../src/datatypes.js";
import assert from "node:assert";
import * as fs from "fs";

describe("QuestsCSVParser", function(){
    function readDataFile(name) {
        return fs.readFileSync(`./test/quests/data/${name}`).toString();
    }

    function getValidState() {
        return {
            state: QuestStates.Completed,
            description: "Valid State",
            condition: {
                type: LogicTypes.Comparison,
                quality: 4321,
                comparison: ComparisonTypes.Greater,
                value: 0
            },
            tasks: []
        };
    }

    function getValidQuest(state) {
        return {
            title: "Valid Quest",
            states: [
                state ?? getValidState()
            ]
        };
    }

    function getValidCategory(quest) {
        return {
            id: "catid_1",
            title: "Valid Category",
            order: 10,
            quests: [
                quest ?? getValidQuest()
            ]
        };
    }

    describe("#parseMappingsRow", function(){
        let parser;
        let state;
        beforeEach(function(){
            parser = new QuestsCSVParser();
            state = parser.getDefaultState();
            state.rowNumber = 1;
        });

        it("Empty mappings - Error", function(){
            const row = ['mappings', '',,]
            assert.throws(function(){
                parser.parseMappingsRow(row, state);
            }, e => e.message == "Error at cell B1: Mappings cell is empty");
        });

        it("Empty entries - Error", function(){
            const row = ['mappings', 'a=1, ,b=2',,]
            assert.throws(function(){
                parser.parseMappingsRow(row, state);
            }, e => e.message == "Error at cell B1: Mappings list has empty entries");
        });

        it("Poorly Formatted - Error", function(){
            const row = ['mappings', 'a=b',,]
            assert.throws(function(){
                parser.parseMappingsRow(row, state);
            }, e => e.message == `Error at cell B1: Mapping "a=b" is poorly formatted`);
        });

        it("Single Mapping - Mapped", function(){
            const row = ['mappings', 'a=1',,]
            parser.parseMappingsRow(row, state);
            assert.equal(state.mappings.a, 1);
        });

        it("Multiple Mapping - Mapped", function(){
            const row = ['mappings', 'a=1,b=2',,]
            parser.parseMappingsRow(row, state);
            assert.equal(state.mappings.a, 1);
            assert.equal(state.mappings.b, 2);
        });

        it("Existing Mapping - Overwritten", function(){
            const row = ['mappings', 'a=2',,]
            state.mappings.a = 1
            parser.parseMappingsRow(row, state);
            assert.equal(state.mappings.a, 2);
        });
    });

    describe("#parseCategoryRow", function(){
        let parser;
        let state;
        beforeEach(function(){
            parser = new QuestsCSVParser();
            state = parser.getDefaultState();
            state.rowNumber = 1;
        });

        it("Open Category - Error", function(){
            state.currentCategory = {
                quests: []
            };
            const row = ['category','Category Name','testcat_1','10']
            assert.throws(function(){
                parser.parseCategoryRow(row, state);
            }, e => e.message == `Error at cell A1: Category did not declare any quests.`);
        });

        it("Open Category allow Splitting - Parsed", function(){
            state.currentCategory = {
                quests: []
            };
            const row = ['category','Category Name','testcat_1','10'];
            parser.parseCategoryRow(row, state, true);
            assert.equal(state.currentCategory.id, "testcat_1");
            assert.equal(state.currentCategory.title, "Category Name");
            assert.equal(state.currentCategory.order, 10);
            assert.equal(state.currentCategory.quests.length, 0);
            assert.equal(state.currentCategory, state.categories[0]);
        });

        it("Open Quest - Error", function(){
            state.currentQuest = {
                states: []
            };
            state.currentCategory = {
                quests: [
                    state.currentQuest
                ]
            };
            const row = ['category','Category Name','testcat_1','10']
            assert.throws(function(){
                parser.parseCategoryRow(row, state);
            }, e => e.message == `Error at cell A1: Quest did not declare any states.`);
        });

        it("Simple Valid Row - Parsed", function(){
            const row = ['category','Category Name','testcat_1','10'];
            parser.parseCategoryRow(row, state);
            assert.equal(state.currentCategory.id, "testcat_1");
            assert.equal(state.currentCategory.title, "Category Name");
            assert.equal(state.currentCategory.order, 10);
            assert.equal(state.currentCategory.quests.length, 0);
            assert.equal(state.currentCategory, state.categories[0]);
        });

        it("Only 3 Columns - Error", function(){
            const row = ['category','Category Name','testcat_1'];
            assert.throws(function(){
                parser.parseCategoryRow(row, state);
            }, e => e.message == `Error at cell D1: Category does not specify an order.`);
        });

        it("Empty ID - Error", function(){
            const row = ['category','Category Name','','10']
            assert.throws(function(){
                parser.parseCategoryRow(row, state);
            }, e => e.message == `Error at cell C1: Category ID is not a valid ID string. ID strings include only letters, numbers, and underscores and have a maximum length of 100 characters.`);
        });

        it("Invalid ID Character - Error", function(){
            const row = ['category','Category Name','test-cat_1','10']
            assert.throws(function(){
                parser.parseCategoryRow(row, state);
            }, e => e.message == `Error at cell C1: Category ID is not a valid ID string. ID strings include only letters, numbers, and underscores and have a maximum length of 100 characters.`);
        });

        it("Long ID - Error", function(){
            let longId = "";
            for(let i = 0; i < 101; i++) {
                longId += "a"
            }
            const row = ['category','Category Name',longId,'10']
            assert.throws(function(){
                parser.parseCategoryRow(row, state);
            }, e => e.message == `Error at cell C1: Category ID is not a valid ID string. ID strings include only letters, numbers, and underscores and have a maximum length of 100 characters.`);
        });

        it("Empty Order - Error", function(){
            const row = ['category','Category Name','testcat_1','']
            assert.throws(function(){
                parser.parseCategoryRow(row, state);
            }, e => e.message == `Error at cell D1: Category order is not a valid integer.`);
        });

        it("Invalid Order - Error", function(){
            const row = ['category','Category Name','testcat_1','1a']
            assert.throws(function(){
                parser.parseCategoryRow(row, state);
            }, e => e.message == `Error at cell D1: Category order is not a valid integer.`);
        });

        it("Empty Title - Error", function(){
            const row = ['category',' ','testcat_1','10']
            assert.throws(function(){
                parser.parseCategoryRow(row, state);
            }, e => e.message == `Error at cell B1: Category title is empty.`);
        });

        it("Existing Category - Current Replaced", function(){
            state.currentQuestState = getValidState();
            state.currentQuest = getValidQuest(state.currentQuestState);
            state.currentCategory= getValidCategory(state.currentQuest);
            state.categories.push(state.currentCategory);
            const row = ['category','New Category','newcat','20'];
            parser.parseCategoryRow(row, state);
            assert.equal(state.currentCategory.id, "newcat");
            assert.equal(state.currentCategory.title, "New Category");
            assert.equal(state.currentCategory.order, 20);
            assert.equal(state.currentCategory.quests.length, 0);
            assert(!state.currentQuest);
            assert(!state.currentQuestState);
            assert.equal(state.categories.length, 2);
            assert.equal(state.currentCategory, state.categories[1]);
        });
    });

    describe("#parseAugCatRow", function(){
        let parser;
        let state;
        beforeEach(function(){
            parser = new QuestsCSVParser();
            state = parser.getDefaultState();
            state.rowNumber = 1;
        });

        it("Simple Valid Row - Parsed", function(){
            const row = ['augcat','testcat_1','',''];
            parser.parseAugCatRow(row, state);
            assert.equal(state.currentCategory.id, "testcat_1");
            assert.equal(state.currentCategory.quests.length, 0);
            assert.equal(state.currentCategory, state.categories[0]);
        });

        it("Open Category - Parsed", function(){
            state.currentCategory = {
                quests: []
            };
            const row = ['augcat','testcat_1','',''];
            parser.parseAugCatRow(row, state);
            assert.equal(state.currentCategory.id, "testcat_1");
            assert.equal(state.currentCategory.quests.length, 0);
            assert.equal(state.currentCategory, state.categories[0]);
        });

        it("Open Quest - Error", function(){
            state.currentQuest = {
                states: []
            };
            state.currentCategory = {
                quests: [
                    state.currentQuest
                ]
            };
            const row = ['augcat','testcat_1','',''];
            assert.throws(function(){
                parser.parseAugCatRow(row, state);
            }, e => e.message == `Error at cell A1: Quest did not declare any states.`);
        });

        it("Existing Category - Current Replaced", function(){
            state.currentQuestState = getValidState();
            state.currentQuest = getValidQuest(state.currentQuestState);
            state.currentCategory= getValidCategory(state.currentQuest);
            state.categories.push(state.currentCategory);
            const row = ['augcat','newcat','',''];
            parser.parseAugCatRow(row, state);
            assert.equal(state.currentCategory.id, "newcat");
            assert.equal(state.currentCategory.quests.length, 0);
            assert(!state.currentQuest);
            assert(!state.currentQuestState);
            assert.equal(state.categories.length, 2);
            assert.equal(state.currentCategory, state.categories[1]);
        });

        it("Empty ID - Error", function(){
            const row = ['augcat','','',''];
            assert.throws(function(){
                parser.parseAugCatRow(row, state);
            }, e => e.message == `Error at cell B1: Category ID is not a valid ID string. ID strings include only letters, numbers, and underscores and have a maximum length of 100 characters.`);
        });

        it("Invalid ID Character - Error", function(){
            const row = ['augcat','ab-cd','',''];
            assert.throws(function(){
                parser.parseAugCatRow(row, state);
            }, e => e.message == `Error at cell B1: Category ID is not a valid ID string. ID strings include only letters, numbers, and underscores and have a maximum length of 100 characters.`);
        });

        it("Long ID - Error", function(){
            let longId = "";
            for(let i = 0; i < 501; i++) {
                longId += "a"
            }
            const row = ['augcat',longId,'',''];
            assert.throws(function(){
                parser.parseAugCatRow(row, state);
            }, e => e.message == `Error at cell B1: Category ID is not a valid ID string. ID strings include only letters, numbers, and underscores and have a maximum length of 100 characters.`);
        });
    });

    describe("#parseQuestRow", function(){
        let parser;
        let state;
        beforeEach(function(){
            parser = new QuestsCSVParser();
            state = parser.getDefaultState();
            state.rowNumber = 1;

            state.currentCategory = getValidCategory();
            state.currentCategory.quests = [];
            state.categories.push(state.currentCategory);
        });

        it("No Category Declared - Error", function() {
            state.categories = [];
            state.currentCategory = null;
            const row = ['quest','Quest Title','quest',''];
            assert.throws(function(){
                parser.parseQuestRow(row, state);
            }, e => e.message == `Error at cell A1: A category has not been declared.`);
        });

        it("Previous Quest No States - Error", function() {
            state.currentQuest = getValidQuest();
            state.currentQuest.states = [];
            state.currentCategory.quests.push(state.currentQuest);
            const row = ['quest','New Quest','quest',''];
            assert.throws(function(){
                parser.parseQuestRow(row, state);
            }, e => e.message == `Error at cell A1: Quest did not declare any states.`);
        });

        it("Simple Quest Row - Parsed", function() {
            const row = ['quest','Quest Title','quest',''];
            parser.parseQuestRow(row, state);
            assert.equal(state.currentQuest.title, "Quest Title");
            assert.equal(state.currentQuest.id, "quest");
            assert.equal(state.currentQuest.states.length, 0);
            assert.equal(state.currentCategory.quests.length, 1);
            assert.equal(state.currentQuest, state.currentCategory.quests[0])
        });

        it("Empty Title - Error", function() {
            const row = ['quest',' ','quest',''];
            assert.throws(function(){
                parser.parseQuestRow(row, state);
            }, e => e.message == `Error at cell B1: Quest title is empty.`);
        });

        it("Empty ID - Error", function(){
            const row = ['quest','Quest Title','',''];
            assert.throws(function(){
                parser.parseQuestRow(row, state);
            }, e => e.message == `Error at cell C1: Quest ID is not a valid ID string. ID strings include only letters, numbers, and underscores and have a maximum length of 100 characters.`);
        });

        it("Invalid ID Character - Error", function(){
            const row = ['quest','Quest Title','qu-est',''];
            assert.throws(function(){
                parser.parseQuestRow(row, state);
            }, e => e.message == `Error at cell C1: Quest ID is not a valid ID string. ID strings include only letters, numbers, and underscores and have a maximum length of 100 characters.`);
        });

        it("Long ID - Error", function(){
            let longId = "";
            for(let i = 0; i < 101; i++) {
                longId += "a"
            }
            const row = ['quest','Quest Title',longId,''];
            assert.throws(function(){
                parser.parseQuestRow(row, state);
            }, e => e.message == `Error at cell C1: Quest ID is not a valid ID string. ID strings include only letters, numbers, and underscores and have a maximum length of 100 characters.`);
        });

        it("Existing Quest - Current Replaced", function(){
            state.categories = [];
            state.currentQuestState = getValidState();
            state.currentQuest = getValidQuest(state.currentQuestState);
            state.currentCategory= getValidCategory(state.currentQuest);
            state.categories.push(state.currentCategory);
            const row = ['quest','New Quest','nq',''];
            parser.parseQuestRow(row, state);
            assert.equal(state.currentQuest.title, "New Quest");
            assert.equal(state.currentQuest.id, "nq");
            assert.equal(state.currentQuest.states.length, 0);
            assert(!state.currentQuestState);
            assert.equal(state.currentCategory.quests.length, 2);
            assert.equal(state.currentQuest, state.currentCategory.quests[1]);
            assert.equal(state.categories.length, 1);
            assert.equal(state.currentCategory, state.categories[0]);
        });
    });

    describe("#parseQuestStateRow", function(){
        let parser;
        let state;
        beforeEach(function(){
            parser = new QuestsCSVParser();
            state = parser.getDefaultState();
            state.rowNumber = 1;

            state.currentCategory = getValidCategory();
            state.currentQuest = state.currentCategory.quests[0];
            state.currentQuest.states = [];
            state.categories.push(state.currentCategory);
        });

        it("No Category Declared - Error", function() {
            state.currentQuest = null;
            state.currentCategory = null;
            state.categories = [];
            const row = ['c','State Description','val',''];
            state.mappings.val = 123;
            assert.throws(function(){
                parser.parseQuestStateRow(row, state);
            }, e => e.message == `Error at cell A1: A category has not been declared.`);
        });

        it("No Quest Declared - Error", function() {
            state.currentQuest = null;
            state.currentCategory.quests = [];
            const row = ['c','State Description','val',''];
            state.mappings.val = 123;
            assert.throws(function(){
                parser.parseQuestStateRow(row, state);
            }, e => e.message == `Error at cell A1: A quest has not been declared.`);
        });

        it("Simple State Row - Parsed", function() {
            const row = ['c','State Description','val'];
            state.mappings.val = 123;
            parser.parseQuestStateRow(row, state);
            assert.equal(state.currentQuestState.state, QuestStates.Completed);
            assert.equal(state.currentQuestState.description, "State Description");
            assert.equal(state.currentQuestState.condition.type, LogicTypes.Comparison);
            assert.equal(state.currentQuestState.condition.left.quality, 123);
            assert.equal(state.currentQuestState.condition.comparison, ComparisonTypes.Greater);
            assert.equal(state.currentQuestState.condition.right.value, 0);
            assert.equal(state.currentQuestState.tasks.length, 0);
            assert.equal(state.currentQuest.states.length, 1);
            assert.equal(state.currentQuestState, state.currentQuest.states[0]);
        });

        it("State 'hidden' - Correct State", function() {
            const row = ['hidden','State Description','val',''];
            state.mappings.val = 123;
            parser.parseQuestStateRow(row, state);
            assert.equal(state.currentQuestState.state, QuestStates.HiddenStatus);
        });

        it("State 'h' - Correct State", function() {
            const row = ['h','State Description','val',''];
            state.mappings.val = 123;
            parser.parseQuestStateRow(row, state);
            assert.equal(state.currentQuestState.state, QuestStates.HiddenStatus);
        });

        it("State 'not started' - Correct State", function() {
            const row = ['not started','State Description','val',''];
            state.mappings.val = 123;
            parser.parseQuestStateRow(row, state);
            assert.equal(state.currentQuestState.state, QuestStates.NotStart);
        });

        it("State 'notstarted' - Correct State", function() {
            const row = ['notstarted','State Description','val',''];
            state.mappings.val = 123;
            parser.parseQuestStateRow(row, state);
            assert.equal(state.currentQuestState.state, QuestStates.NotStart);
        });

        it("State 'ns' - Correct State", function() {
            const row = ['ns','State Description','val',''];
            state.mappings.val = 123;
            parser.parseQuestStateRow(row, state);
            assert.equal(state.currentQuestState.state, QuestStates.NotStart);
        });

        it("State 'in progress' - Correct State", function() {
            const row = ['in progress','State Description','val',''];
            state.mappings.val = 123;
            parser.parseQuestStateRow(row, state);
            assert.equal(state.currentQuestState.state, QuestStates.InProgress);
        });

        it("State 'inprogress' - Correct State", function() {
            const row = ['inprogress','State Description','val',''];
            state.mappings.val = 123;
            parser.parseQuestStateRow(row, state);
            assert.equal(state.currentQuestState.state, QuestStates.InProgress);
        });

        it("State 'ip' - Correct State", function() {
            const row = ['ip','State Description','val',''];
            state.mappings.val = 123;
            parser.parseQuestStateRow(row, state);
            assert.equal(state.currentQuestState.state, QuestStates.InProgress);
        });
        
        it("State 'started' - Correct State", function() {
            const row = ['started','State Description','val',''];
            state.mappings.val = 123;
            parser.parseQuestStateRow(row, state);
            assert.equal(state.currentQuestState.state, QuestStates.InProgress);
        });

        it("State 's' - Correct State", function() {
            const row = ['s','State Description','val',''];
            state.mappings.val = 123;
            parser.parseQuestStateRow(row, state);
            assert.equal(state.currentQuestState.state, QuestStates.InProgress);
        });

        it("State 'blocked' - Correct State", function() {
            const row = ['blocked','State Description','val',''];
            state.mappings.val = 123;
            parser.parseQuestStateRow(row, state);
            assert.equal(state.currentQuestState.state, QuestStates.Blocked);
        });

        it("State 'b' - Correct State", function() {
            const row = ['b','State Description','val',''];
            state.mappings.val = 123;
            parser.parseQuestStateRow(row, state);
            assert.equal(state.currentQuestState.state, QuestStates.Blocked);
        });

        it("State 'completed' - Correct State", function() {
            const row = ['completed','State Description','val',''];
            state.mappings.val = 123;
            parser.parseQuestStateRow(row, state);
            assert.equal(state.currentQuestState.state, QuestStates.Completed);
        });

        it("State 'complete' - Correct State", function() {
            const row = ['complete','State Description','val',''];
            state.mappings.val = 123;
            parser.parseQuestStateRow(row, state);
            assert.equal(state.currentQuestState.state, QuestStates.Completed);
        });

        it("State 'c' - Correct State", function() {
            const row = ['c','State Description','val',''];
            state.mappings.val = 123;
            parser.parseQuestStateRow(row, state);
            assert.equal(state.currentQuestState.state, QuestStates.Completed);
        });

        it("State Too Low - Error", function() {
            const row = ['invalid','State Description','val',''];
            state.mappings.val = 123;
            assert.throws(function(){
                parser.parseQuestStateRow(row, state);
            }, e => e.message == `Error at cell A1: Invalid quest state type: invalid`);
        });

        it("Empty Description - Error", function() {
            const row = ['c',' ','val',''];
            state.mappings.val = 123;
            assert.throws(function(){
                parser.parseQuestStateRow(row, state);
            }, e => e.message == `Error at cell B1: Quest state description is empty.`);
        });

        it("No Condition - Error", function() {
            const row = ['c','State Description','',''];
            state.mappings.val = 123;
            assert.throws(function(){
                parser.parseQuestStateRow(row, state);
            }, e => e.message == `Error at cell C1: Quest state condition is empty.`);
        });

        it("No Mapping - Error", function() {
            const row = ['c','State Description','val',''];
            assert.throws(function(){
                parser.parseQuestStateRow(row, state);
            }, e => e.message == `Error at cell C1: Condition error at position 0: No mapping for 'val'`);
        });

        it("Existing State - Current Replaced", function() {
            state.categories = [];
            state.currentQuestState = getValidState();
            state.currentQuest = getValidQuest(state.currentQuestState);
            state.currentCategory= getValidCategory(state.currentQuest);
            state.categories.push(state.currentCategory);
            const row = ['c','State Description','val',''];
            state.mappings.val = 123;
            parser.parseQuestStateRow(row, state);
            assert.equal(state.currentQuestState.state, QuestStates.Completed);
            assert.equal(state.currentQuestState.description, "State Description");
            assert.equal(state.currentQuestState.condition.type, LogicTypes.Comparison);
            assert.equal(state.currentQuestState.condition.left.quality, 123);
            assert.equal(state.currentQuestState.condition.comparison, ComparisonTypes.Greater);
            assert.equal(state.currentQuestState.condition.right.value, 0);
            assert.equal(state.currentQuestState.tasks.length, 0);
            assert.equal(state.currentQuest.states.length, 2);
            assert.equal(state.currentQuestState, state.currentQuest.states[1]);
            assert.equal(state.currentCategory.quests.length, 1);
            assert.equal(state.currentQuest, state.currentCategory.quests[0]);
            assert.equal(state.categories.length, 1);
            assert.equal(state.currentCategory, state.categories[0]);
        });
    });
    
    describe("#parseTaskRow", function(){
        let parser;
        let state;
        beforeEach(function(){
            parser = new QuestsCSVParser();
            state = parser.getDefaultState();
            state.rowNumber = 1;

            state.currentCategory = getValidCategory();
            state.currentQuest = state.currentCategory.quests[0];
            state.currentQuestState = state.currentQuest.states[0];
            state.currentQuestState.tasks = [];
            state.categories.push(state.currentCategory);
        });

        it("No Category Declared - Error", function() {
            state.currentQuestState = null;
            state.currentQuest = null;
            state.currentCategory = null;
            state.categories = [];
            const row = ['','Task Description','val',''];
            state.mappings.val = 123;
            assert.throws(function(){
                parser.parseTaskRow(row, state);
            }, e => e.message == `Error at cell A1: A category has not been declared.`);
        });

        it("No Quest Declared - Error", function() {
            state.currentQuestState = null;
            state.currentQuest = null;
            state.currentCategory.quests = [];
            const row = ['','Task Description','val',''];
            state.mappings.val = 123;
            assert.throws(function(){
                parser.parseTaskRow(row, state);
            }, e => e.message == `Error at cell A1: A quest has not been declared.`);
        });

        it("No Quest State Declared - Error", function() {
            state.currentQuestState = null;
            state.currentQuest.states = [];
            const row = ['','Task Description','val',''];
            state.mappings.val = 123;
            assert.throws(function(){
                parser.parseTaskRow(row, state);
            }, e => e.message == `Error at cell A1: A quest state has not been declared.`);
        });

        it("Simple Task Row - Parsed", function(){
            const row = ['','Task Description','val',''];
            state.mappings.val = 123;
            parser.parseTaskRow(row, state);
            assert.equal(state.currentQuestState.tasks.length, 1);
            assert.equal(state.currentQuestState.tasks[0].description, "Task Description");
            assert.equal(state.currentQuestState.tasks[0].completed.type, LogicTypes.Comparison);
            assert.equal(state.currentQuestState.tasks[0].completed.left.quality, 123);
            assert.equal(state.currentQuestState.tasks[0].completed.comparison, ComparisonTypes.Greater);
            assert.equal(state.currentQuestState.tasks[0].completed.right.value, 0);
            assert(!Object.hasOwn(state.currentQuestState.tasks[0], "visible"));
        });

        it("Task with Percent - Parsed", function(){
            const row = ['','Task Description','val/456',''];
            state.mappings.val = 123;
            parser.parseTaskRow(row, state);
            assert.equal(state.currentQuestState.tasks.length, 1);
            assert.equal(state.currentQuestState.tasks[0].description, "Task Description");
            assert.equal(state.currentQuestState.tasks[0].percentage.value.type, ValueTypes.Quality);
            assert.equal(state.currentQuestState.tasks[0].percentage.value.quality, 123);
            assert.equal(state.currentQuestState.tasks[0].percentage.outOf.type, ValueTypes.Integer);
            assert.equal(state.currentQuestState.tasks[0].percentage.outOf.value, 456);
            assert(!Object.hasOwn(state.currentQuestState.tasks[0], "visible"));
            assert(!Object.hasOwn(state.currentQuestState.tasks[0], "completed"))
        });

        it("Task with Percent Reversed - Parsed", function(){
            const row = ['','Task Description','456/val.level',''];
            state.mappings.val = 123;
            parser.parseTaskRow(row, state);
            assert.equal(state.currentQuestState.tasks.length, 1);
            assert.equal(state.currentQuestState.tasks[0].description, "Task Description");
            assert.equal(state.currentQuestState.tasks[0].percentage.value.type, ValueTypes.Integer);
            assert.equal(state.currentQuestState.tasks[0].percentage.value.value, 456);
            assert.equal(state.currentQuestState.tasks[0].percentage.outOf.type, ValueTypes.Quality);
            assert.equal(state.currentQuestState.tasks[0].percentage.outOf.quality, 123);
            assert.equal(state.currentQuestState.tasks[0].percentage.outOf.property, "level");
            assert(!Object.hasOwn(state.currentQuestState.tasks[0], "visible"));
            assert(!Object.hasOwn(state.currentQuestState.tasks[0], "completed"))
        });

        it("Empty Description - Error", function() {
            const row = ['',' ','val',''];
            state.mappings.val = 123;
            assert.throws(function(){
                parser.parseTaskRow(row, state);
            }, e => e.message == `Error at cell B1: Task description is empty.`);
        });

        it("Empty Completed - Error", function() {
            const row = ['','Task Description','',''];
            state.mappings.val = 123;
            assert.throws(function(){
                parser.parseTaskRow(row, state);
            }, e => e.message == `Error at cell C1: Task completed condition is empty.`);
        });

        it("No Mapping - Error", function() {
            const row = ['','Task Description','val',''];
            assert.throws(function(){
                parser.parseTaskRow(row, state);
            }, e => e.message == `Error at cell C1: Condition error at position 0: No mapping for 'val'`);
        });
        
        it("Has Visibility - Parsed", function(){
            const row = ['','Task Description','val','vis=2'];
            state.mappings.val = 123;
            assert.throws(function(){
                parser.parseTaskRow(row, state);
            }, e => e.message == `Error at cell D1: Condition error at position 0: No mapping for 'vis'`);
        });
        
        it("Visibility Unmapped - Error", function(){
            const row = ['','Task Description','val','vis=2'];
            state.mappings.val = 123;
            state.mappings.vis = 345;
            parser.parseTaskRow(row, state);
            assert.equal(state.currentQuestState.tasks.length, 1);
            assert.equal(state.currentQuestState.tasks[0].description, "Task Description");
            assert.equal(state.currentQuestState.tasks[0].completed.type, LogicTypes.Comparison);
            assert.equal(state.currentQuestState.tasks[0].completed.left.quality, 123);
            assert.equal(state.currentQuestState.tasks[0].completed.comparison, ComparisonTypes.Greater);
            assert.equal(state.currentQuestState.tasks[0].completed.right.value, 0);
            assert.equal(state.currentQuestState.tasks[0].visible.type, LogicTypes.Comparison);
            assert.equal(state.currentQuestState.tasks[0].visible.left.quality, 345);
            assert.equal(state.currentQuestState.tasks[0].visible.comparison, ComparisonTypes.Equal);
            assert.equal(state.currentQuestState.tasks[0].visible.right.value, 2);
        });
    });

    describe("#parse()", function(){
        let parser;
        beforeEach(function(){
            parser = new QuestsCSVParser();
        });

        it("Valid CSV - Parsed", function(){
            const csvString = readDataFile("valid.csv");
            const quests = parser.parse(csvString);
            assert.equal(quests.categories.length, 2);
            assert.equal(quests.categories[0].title, "Cat 1");
            assert.equal(quests.categories[0].id, "cat1");
            assert.equal(quests.categories[0].order, 20);
            assert.equal(quests.categories[0].quests.length, 2);
            assert.equal(quests.categories[0].quests[0].title, "Quest 1");
            assert.equal(quests.categories[0].quests[0].id, "q1");
            assert.equal(quests.categories[0].quests[0].states.length, 1);
            assert.equal(quests.categories[0].quests[0].states[0].state, QuestStates.Completed);
            assert.equal(quests.categories[0].quests[0].states[0].description, "State 1");
            assert.equal(quests.categories[0].quests[0].states[0].condition.type, LogicTypes.Comparison);
            assert.equal(quests.categories[0].quests[0].states[0].condition.left.quality, 123);
            assert.equal(quests.categories[0].quests[0].states[0].condition.comparison, ComparisonTypes.Greater);
            assert.equal(quests.categories[0].quests[0].states[0].condition.right.value, 0);
            assert.equal(quests.categories[0].quests[0].states[0].tasks.length, 1);
            assert.equal(quests.categories[0].quests[0].states[0].tasks[0].description, "Task 1");
            assert.equal(quests.categories[0].quests[0].states[0].tasks[0].completed.type, LogicTypes.Comparison);
            assert.equal(quests.categories[0].quests[0].states[0].tasks[0].completed.left.quality, 456);
            assert.equal(quests.categories[0].quests[0].states[0].tasks[0].completed.comparison, ComparisonTypes.Equal);
            assert.equal(quests.categories[0].quests[0].states[0].tasks[0].completed.right.value, 321);
            assert(!quests.categories[0].quests[0].states[0].tasks[0].visible);
            assert.equal(quests.categories[0].quests[1].title, "Quest 2");
            assert.equal(quests.categories[0].quests[1].id, "q2");
            assert.equal(quests.categories[0].quests[1].states.length, 1);
            assert.equal(quests.categories[0].quests[1].states[0].state, QuestStates.NotStart);
            assert.equal(quests.categories[0].quests[1].states[0].description, "State 2");
            assert.equal(quests.categories[0].quests[1].states[0].condition.type, LogicTypes.Comparison);
            assert.equal(quests.categories[0].quests[1].states[0].condition.left.quality, 456);
            assert.equal(quests.categories[0].quests[1].states[0].condition.comparison, ComparisonTypes.Greater);
            assert.equal(quests.categories[0].quests[1].states[0].condition.right.value, 0);
            assert.equal(quests.categories[0].quests[1].states[0].tasks.length, 0);
            assert.equal(quests.categories[1].title, "Cat 2");
            assert.equal(quests.categories[1].id, "cat2");
            assert.equal(quests.categories[1].order, 10);
            assert.equal(quests.categories[1].quests.length, 1);
            assert.equal(quests.categories[1].quests[0].title, "Quest 3");
            assert.equal(quests.categories[1].quests[0].id, "q3");
            assert.equal(quests.categories[1].quests[0].states.length, 2);
            assert.equal(quests.categories[1].quests[0].states[0].state, QuestStates.InProgress);
            assert.equal(quests.categories[1].quests[0].states[0].description, "State 3");
            assert.equal(quests.categories[1].quests[0].states[0].condition.type, LogicTypes.Comparison);
            assert.equal(quests.categories[1].quests[0].states[0].condition.left.quality, 789);
            assert.equal(quests.categories[1].quests[0].states[0].condition.comparison, ComparisonTypes.Less);
            assert.equal(quests.categories[1].quests[0].states[0].condition.right.value, 5);
            assert.equal(quests.categories[1].quests[0].states[0].tasks.length, 1);
            assert.equal(quests.categories[1].quests[0].states[0].tasks[0].description, "Task 2");
            assert.equal(quests.categories[1].quests[0].states[0].tasks[0].completed.type, LogicTypes.Comparison);
            assert.equal(quests.categories[1].quests[0].states[0].tasks[0].completed.left.quality, 7);
            assert.equal(quests.categories[1].quests[0].states[0].tasks[0].completed.comparison, ComparisonTypes.GreaterEqual);
            assert.equal(quests.categories[1].quests[0].states[0].tasks[0].completed.right.value, 3);
            assert.equal(quests.categories[1].quests[0].states[0].tasks[0].visible.type, LogicTypes.Comparison);
            assert.equal(quests.categories[1].quests[0].states[0].tasks[0].visible.left.quality, 7);
            assert.equal(quests.categories[1].quests[0].states[0].tasks[0].visible.comparison, ComparisonTypes.Greater);
            assert.equal(quests.categories[1].quests[0].states[0].tasks[0].visible.right.value, 1);
            assert.equal(quests.categories[1].quests[0].states[1].state, QuestStates.Blocked);
            assert.equal(quests.categories[1].quests[0].states[1].description, "State 4");
            assert.equal(quests.categories[1].quests[0].states[1].condition.type, LogicTypes.Comparison);
            assert.equal(quests.categories[1].quests[0].states[1].condition.left.quality, 456);
            assert.equal(quests.categories[1].quests[0].states[1].condition.comparison, ComparisonTypes.Equal);
            assert.equal(quests.categories[1].quests[0].states[1].condition.right.value, 1);
            assert.equal(quests.categories[1].quests[0].states[1].tasks.length, 0);
        });

        it("Capitalization & Whitespace in First Column - Parsed", function(){
            const csvString = readDataFile("caps-and-spaces.csv");
            const quests = parser.parse(csvString);
            assert.equal(quests.categories.length, 2);
            assert.equal(quests.categories[0].title, "Cat 1");
            assert.equal(quests.categories[0].id, "cat1");
            assert.equal(quests.categories[0].order, 20);
            assert.equal(quests.categories[0].quests.length, 2);
            assert.equal(quests.categories[0].quests[0].title, "Quest 1");
            assert.equal(quests.categories[0].quests[0].id, "q1");
            assert.equal(quests.categories[0].quests[0].states.length, 1);
            assert.equal(quests.categories[0].quests[0].states[0].state, QuestStates.Completed);
            assert.equal(quests.categories[0].quests[0].states[0].description, "State 1");
            assert.equal(quests.categories[0].quests[0].states[0].condition.type, LogicTypes.Comparison);
            assert.equal(quests.categories[0].quests[0].states[0].condition.left.quality, 123);
            assert.equal(quests.categories[0].quests[0].states[0].condition.comparison, ComparisonTypes.Greater);
            assert.equal(quests.categories[0].quests[0].states[0].condition.right.value, 0);
            assert.equal(quests.categories[0].quests[0].states[0].tasks.length, 1);
            assert.equal(quests.categories[0].quests[0].states[0].tasks[0].description, "Task 1");
            assert.equal(quests.categories[0].quests[0].states[0].tasks[0].completed.type, LogicTypes.Comparison);
            assert.equal(quests.categories[0].quests[0].states[0].tasks[0].completed.left.quality, 456);
            assert.equal(quests.categories[0].quests[0].states[0].tasks[0].completed.comparison, ComparisonTypes.Equal);
            assert.equal(quests.categories[0].quests[0].states[0].tasks[0].completed.right.value, 321);
            assert(!quests.categories[0].quests[0].states[0].tasks[0].visible);
            assert.equal(quests.categories[0].quests[1].title, "Quest 2");
            assert.equal(quests.categories[0].quests[1].id, "q2");
            assert.equal(quests.categories[0].quests[1].states.length, 1);
            assert.equal(quests.categories[0].quests[1].states[0].state, QuestStates.NotStart);
            assert.equal(quests.categories[0].quests[1].states[0].description, "State 2");
            assert.equal(quests.categories[0].quests[1].states[0].condition.type, LogicTypes.Comparison);
            assert.equal(quests.categories[0].quests[1].states[0].condition.left.quality, 456);
            assert.equal(quests.categories[0].quests[1].states[0].condition.comparison, ComparisonTypes.Greater);
            assert.equal(quests.categories[0].quests[1].states[0].condition.right.value, 0);
            assert.equal(quests.categories[0].quests[1].states[0].tasks.length, 0);
            assert.equal(quests.categories[1].title, "Cat 2");
            assert.equal(quests.categories[1].id, "cat2");
            assert.equal(quests.categories[1].order, 10);
            assert.equal(quests.categories[1].quests.length, 1);
            assert.equal(quests.categories[1].quests[0].title, "Quest 3");
            assert.equal(quests.categories[1].quests[0].id, "q3");
            assert.equal(quests.categories[1].quests[0].states.length, 2);
            assert.equal(quests.categories[1].quests[0].states[0].state, QuestStates.InProgress);
            assert.equal(quests.categories[1].quests[0].states[0].description, "State 3");
            assert.equal(quests.categories[1].quests[0].states[0].condition.type, LogicTypes.Comparison);
            assert.equal(quests.categories[1].quests[0].states[0].condition.left.quality, 789);
            assert.equal(quests.categories[1].quests[0].states[0].condition.comparison, ComparisonTypes.Less);
            assert.equal(quests.categories[1].quests[0].states[0].condition.right.value, 5);
            assert.equal(quests.categories[1].quests[0].states[0].tasks.length, 1);
            assert.equal(quests.categories[1].quests[0].states[0].tasks[0].description, "Task 2");
            assert.equal(quests.categories[1].quests[0].states[0].tasks[0].completed.type, LogicTypes.Comparison);
            assert.equal(quests.categories[1].quests[0].states[0].tasks[0].completed.left.quality, 7);
            assert.equal(quests.categories[1].quests[0].states[0].tasks[0].completed.comparison, ComparisonTypes.GreaterEqual);
            assert.equal(quests.categories[1].quests[0].states[0].tasks[0].completed.right.value, 3);
            assert.equal(quests.categories[1].quests[0].states[0].tasks[0].visible.type, LogicTypes.Comparison);
            assert.equal(quests.categories[1].quests[0].states[0].tasks[0].visible.left.quality, 7);
            assert.equal(quests.categories[1].quests[0].states[0].tasks[0].visible.comparison, ComparisonTypes.Greater);
            assert.equal(quests.categories[1].quests[0].states[0].tasks[0].visible.right.value, 1);
            assert.equal(quests.categories[1].quests[0].states[1].state, QuestStates.Blocked);
            assert.equal(quests.categories[1].quests[0].states[1].description, "State 4");
            assert.equal(quests.categories[1].quests[0].states[1].condition.type, LogicTypes.Comparison);
            assert.equal(quests.categories[1].quests[0].states[1].condition.left.quality, 456);
            assert.equal(quests.categories[1].quests[0].states[1].condition.comparison, ComparisonTypes.Equal);
            assert.equal(quests.categories[1].quests[0].states[1].condition.right.value, 1);
            assert.equal(quests.categories[1].quests[0].states[1].tasks.length, 0);
        });

        it("Commented Rows - Rows Not Parsed", function(){
            const csvString = readDataFile("commented.csv");
            const quests = parser.parse(csvString);
            assert.equal(quests.categories.length, 2);
            assert.equal(quests.categories[0].title, "Cat 1");
            assert.equal(quests.categories[0].id, "cat1");
            assert.equal(quests.categories[0].order, 20);
            assert.equal(quests.categories[0].quests.length, 2);
            assert.equal(quests.categories[0].quests[0].title, "Quest 1");
            assert.equal(quests.categories[0].quests[0].id, "q1");
            assert.equal(quests.categories[0].quests[0].states.length, 1);
            assert.equal(quests.categories[0].quests[0].states[0].state, QuestStates.Completed);
            assert.equal(quests.categories[0].quests[0].states[0].description, "State 1");
            assert.equal(quests.categories[0].quests[0].states[0].condition.type, LogicTypes.Comparison);
            assert.equal(quests.categories[0].quests[0].states[0].condition.left.quality, 123);
            assert.equal(quests.categories[0].quests[0].states[0].condition.comparison, ComparisonTypes.Greater);
            assert.equal(quests.categories[0].quests[0].states[0].condition.right.value, 0);
            assert.equal(quests.categories[0].quests[0].states[0].tasks.length, 1);
            assert.equal(quests.categories[0].quests[0].states[0].tasks[0].description, "Task 1");
            assert.equal(quests.categories[0].quests[0].states[0].tasks[0].completed.type, LogicTypes.Comparison);
            assert.equal(quests.categories[0].quests[0].states[0].tasks[0].completed.left.quality, 456);
            assert.equal(quests.categories[0].quests[0].states[0].tasks[0].completed.comparison, ComparisonTypes.Equal);
            assert.equal(quests.categories[0].quests[0].states[0].tasks[0].completed.right.value, 321);
            assert(!quests.categories[0].quests[0].states[0].tasks[0].visible);
            assert.equal(quests.categories[0].quests[1].title, "Quest 2");
            assert.equal(quests.categories[0].quests[1].id, "q2");
            assert.equal(quests.categories[0].quests[1].states.length, 1);
            assert.equal(quests.categories[0].quests[1].states[0].state, QuestStates.NotStart);
            assert.equal(quests.categories[0].quests[1].states[0].description, "State 2");
            assert.equal(quests.categories[0].quests[1].states[0].condition.type, LogicTypes.Comparison);
            assert.equal(quests.categories[0].quests[1].states[0].condition.left.quality, 456);
            assert.equal(quests.categories[0].quests[1].states[0].condition.comparison, ComparisonTypes.Greater);
            assert.equal(quests.categories[0].quests[1].states[0].condition.right.value, 0);
            assert.equal(quests.categories[0].quests[1].states[0].tasks.length, 0);
            assert.equal(quests.categories[1].title, "Cat 2");
            assert.equal(quests.categories[1].id, "cat2");
            assert.equal(quests.categories[1].order, 10);
            assert.equal(quests.categories[1].quests.length, 1);
            assert.equal(quests.categories[1].quests[0].title, "Quest 3");
            assert.equal(quests.categories[1].quests[0].id, "q3");
            assert.equal(quests.categories[1].quests[0].states.length, 1);
            assert.equal(quests.categories[1].quests[0].states[0].state, QuestStates.Blocked);
            assert.equal(quests.categories[1].quests[0].states[0].description, "State 4");
            assert.equal(quests.categories[1].quests[0].states[0].condition.type, LogicTypes.Comparison);
            assert.equal(quests.categories[1].quests[0].states[0].condition.left.quality, 456);
            assert.equal(quests.categories[1].quests[0].states[0].condition.comparison, ComparisonTypes.Equal);
            assert.equal(quests.categories[1].quests[0].states[0].condition.right.value, 1);
            assert.equal(quests.categories[1].quests[0].states[0].tasks.length, 0);
        });
        
        it("End Quest Not Closed - Error", function(){
            const csvString = readDataFile("quest-not-closed.csv");
            assert.throws(function(){
                parser.parse(csvString);
            }, e => e.message == "Error at cell A8: Quest did not declare any states.");
        });
        
        it("End Category Not Closed - Error", function(){
            const csvString = readDataFile("category-not-closed.csv");
            assert.throws(function(){
                parser.parse(csvString);
            }, e => e.message == "Error at cell A7: Category did not declare any quests.");
        });

        it("End Category Not Closed - Error", function(){
            const csvString = readDataFile("category-not-closed.csv");
            assert.throws(function(){
                parser.parse(csvString);
            }, e => e.message == "Error at cell A7: Category did not declare any quests.");
        });

        it("Category Alone with Splitting - Parsed", function(){
            const csvString = readDataFile("category-alone.csv");
            const quests = parser.parse(csvString, true);
            assert.equal(quests.categories.length, 1);
            assert.equal(quests.categories[0].title, "Cat 1");
            assert.equal(quests.categories[0].id, "cat1");
            assert.equal(quests.categories[0].order, 20);
            assert.equal(quests.categories[0].quests.length, 0);
        });

        it("Simple Category Augmentation - Parsed", function(){
            const csvString = readDataFile("category-aug.csv");
            const quests = parser.parse(csvString, true);
            assert.equal(quests.categories.length, 1);
            assert.equal(quests.categories[0].id, "cat1");
            assert(!Object.hasOwn(quests.categories[0], "title"));
            assert(!Object.hasOwn(quests.categories[0], "order"));
            assert.equal(quests.categories[0].quests.length, 1);
            assert.equal(quests.categories[0].quests[0].title, "Quest 1");
            assert.equal(quests.categories[0].quests[0].id, "q1");
            assert.equal(quests.categories[0].quests[0].states.length, 1);
            assert.equal(quests.categories[0].quests[0].states[0].state, QuestStates.Completed);
            assert.equal(quests.categories[0].quests[0].states[0].description, "State 1");
            assert.equal(quests.categories[0].quests[0].states[0].condition.type, LogicTypes.Comparison);
            assert.equal(quests.categories[0].quests[0].states[0].condition.left.quality, 123);
            assert.equal(quests.categories[0].quests[0].states[0].condition.comparison, ComparisonTypes.Greater);
            assert.equal(quests.categories[0].quests[0].states[0].condition.right.value, 0);
        });

        it("Category Augmentation No Splitting - Error", function(){
            const csvString = readDataFile("category-aug.csv");
            assert.throws(function(){
                parser.parse(csvString);
            }, e => e.message == "Error at cell A1: Unexpected value");
        });

        it("Category Augmentation Empty Quest - Error", function(){
            const csvString = readDataFile("category-aug-quest-empty.csv");
            assert.throws(function(){
                parser.parse(csvString, true);
            }, e => e.message == "Error at cell A2: Quest did not declare any states.");
        });

        it("Mapping singular - Parsed", function(){
            const csvString = readDataFile("mapping.csv");
            const quests = parser.parse(csvString);
            assert.equal(quests.categories.length, 1);
            assert.equal(quests.categories[0].id, "cat1");
            assert.equal(quests.categories[0].title, "Cat 1");
            assert.equal(quests.categories[0].order, 20);
            assert.equal(quests.categories[0].quests.length, 1);
            assert.equal(quests.categories[0].quests[0].title, "Quest 1");
            assert.equal(quests.categories[0].quests[0].id, "q1");
            assert.equal(quests.categories[0].quests[0].states.length, 1);
            assert.equal(quests.categories[0].quests[0].states[0].state, QuestStates.Completed);
            assert.equal(quests.categories[0].quests[0].states[0].description, "State 1");
            assert.equal(quests.categories[0].quests[0].states[0].condition.type, LogicTypes.Comparison);
            assert.equal(quests.categories[0].quests[0].states[0].condition.left.quality, 123);
            assert.equal(quests.categories[0].quests[0].states[0].condition.comparison, ComparisonTypes.Greater);
            assert.equal(quests.categories[0].quests[0].states[0].condition.right.value, 0);
        });
    });
});