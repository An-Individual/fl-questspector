import { LogicTypes, ComparisonTypes, QuestSortPriority, ValueTypes } from "./quests-datatypes.js";

export class QuestsRenderer {
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