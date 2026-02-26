import { LogicTypes, AllowedQualityProperties, ValueTypes } from "../datatypes.js";

export class QuestsValidationError extends Error{
    constructor(property, message) {
        super(`${property}: ${message}`);
    }

    addElemStack(name) {
        this.message = `${name} -> ${this.message}`;
    }
}

export class QuestsValidator {
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