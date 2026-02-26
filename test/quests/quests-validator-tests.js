import { QuestsValidator } from "../../src/quests/quests-validator.js";
import { QuestStates, LogicTypes, ComparisonTypes, ValueTypes } from "../../src/datatypes.js";
import assert from "node:assert";

describe("QuestsValidator", function(){
    function getValidQuality() {
        return {
            type: ValueTypes.Quality,
            quality: 123
        };
    }

    function getValidInteger() {
        return {
            type: ValueTypes.Integer,
            value: 7
        }
    }

    function getInvalidValue() {
        return {
            value: 7
        }
    }
    
    function getValidCondition() {
        return {
            type: LogicTypes.Comparison,
            comparison: ComparisonTypes.Equal,
            left: getValidQuality(),
            right: getValidInteger()
        };
    }

    function getInvalidCondition() {
        return {
            type: LogicTypes.Comparison,
            quality: 123,
            comparison: ComparisonTypes.Equal
        };
    }

    function getValidTask() {
        return {
            description: "Task Description",
            completed: getValidCondition()
        };
    }

    function getInvalidTask() {
        return {
            completed: getValidCondition()
        };
    }

    function getValidState() {
        return {
            state: QuestStates.Completed,
            description: "State Description",
            condition: getValidCondition()
        };
    }

    function getInvalidState() {
        return {
            description: "State Description",
            condition: getValidCondition()
        };
    }

    function getValidQuest() {
        return {
            title: "Quest Title",
            id: "quest_id",
            states: [
                getValidState()
            ]
        }
    }

    function getInvalidQuest() {
        return {
            id: "quest_id",
            states: [
                getValidState()
            ]
        }
    }

    function getValidCategory() {
        return {
            id: "cat_1",
            title: "Category Title",
            order: 10,
            quests: [
                getValidQuest()
            ]
        }
    }

    function getInvalidCategory() {
        return {
            title: "Category Title",
            order: 10,
            quests: [
                getValidQuest()
            ]
        }
    }

    describe("#validateValue()", function(){
        let validator;
        beforeEach(function(){
            validator = new QuestsValidator();
        });

        it("Simple Valid Integer - Valid", function(){
            const value = {
                type: ValueTypes.Integer,
                value: 7
            }
            validator.validateValue(value);
        });

        it("Integer No Value - Error", function(){
            const value = {
                type: ValueTypes.Integer
            }
            assert.throws(function(){
                validator.validateValue(value);
            }, e => e.message == `Integer Value Error: Is not an Integer`);
        });

        it("Simple Valid Quality - Valid", function(){
            const value = {
                type: ValueTypes.Quality,
                quality: 123
            }
            validator.validateValue(value);
        });

        it("Quality with Level Property - Valid", function(){
            const value = {
                type: ValueTypes.Quality,
                quality: 123,
                property: "level"
            }
            validator.validateValue(value);
        });

        it("Quality with Base Level Property - Valid", function(){
            const value = {
                type: ValueTypes.Quality,
                quality: 123,
                property: "baseLevel"
            }
            validator.validateValue(value);
        });

        it("Quality with Effective Level Property - Valid", function(){
            const value = {
                type: ValueTypes.Quality,
                quality: 123,
                property: "effectiveLevel"
            }
            validator.validateValue(value);
        });

        it("Quality with Cap Property - Valid", function(){
            const value = {
                type: ValueTypes.Quality,
                quality: 123,
                property: "cap"
            }
            validator.validateValue(value);
        });

        it("Quality Not Defined - Error", function(){
            const value = {
                type: ValueTypes.Quality
            }
            assert.throws(function(){
                validator.validateValue(value);
            }, e => e.message == `Quality ID Error: Is not an Integer`);
        });

        it("Quality Property Not String - Error", function(){
            const value = {
                type: ValueTypes.Quality,
                quality: 123,
                property: 456
            }
            assert.throws(function(){
                validator.validateValue(value);
            }, e => e.message == `Quality Property Error: Not a string`);
        });

        it("Quality Property Empty - Error", function(){
            const value = {
                type: ValueTypes.Quality,
                quality: 123,
                property: ""
            }
            assert.throws(function(){
                validator.validateValue(value);
            }, e => e.message == `Quality Property Error: Undefined`);
        });

        it("Quality Unknown Property - Error", function(){
            const value = {
                type: ValueTypes.Quality,
                quality: 123,
                property: "trains"
            }
            assert.throws(function(){
                validator.validateValue(value);
            }, e => e.message == `Quality Property Error: Unknown quality property "trains"`);
        });

        it("No Value Type - Error", function(){
            const value = {
            }
            assert.throws(function(){
                validator.validateValue(value);
            }, e => e.message == `Value Type Error: Unknown value type "undefined"`);
        });

        it("Value Type Too Low - Error", function(){
            const value = {
                type: 0
            }
            assert.throws(function(){
                validator.validateValue(value);
            }, e => e.message == `Value Type Error: Unknown value type "0"`);
        });

        it("Value Type Too High - Error", function(){
            const value = {
                type: 3
            }
            assert.throws(function(){
                validator.validateValue(value);
            }, e => e.message == `Value Type Error: Unknown value type "3"`);
        });

        it("No Arguments - Error", function(){
            assert.throws(function(){
                validator.validateValue();
            }, e => e.message == `Value Error: No value defined.`);
        });
    });

    describe("#validateCondition()", function(){
        let validator;
        beforeEach(function(){
            validator = new QuestsValidator();
        });

        it("Simple Comparison - Valid", function(){
            const condition = {
                type: LogicTypes.Comparison,
                comparison: ComparisonTypes.Equal,
                left: getValidQuality(),
                right: getValidInteger()
            };
            validator.validateCondition(condition);
        });

        it("Comparison No Left - Error", function(){
            const condition = {
                type: LogicTypes.Comparison,
                comparison: ComparisonTypes.Equal,
                right: getValidInteger()
            };
            assert.throws(function(){
                validator.validateCondition(condition);
            }, e => e.message == `Value Error: No value defined.`);
        });

        it("Comparison No Right - Error", function(){
            const condition = {
                type: LogicTypes.Comparison,
                comparison: ComparisonTypes.Equal,
                left: getValidQuality()
            };
            assert.throws(function(){
                validator.validateCondition(condition);
            }, e => e.message == `Value Error: No value defined.`);
        });

        it("Comparison with No Comparison - Error", function(){
            const condition = {
                type: LogicTypes.Comparison,
                left: getValidQuality(),
                right: getValidInteger()
            };
            assert.throws(function(){
                validator.validateCondition(condition);
            }, e => e.message == `Condition Comparison Error: Is not an Integer`);
        });

        it("Comparison with String Comparison - Error", function(){
            const condition = {
                type: LogicTypes.Comparison,
                quality: 123,
                comparison: "1",
                left: getValidQuality(),
                right: getValidInteger()
            };
            assert.throws(function(){
                validator.validateCondition(condition);
            }, e => e.message == `Condition Comparison Error: Is not an Integer`);
        });

        it("Comparison with Low Comparison - Error", function(){
            const condition = {
                type: LogicTypes.Comparison,
                comparison: 0,
                left: getValidQuality(),
                right: getValidInteger()
            };
            assert.throws(function(){
                validator.validateCondition(condition);
            }, e => e.message == `Condition Comparison Error: Invalid value`);
        });

        it("Comparison with High Comparison - Error", function(){
            const condition = {
                type: LogicTypes.Comparison,
                comparison: 7,
                left: getValidQuality(),
                right: getValidInteger()
            };
            assert.throws(function(){
                validator.validateCondition(condition);
            }, e => e.message == `Condition Comparison Error: Invalid value`);
        });

        it("Not with Valid Statement - Valid", function(){
            const condition = {
                type: LogicTypes.Not,
                statement: {
                    type: LogicTypes.Comparison,
                    comparison: ComparisonTypes.Equal,
                    left: getValidQuality(),
                    right: getValidInteger()
                }
            };
            validator.validateCondition(condition);
        });

        it("Not with Empty Statement - Error", function(){
            const condition = {
                type: LogicTypes.Not
            };
            assert.throws(function(){
                validator.validateCondition(condition);
            }, e => e.message == `Condition Error: NOT target undefined.`);
        });

        it("Not with Invalid Statement - Error", function(){
            const condition = {
                type: LogicTypes.Not,
                statement: {
                    type: LogicTypes.Comparison,
                    comparison: ComparisonTypes.Equal,
                    left: getValidQuality()
                }
            };
            assert.throws(function(){
                validator.validateCondition(condition);
            }, e => e.message == `Value Error: No value defined.`);
        });

        it("And with Valid Statements - Valid", function(){
            const condition = {
                type: LogicTypes.And,
                left: getValidCondition(),
                right: getValidCondition()
            };
            validator.validateCondition(condition);
        });

        it("And with No Left Statement - Error", function(){
            const condition = {
                type: LogicTypes.And,
                right: getValidCondition()
            };
            assert.throws(function(){
                validator.validateCondition(condition);
            }, e => e.message == `Condition Error: Left logic statement undefined.`);
        });

        it("And with No Right Statement - Error", function(){
            const condition = {
                type: LogicTypes.And,
                left: getValidCondition()
            };
            assert.throws(function(){
                validator.validateCondition(condition);
            }, e => e.message == `Condition Error: Right logic statement undefined.`);
        });

        it("And with Invalid Left Statement - Error", function(){
            const condition = {
                type: LogicTypes.And,
                left: getInvalidCondition(),
                right: getValidCondition()
            };
            assert.throws(function(){
                validator.validateCondition(condition);
            }, e => e.message == `Value Error: No value defined.`);
        });

        it("And with Invalid Right Statement - Error", function(){
            const condition = {
                type: LogicTypes.And,
                left: getValidCondition(),
                right: getInvalidCondition()
            };
            assert.throws(function(){
                validator.validateCondition(condition);
            }, e => e.message == `Value Error: No value defined.`);
        });

        it("Or with Valid Statements - Valid", function(){
            const condition = {
                type: LogicTypes.Or,
                left: getValidCondition(),
                right: getValidCondition()
            };
            validator.validateCondition(condition);
        });

        it("Or with No Left Statement - Error", function(){
            const condition = {
                type: LogicTypes.Or,
                right: getValidCondition()
            };
            assert.throws(function(){
                validator.validateCondition(condition);
            }, e => e.message == `Condition Error: Left logic statement undefined.`);
        });

        it("Or with No Right Statement - Error", function(){
            const condition = {
                type: LogicTypes.Or,
                left: getValidCondition()
            };
            assert.throws(function(){
                validator.validateCondition(condition);
            }, e => e.message == `Condition Error: Right logic statement undefined.`);
        });

        it("Or with Invalid Left Statement - Error", function(){
            const condition = {
                type: LogicTypes.Or,
                left: getInvalidCondition(),
                right: getValidCondition()
            };
            assert.throws(function(){
                validator.validateCondition(condition);
            }, e => e.message == `Value Error: No value defined.`);
        });

        it("Or with Invalid Right Statement - Error", function(){
            const condition = {
                type: LogicTypes.Or,
                left: getValidCondition(),
                right: getInvalidCondition()
            };
            assert.throws(function(){
                validator.validateCondition(condition);
            }, e => e.message == `Value Error: No value defined.`);
        });

        it("Null Condition - Error", function(){
            assert.throws(function(){
                validator.validateCondition();
            }, e => e.message == `Condition Error: No condition defined`);
        });

        it("No Type - Error", function(){
            const condition = {
            };
            assert.throws(function(){
                validator.validateCondition(condition);
            }, e => e.message == `Condition Type Error: Is not an Integer`);
        });

        it("String Type - Error", function(){
            const condition = {
                type: "1"
            };
            assert.throws(function(){
                validator.validateCondition(condition);
            }, e => e.message == `Condition Type Error: Is not an Integer`);
        });

        it("Low Type - Error", function(){
            const condition = {
                type: 0
            };
            assert.throws(function(){
                validator.validateCondition(condition);
            }, e => e.message == `Condition Error: Unknown condition type "0"`);
        });

        it("High Type - Error", function(){
            const condition = {
                type: 5
            };
            assert.throws(function(){
                validator.validateCondition(condition);
            }, e => e.message == `Condition Error: Unknown condition type "5"`);
        });
    });

    describe("#validateTask()", function(){
        let validator;
        beforeEach(function(){
            validator = new QuestsValidator();
        });

        it("Simple Task - Valid", function(){
            const task = {
                description: "Task Description",
                completed: getValidCondition()
            };
            validator.validateTask(task);
        });

        it("No Description - Error", function(){
            const task = {
                completed: getValidCondition()
            };
            assert.throws(function(){
                validator.validateTask(task);
            }, e => e.message == `Description Error: Undefined`);
        });

        it("Empty Description - Error", function(){
            const task = {
                description: " ",
                completed: getValidCondition()
            };
            assert.throws(function(){
                validator.validateTask(task);
            }, e => e.message == `Description Error: Is Empty`);
        });

        it("Number Description - Error", function(){
            const task = {
                description: 123,
                completed: getValidCondition()
            };
            assert.throws(function(){
                validator.validateTask(task);
            }, e => e.message == `Description Error: Not a string`);
        });

        it("No Completed - Error", function(){
            const task = {
                description: "Task Description",
            };
            assert.throws(function(){
                validator.validateTask(task);
            }, e => e.message == `Completed -> Condition Error: No condition defined`);
        });

        it("Invalid Completed - Error", function(){
            const task = {
                description: "Task Description",
                completed: getInvalidCondition()
            };
            assert.throws(function(){
                validator.validateTask(task);
            }, e => e.message == `Completed -> Value Error: No value defined.`);
        });

        it("Valid Visible - Valid", function(){
            const task = {
                description: "Task Description",
                completed: getValidCondition(),
                visible: getValidCondition()
            };
            validator.validateTask(task);
        });

        it("Invalid Visible - Error", function(){
            const task = {
                description: "Task Description",
                completed: getValidCondition(),
                visible: getInvalidCondition()
            };
            assert.throws(function(){
                validator.validateTask(task);
            }, e => e.message == `Visible -> Value Error: No value defined.`);
        });
    });

    describe("#validateState()", function(){
        let validator;
        beforeEach(function(){
            validator = new QuestsValidator();
        });

        it("Simple Quest State - Valid", function(){
            const state = {
                state: QuestStates.Completed,
                description: "State Description",
                condition: getValidCondition()
            }
            validator.validateState(state);
        });

        it("Quest State with No State - Error", function(){
            const state = {
                description: "State Description",
                condition: getValidCondition()
            }
            assert.throws(function(){
                validator.validateState(state);
            }, e => e.message == `State Error: Is not an Integer`);
        });

        it("Quest State with String State - Error", function(){
            const state = {
                state: "1",
                description: "State Description",
                condition: getValidCondition()
            }
            assert.throws(function(){
                validator.validateState(state);
            }, e => e.message == `State Error: Is not an Integer`);
        });

        it("Quest State with Low State - Error", function(){
            const state = {
                state: 0,
                description: "State Description",
                condition: getValidCondition()
            }
            assert.throws(function(){
                validator.validateState(state);
            }, e => e.message == `State Error: Invalid value`);
        });

        it("Quest State with High State - Error", function(){
            const state = {
                state: 6,
                description: "State Description",
                condition: getValidCondition()
            }
            assert.throws(function(){
                validator.validateState(state);
            }, e => e.message == `State Error: Invalid value`);
        });

        it("Quest State with No Description - Error", function(){
            const state = {
                state: QuestStates.Completed,
                condition: getValidCondition()
            }
            assert.throws(function(){
                validator.validateState(state);
            }, e => e.message == `Description Error: Undefined`);
        });

        it("Quest State with Empty Description - Error", function(){
            const state = {
                state: QuestStates.Completed,
                description: " ",
                condition: getValidCondition()
            }
            assert.throws(function(){
                validator.validateState(state);
            }, e => e.message == `Description Error: Is Empty`);
        });

        it("Quest State with Number Description - Error", function(){
            const state = {
                state: QuestStates.Completed,
                description: 123,
                condition: getValidCondition()
            }
            assert.throws(function(){
                validator.validateState(state);
            }, e => e.message == `Description Error: Not a string`);
        });

        it("Quest State with Invalid Condition - Error", function(){
            const state = {
                state: QuestStates.Completed,
                description: "State Description",
                condition: getInvalidCondition()
            }
            assert.throws(function(){
                validator.validateState(state);
            }, e => e.message == `Condition -> Value Error: No value defined.`);
        });

        it("Quest State with Empty Task Array - Valid", function(){
            const state = {
                state: QuestStates.Completed,
                description: "State Description",
                condition: getValidCondition(),
                tasks: []
            }
            validator.validateState(state);
        });
        
        it("Quest State with Tasks Not Array - Error", function(){
            const state = {
                state: QuestStates.Completed,
                description: "State Description",
                condition: getValidCondition(),
                tasks: getValidTask()
            }
            assert.throws(function(){
                validator.validateState(state);
            }, e => e.message == `Tasks Error: Not an Array`);
        });

        it("Quest State with Valid Task - Valid", function(){
            const state = {
                state: QuestStates.Completed,
                description: "State Description",
                condition: getValidCondition(),
                tasks: [
                    getValidTask()
                ]
            }
            validator.validateState(state);
        });
        
        it("Quest State with Invalid Task - Error", function(){
            const state = {
                state: QuestStates.Completed,
                description: "State Description",
                condition: getValidCondition(),
                tasks: [
                    getInvalidTask()
                ]
            }
            assert.throws(function(){
                validator.validateState(state);
            }, e => e.message == `Task 1 -> Description Error: Undefined`);
        });
    });

    describe("#validateQuest()", function(){
        let validator;
        beforeEach(function(){
            validator = new QuestsValidator();
        });

        it("Simple Quest - Valid", function(){
            const quest = {
                title: "Quest Title",
                id: "quest_id",
                states: [
                    getValidState()
                ]
            }
            validator.validateQuest(quest);
        });

        it("Quest with No Title - Error", function(){
            const quest = {
                id: "quest_id",
                states: [
                    getValidState()
                ]
            }
            assert.throws(function(){
                validator.validateQuest(quest);
            }, e => e.message == `Title Error: Undefined`);
        });

        it("Quest with Empty Title - Error", function(){
            const quest = {
                title: " ",
                id: "quest_id",
                states: [
                    getValidState()
                ]
            }
            assert.throws(function(){
                validator.validateQuest(quest);
            }, e => e.message == `Title Error: Is Empty`);
        });

        it("Quest with Number Title - Error", function(){
            const quest = {
                title: 123,
                id: "quest_id",
                states: [
                    getValidState()
                ]
            }
            assert.throws(function(){
                validator.validateQuest(quest);
            }, e => e.message == `Title Error: Not a string`);
        });

        it("Quest with Without ID - Error", function(){
            const quest = {
                title: "Quest Title",
                states: [
                    getValidState()
                ]
            }
            assert.throws(function(){
                validator.validateQuest(quest);
            }, e => e.message == `ID Error: Undefined`);
        });

        it("Quest with Empty ID - Error", function(){
            const quest = {
                title: "Quest Title",
                id: "",
                states: [
                    getValidState()
                ]
            }
            assert.throws(function(){
                validator.validateQuest(quest);
            }, e => e.message == `ID Error: Undefined`);
        });

        it("Quest with ID Invalid Character - Error", function(){
            const quest = {
                title: "Quest Title",
                id: "quest-id",
                states: [
                    getValidState()
                ]
            }
            assert.throws(function(){
                validator.validateQuest(quest);
            }, e => e.message == `ID Error: IDs must contain only letters, numbers, and underscores and be fewer than 500 characters.`);
        });

        it("Quest with Too Long ID - Error", function(){
            let longId = "";
            for(let i = 0; i < 101; i++){
                longId += "a";
            }

            const quest = {
                title: "Quest Title",
                id: longId,
                states: [
                    getValidState()
                ]
            }
            assert.throws(function(){
                validator.validateQuest(quest);
            }, e => e.message == `ID Error: IDs must contain only letters, numbers, and underscores and be fewer than 500 characters.`);
        });

        it("Quest with No States Property - Error", function(){
            const quest = {
                title: "Quest Title",
                id: "quest_id"
            }
            assert.throws(function(){
                validator.validateQuest(quest);
            }, e => e.message == `States Error: Undefined`);
        });

        it("Quest with Empty States - Error", function(){
            const quest = {
                title: "Quest Title",
                id: "quest_id",
                states: []
            }
            assert.throws(function(){
                validator.validateQuest(quest);
            }, e => e.message == `States Error: Is Empty`);
        });

        it("Quest with Invalid State - Error", function(){
            const quest = {
                title: "Quest Title",
                id: "quest_id",
                states: [
                    getInvalidState()
                ]
            }
            assert.throws(function(){
                validator.validateQuest(quest);
            }, e => e.message == `Quest State 1 -> State Error: Is not an Integer`);
        });
    });

    describe("#validateCategory()", function(){
        let validator;
        beforeEach(function(){
            validator = new QuestsValidator();
        });

        it("Simple Category - Valid", function(){
            let category = {
                id: "cat_1",
                title: "Category Title",
                order: 10,
                quests: [
                    getValidQuest()
                ]
            }
            validator.validateCategory(category);
        });

        it("Category with No ID - Error", function(){
            let category = {
                title: "Category Title",
                order: 10,
                quests: [
                    getValidQuest()
                ]
            }
            assert.throws(function(){
                validator.validateCategory(category);
            }, e => e.message == `ID Error: Undefined`);
        });

        it("Category with Empty ID - Error", function(){
            let category = {
                id: "",
                title: "Category Title",
                order: 10,
                quests: [
                    getValidQuest()
                ]
            }
            assert.throws(function(){
                validator.validateCategory(category);
            }, e => e.message == `ID Error: Undefined`);
        });

        it("Category with ID with Invalid Characters - Error", function(){
            let category = {
                id: " cat_1",
                title: "Category Title",
                order: 10,
                quests: [
                    getValidQuest()
                ]
            }
            assert.throws(function(){
                validator.validateCategory(category);
            }, e => e.message == `ID Error: IDs must contain only letters, numbers, and underscores and be fewer than 500 characters.`);
        });

        it("Category with Long ID - Error", function(){
            let longId = "";
            for(let i = 0; i < 101; i++) {
                longId += "a";
            }
            let category = {
                id: longId,
                title: "Category Title",
                order: 10,
                quests: [
                    getValidQuest()
                ]
            }
            assert.throws(function(){
                validator.validateCategory(category);
            }, e => e.message == `ID Error: IDs must contain only letters, numbers, and underscores and be fewer than 500 characters.`);
        });

        it("Category with No Title - Error", function(){
            let category = {
                id: "cat_1",
                order: 10,
                quests: [
                    getValidQuest()
                ]
            }
            assert.throws(function(){
                validator.validateCategory(category);
            }, e => e.message == `Title Error: Undefined`);
        });

        it("Category with Empty Title - Error", function(){
            let category = {
                id: "cat_1",
                title: " ",
                order: 10,
                quests: [
                    getValidQuest()
                ]
            }
            assert.throws(function(){
                validator.validateCategory(category);
            }, e => e.message == `Title Error: Is Empty`);
        });

        it("Category with Number Title - Error", function(){
            let category = {
                id: "cat_1",
                title: 123,
                order: 10,
                quests: [
                    getValidQuest()
                ]
            }
            assert.throws(function(){
                validator.validateCategory(category);
            }, e => e.message == `Title Error: Not a string`);
        });

        it("Category with No Order - Error", function(){
            let category = {
                id: "cat_1",
                title: "Category Title",
                quests: [
                    getValidQuest()
                ]
            }
            assert.throws(function(){
                validator.validateCategory(category);
            }, e => e.message == `Order Error: Is not an Integer`);
        });

        it("Category with String Order - Error", function(){
            let category = {
                id: "cat_1",
                title: "Category Title",
                order: "10",
                quests: [
                    getValidQuest()
                ]
            }
            assert.throws(function(){
                validator.validateCategory(category);
            }, e => e.message == `Order Error: Is not an Integer`);
        });

        it("Category with No Quests Array - Error", function(){
            let category = {
                id: "cat_1",
                title: "Category Title",
                order: 10
            }
            assert.throws(function(){
                validator.validateCategory(category);
            }, e => e.message == `Quest List Error: Undefined`);
        });

        it("Category with Empty Quests Array - Error", function(){
            let category = {
                id: "cat_1",
                title: "Category Title",
                order: 10,
                quests: []
            }
            assert.throws(function(){
                validator.validateCategory(category);
            }, e => e.message == `Quest List Error: Is Empty`);
        });

        it("Category with Invalid Quest - Error", function(){
            let category = {
                id: "cat_1",
                title: "Category Title",
                order: 10,
                quests: [
                    getInvalidQuest()
                ]
            }
            assert.throws(function(){
                validator.validateCategory(category);
            }, e => e.message == `Quest 1 -> Title Error: Undefined`);
        });

        it("Category with Duplicate Quest IDs - Error", function(){
            let category = {
                id: "cat_1",
                title: "Category Title",
                order: 10,
                quests: [
                    getValidQuest(),
                    getValidQuest()
                ]
            }
            assert.throws(function(){
                validator.validateCategory(category);
            }, e => e.message == `Quest ID Not Unique: quest_id`);
        });
    });

    describe("#validate()", function(){
        let validator;
        beforeEach(function(){
            validator = new QuestsValidator();
        });

        it("Undefined Parameters - Error", function(){
            assert.throws(function(){
                validator.validate();
            }, e => e.message == `Quests JSON was undefined`);
        });

        it("Simple Quests - Valid", function(){
            const quests = {
                version: "1.0",
                categories: [
                    getValidCategory()
                ]
            };
            validator.validate(quests);
        });

        it("Quests without Version - Error", function(){
            const quests = {
                categories: [
                    getValidCategory()
                ]
            };
            assert.throws(function(){
                validator.validate(quests);
            }, e => e.message == `Version Property Error: Undefined`);
        });

        it("Quests without Version but Ignored - Valid", function(){
            const quests = {
                categories: [
                    getValidCategory()
                ]
            };
            validator.validate(quests, true);
        });

        it("Quests with Number Version - Error", function(){
            const quests = {
                version: 1,
                categories: [
                    getValidCategory()
                ]
            };
            assert.throws(function(){
                validator.validate(quests);
            }, e => e.message == `Version Property Error: Not a string`);
        });

        it("Quests with No Category Array - Error", function(){
            const quests = {
                version: "1.0"
            };
            assert.throws(function(){
                validator.validate(quests);
            }, e => e.message == `Category List Error: Undefined`);
        });

        it("Quests with Empty Category Array - Error", function(){
            const quests = {
                version: "1.0",
                categories: []
            };
            assert.throws(function(){
                validator.validate(quests);
            }, e => e.message == `Category List Error: Is Empty`);
        });

        it("Quests with Invalid Category - Error", function(){
            const quests = {
                version: "1.0",
                categories: [
                    getInvalidCategory()
                ]
            };
            assert.throws(function(){
                validator.validate(quests);
            }, e => e.message == `Category 1 -> ID Error: Undefined`);
        });

         it("Quests with Duplicate Category IDs - Error", function(){
            const quests = {
                version: "1.0",
                categories: [
                    getValidCategory(),
                    getValidCategory(),
                ]
            };
            quests.categories[0].id = "dup_id",
            quests.categories[1].id = "dup_id"
            assert.throws(function(){
                validator.validate(quests);
            }, e => e.message == `Category ID Not Unique: dup_id`);
        });
    });
});