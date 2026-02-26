import { QuestsRenderer } from "../../src/quests/quests-renderer.js";
import { QuestStates, LogicTypes, ComparisonTypes, ValueTypes } from "../../src/datatypes.js";
import assert from "node:assert";

describe("QuestsRenderer", function(){
    function makeSpoofedRenderer() {
        const renderer = new QuestsRenderer();
        renderer.qualities = {
            getValue: function(key) {
                return renderer.qualities[key];
            }
        }
        return renderer;
    }

    function getValidComparison() {
        return {
            type: LogicTypes.Comparison,
            comparison: ComparisonTypes.Equal,
            left: {
                type: ValueTypes.Quality,
                quality: 1
            },
            right: {
                type: ValueTypes.Integer,
                value: 123
            }
        };
    }

    describe("#evaluateComparison()", function(){
        let renderer;
        this.beforeEach(function(){
            renderer = makeSpoofedRenderer();
        });

        it("Equal True - Returns True", function() {
            renderer.qualities[1] = 123;
            const condition = {
                comparison: ComparisonTypes.Equal,
                left: {
                    type: ValueTypes.Quality,
                    quality: 1
                },
                right: {
                    type: ValueTypes.Integer,
                    value: 123
                }
            };
            assert.equal(renderer.evaluateComparison(condition), true);
        });

        it("Equal False - Returns False", function() {
            renderer.qualities[1] = 123;
            const condition = {
                comparison: ComparisonTypes.Equal,
                left: {
                    type: ValueTypes.Quality,
                    quality: 1
                },
                right: {
                    type: ValueTypes.Integer,
                    value: 321
                }
            };
            assert.equal(renderer.evaluateComparison(condition), false);
        });

        it("NotEqual True - Returns True", function() {
            renderer.qualities[1] = 123;
            const condition = {
                comparison: ComparisonTypes.NotEqual,
                left: {
                    type: ValueTypes.Quality,
                    quality: 1
                },
                right: {
                    type: ValueTypes.Integer,
                    value: 321
                }
            };
            assert.equal(renderer.evaluateComparison(condition), true);
        });

        it("NotEqual False - Returns False", function() {
            renderer.qualities[1] = 123;
            const condition = {
                comparison: ComparisonTypes.NotEqual,
                left: {
                    type: ValueTypes.Quality,
                    quality: 1
                },
                right: {
                    type: ValueTypes.Integer,
                    value: 123
                }
            };
            assert.equal(renderer.evaluateComparison(condition), false);
        });

        it("Greater True - Returns True", function() {
            renderer.qualities[1] = 10;
            const condition = {
                comparison: ComparisonTypes.Greater,
                left: {
                    type: ValueTypes.Quality,
                    quality: 1
                },
                right: {
                    type: ValueTypes.Integer,
                    value: 7
                }
            };
            assert.equal(renderer.evaluateComparison(condition), true);
        });

        it("Greater False - Returns False", function() {
            renderer.qualities[1] = 10;
            const condition = {
                comparison: ComparisonTypes.Greater,
                left: {
                    type: ValueTypes.Quality,
                    quality: 1
                },
                right: {
                    type: ValueTypes.Integer,
                    value: 10
                }
            };
            assert.equal(renderer.evaluateComparison(condition), false);
        });

        it("GreaterEqual True - Returns True", function() {
            renderer.qualities[1] = 10;
            const condition = {
                comparison: ComparisonTypes.GreaterEqual,
                left: {
                    type: ValueTypes.Quality,
                    quality: 1
                },
                right: {
                    type: ValueTypes.Integer,
                    value: 10
                }
            };
            assert.equal(renderer.evaluateComparison(condition), true);
        });

        it("GreaterEqual False - Returns False", function() {
            renderer.qualities[1] = 10;
            const condition = {
                comparison: ComparisonTypes.GreaterEqual,
                left: {
                    type: ValueTypes.Quality,
                    quality: 1
                },
                right: {
                    type: ValueTypes.Integer,
                    value: 11
                }
            };
            assert.equal(renderer.evaluateComparison(condition), false);
        });
        
        it("Less True - Returns True", function() {
            renderer.qualities[1] = 10;
            const condition = {
                comparison: ComparisonTypes.Less,
                left: {
                    type: ValueTypes.Quality,
                    quality: 1
                },
                right: {
                    type: ValueTypes.Integer,
                    value: 77
                }
            };
            assert.equal(renderer.evaluateComparison(condition), true);
        });

        it("Less False - Returns False", function() {
            renderer.qualities[1] = 10;
            const condition = {
                comparison: ComparisonTypes.Less,
                left: {
                    type: ValueTypes.Quality,
                    quality: 1
                },
                right: {
                    type: ValueTypes.Integer,
                    value: 10
                }
            };
            assert.equal(renderer.evaluateComparison(condition), false);
        });

        it("Less True - Returns True", function() {
            renderer.qualities[1] = 10;
            const condition = {
                comparison: ComparisonTypes.Less,
                left: {
                    type: ValueTypes.Quality,
                    quality: 1
                },
                right: {
                    type: ValueTypes.Integer,
                    value: 77
                }
            };
            assert.equal(renderer.evaluateComparison(condition), true);
        });

        it("Less False - Returns False", function() {
            renderer.qualities[1] = 10;
            const condition = {
                comparison: ComparisonTypes.Less,
                left: {
                    type: ValueTypes.Quality,
                    quality: 1
                },
                right: {
                    type: ValueTypes.Integer,
                    value: 10
                }
            };
            assert.equal(renderer.evaluateComparison(condition), false);
        });

        it("LessEqual True - Returns True", function() {
            renderer.qualities[1] = 10;
            const condition = {
                comparison: ComparisonTypes.LessEqual,
                left: {
                    type: ValueTypes.Quality,
                    quality: 1
                },
                right: {
                    type: ValueTypes.Integer,
                    value: 10
                }
            };
            assert.equal(renderer.evaluateComparison(condition), true);
        });

        it("LessEqual False - Returns False", function() {
            renderer.qualities[1] = 10;
            const condition = {
                comparison: ComparisonTypes.LessEqual,
                left: {
                    type: ValueTypes.Quality,
                    quality: 1
                },
                right: {
                    type: ValueTypes.Integer,
                    value: 0
                }
            };
            assert.equal(renderer.evaluateComparison(condition), false);
        });

        it("No Left - Error", function() {
            renderer.qualities[1] = 10;
            const condition = {
                comparison: ComparisonTypes.LessEqual,
                right: {
                    type: ValueTypes.Integer,
                    value: 1
                }
            };
            assert.throws(function(){
                renderer.evaluateComparison(condition);
            }, e => e.message == `Value Undefined`);
        });

        it("No Right - Error", function() {
            renderer.qualities[1] = 10;
            const condition = {
                comparison: ComparisonTypes.LessEqual,
                left: {
                    type: ValueTypes.Quality,
                    quality: 1
                }
            };
            assert.throws(function(){
                renderer.evaluateComparison(condition);
            }, e => e.message == `Value Undefined`);
        });

        it("Invalid Comparison - Error", function() {
            renderer.qualities[1] = 10;
            const condition = {
                comparison: 7,
                left: {
                    type: ValueTypes.Quality,
                    quality: 1
                },
                right: {
                    type: ValueTypes.Integer,
                    value: 1
                }
            };
            assert.throws(function(){
                renderer.evaluateComparison(condition);
            }, e => e.message == `Unknown comparison type: 7`);
        });

        it("Undefined Comparison - Error", function() {
            assert.throws(function(){
                renderer.evaluateComparison();
            }, e => e.message == `Comparison Undefined`);
        });
    });

    describe("#evaluateCondition()", function(){
        let renderer;
        this.beforeEach(function(){
            renderer = makeSpoofedRenderer();
        });

        it("AND both True - True", function() {
            renderer.qualities[1] = 10;
            let condition = {
                type: LogicTypes.And,
                left: {
                    type: LogicTypes.Comparison,
                    comparison: ComparisonTypes.Equal,
                    left: {
                        type: ValueTypes.Quality,
                        quality: 1
                    },
                    right: {
                        type: ValueTypes.Integer,
                        value: 10
                    }
                },
                right: {
                    type: LogicTypes.Comparison,
                    comparison: ComparisonTypes.Equal,
                    left: {
                        type: ValueTypes.Quality,
                        quality: 1
                    },
                    right: {
                        type: ValueTypes.Integer,
                        value: 10
                    }
                }
            }
            assert.equal(renderer.evaluateCondition(condition), true);
        });

        it("AND left False - False", function() {
            renderer.qualities[1] = 10;
            let condition = {
                type: LogicTypes.And,
                left: {
                    type: LogicTypes.Comparison,
                    comparison: ComparisonTypes.Equal,
                    left: {
                        type: ValueTypes.Quality,
                        quality: 1
                    },
                    right: {
                        type: ValueTypes.Integer,
                        value: 1
                    }
                },
                right: {
                    type: LogicTypes.Comparison,
                    comparison: ComparisonTypes.Equal,
                    left: {
                        type: ValueTypes.Quality,
                        quality: 1
                    },
                    right: {
                        type: ValueTypes.Integer,
                        value: 10
                    }
                }
            }
            assert.equal(renderer.evaluateCondition(condition), false);
        });

        it("AND right False - False", function() {
            renderer.qualities[1] = 10;
            let condition = {
                type: LogicTypes.And,
                left: {
                    type: LogicTypes.Comparison,
                    comparison: ComparisonTypes.Equal,
                    left: {
                        type: ValueTypes.Quality,
                        quality: 1
                    },
                    right: {
                        type: ValueTypes.Integer,
                        value: 10
                    }
                },
                right: {
                    type: LogicTypes.Comparison,
                    comparison: ComparisonTypes.Equal,
                    left: {
                        type: ValueTypes.Quality,
                        quality: 1
                    },
                    right: {
                        type: ValueTypes.Integer,
                        value: 1
                    }
                }
            }
            assert.equal(renderer.evaluateCondition(condition), false);
        });

        it("AND both False - False", function() {
            renderer.qualities[1] = 10;
            let condition = {
                type: LogicTypes.And,
                left: {
                    type: LogicTypes.Comparison,
                    comparison: ComparisonTypes.Equal,
                    left: {
                        type: ValueTypes.Quality,
                        quality: 1
                    },
                    right: {
                        type: ValueTypes.Integer,
                        value: 1
                    }
                },
                right: {
                    type: LogicTypes.Comparison,
                    comparison: ComparisonTypes.Equal,
                    left: {
                        type: ValueTypes.Quality,
                        quality: 1
                    },
                    right: {
                        type: ValueTypes.Integer,
                        value: 1
                    }
                }
            }
            assert.equal(renderer.evaluateCondition(condition), false);
        });

        it("OR both True - True", function() {
            renderer.qualities[1] = 10;
            let condition = {
                type: LogicTypes.Or,
                left: {
                    type: LogicTypes.Comparison,
                    comparison: ComparisonTypes.Equal,
                    left: {
                        type: ValueTypes.Quality,
                        quality: 1
                    },
                    right: {
                        type: ValueTypes.Integer,
                        value: 10
                    }
                },
                right: {
                    type: LogicTypes.Comparison,
                    comparison: ComparisonTypes.Equal,
                    left: {
                        type: ValueTypes.Quality,
                        quality: 1
                    },
                    right: {
                        type: ValueTypes.Integer,
                        value: 10
                    }
                }
            }
            assert.equal(renderer.evaluateCondition(condition), true);
        });

        it("OR left False - True", function() {
            renderer.qualities[1] = 10;
            let condition = {
                type: LogicTypes.Or,
                left: {
                    type: LogicTypes.Comparison,
                    comparison: ComparisonTypes.Equal,
                    left: {
                        type: ValueTypes.Quality,
                        quality: 1
                    },
                    right: {
                        type: ValueTypes.Integer,
                        value: 1
                    }
                },
                right: {
                    type: LogicTypes.Comparison,
                    comparison: ComparisonTypes.Equal,
                    left: {
                        type: ValueTypes.Quality,
                        quality: 1
                    },
                    right: {
                        type: ValueTypes.Integer,
                        value: 10
                    }
                }
            }
            assert.equal(renderer.evaluateCondition(condition), true);
        });

        it("OR right False - True", function() {
            renderer.qualities[1] = 10;
            let condition = {
                type: LogicTypes.Or,
                left: {
                    type: LogicTypes.Comparison,
                    comparison: ComparisonTypes.Equal,
                    left: {
                        type: ValueTypes.Quality,
                        quality: 1
                    },
                    right: {
                        type: ValueTypes.Integer,
                        value: 10
                    }
                },
                right: {
                    type: LogicTypes.Comparison,
                    comparison: ComparisonTypes.Equal,
                    left: {
                        type: ValueTypes.Quality,
                        quality: 1
                    },
                    right: {
                        type: ValueTypes.Integer,
                        value: 1
                    }
                }
            }
            assert.equal(renderer.evaluateCondition(condition), true);
        });

        it("OR both False - False", function() {
            renderer.qualities[1] = 10;
            let condition = {
                type: LogicTypes.Or,
                left: {
                    type: LogicTypes.Comparison,
                    comparison: ComparisonTypes.Equal,
                    left: {
                        type: ValueTypes.Quality,
                        quality: 1
                    },
                    right: {
                        type: ValueTypes.Integer,
                        value: 1
                    }
                },
                right: {
                    type: LogicTypes.Comparison,
                    comparison: ComparisonTypes.Equal,
                    left: {
                        type: ValueTypes.Quality,
                        quality: 1
                    },
                    right: {
                        type: ValueTypes.Integer,
                        value: 1
                    }
                }
            }
            assert.equal(renderer.evaluateCondition(condition), false);
        });

        it("NOT on True - False", function(){
            renderer.qualities[1] = 10;
            let condition = {
                type: LogicTypes.Not,
                statement: {
                    type: LogicTypes.Comparison,
                    comparison: ComparisonTypes.Equal,
                    left: {
                        type: ValueTypes.Quality,
                        quality: 1
                    },
                    right: {
                        type: ValueTypes.Integer,
                        value: 10
                    }
                }
            }
            assert.equal(renderer.evaluateCondition(condition), false);
        });

        it("NOT on False - True", function(){
            renderer.qualities[1] = 10;
            let condition = {
                type: LogicTypes.Not,
                statement: {
                    type: LogicTypes.Comparison,
                    comparison: ComparisonTypes.Equal,
                    left: {
                        type: ValueTypes.Quality,
                        quality: 1
                    },
                    right: {
                        type: ValueTypes.Integer,
                        value: 1
                    }
                }
            }
            assert.equal(renderer.evaluateCondition(condition), true);
        });

        it("True Condition - True", function(){
            renderer.qualities[1] = 10;
            let condition = {
                type: LogicTypes.Comparison,
                comparison: ComparisonTypes.Equal,
                left: {
                    type: ValueTypes.Quality,
                    quality: 1
                },
                right: {
                    type: ValueTypes.Integer,
                    value: 10
                }
            }
            assert.equal(renderer.evaluateCondition(condition), true);
        });

        it("False Condition - False", function(){
            renderer.qualities[1] = 10;
            let condition = {
                type: LogicTypes.Comparison,
                comparison: ComparisonTypes.Equal,
                left: {
                    type: ValueTypes.Quality,
                    quality: 1
                },
                right: {
                    type: ValueTypes.Integer,
                    value: 1
                }
            }
            assert.equal(renderer.evaluateCondition(condition), false);
        });

        it("AND no Left - Error", function(){
            let condition = {
                type: LogicTypes.And,
                right: getValidComparison()
            }
            assert.throws(function(){
                renderer.evaluateCondition(condition);
            }, e => e.message == `AND left condition undefined.`)
        });

        it("AND no Right - Error", function(){
            let condition = {
                type: LogicTypes.And,
                left: getValidComparison()
            }
            assert.throws(function(){
                renderer.evaluateCondition(condition);
            }, e => e.message == `AND right condition undefined.`)
        });

        it("OR no Left - Error", function(){
            let condition = {
                type: LogicTypes.Or,
                right: getValidComparison()
            }
            assert.throws(function(){
                renderer.evaluateCondition(condition);
            }, e => e.message == `OR left condition undefined.`)
        });

        it("OR no Right - Error", function(){
            let condition = {
                type: LogicTypes.Or,
                left: getValidComparison()
            }
            assert.throws(function(){
                renderer.evaluateCondition(condition);
            }, e => e.message == `OR right condition undefined.`)
        });

        it("NOT no Statement - Error", function(){
            let condition = {
                type: LogicTypes.Not
            }
            assert.throws(function(){
                renderer.evaluateCondition(condition);
            }, e => e.message == `NOT statement undefined.`)
        });

        it("No type - Error", function(){
            let condition = {
            }
            assert.throws(function(){
                renderer.evaluateCondition(condition);
            }, e => e.message == `Unknown condition type: undefined`)
        });

        it("Invalid type - Error", function(){
            let condition = {
                type: 5
            }
            assert.throws(function(){
                renderer.evaluateCondition(condition);
            }, e => e.message == `Unknown condition type: 5`)
        });

        it("No Parameters - Error", function(){
            assert.throws(function(){
                renderer.evaluateCondition();
            }, e => e.message == `Condition Undefined`)
        });
    });

    describe("#renderQuest()", function(){
        let renderer;
        this.beforeEach(function(){
            renderer = makeSpoofedRenderer();
        });

        it("No Parameters - Falsy Response", function(){
            assert(!renderer.renderQuest());
        });

        it("No States Property - Falsy Response", function(){
            const quest = {
                title: "Quest Title"
            };
            assert(!renderer.renderQuest(quest));
        });

        it("Empty States Array - Falsy Response", function(){
            const quest = {
                title: "Quest Title",
                states: []
            };
            assert(!renderer.renderQuest(quest));
        });

        it("Matching State - Simple Result", function(){
            renderer.qualities[1] = 10;
            const quest = {
                title: "Quest Title",
                id: "quest",
                states: [
                    {
                        state: QuestStates.Completed,
                        description: "State Description",
                        condition: {
                            type: LogicTypes.Comparison,
                            comparison: ComparisonTypes.Equal,
                            left: {
                                type: ValueTypes.Quality,
                                quality: 1
                            },
                            right: {
                                type: ValueTypes.Integer,
                                value: 10
                            }
                        }
                    }
                ]
            };
            const result = renderer.renderQuest(quest);
            assert.equal(result.title, "Quest Title");
            assert.equal(result.id, "quest");
            assert.equal(result.state, QuestStates.Completed);
            assert.equal(result.details, "State Description");
            assert.equal(result.subtasks.length, 0);
        });

        it("No Title - Undefined Title", function(){
            renderer.qualities[1] = 10;
            const quest = {
                id: "quest",
                states: [
                    {
                        state: QuestStates.Completed,
                        description: "State Description",
                        condition: {
                            type: LogicTypes.Comparison,
                            comparison: ComparisonTypes.Equal,
                            left: {
                                type: ValueTypes.Quality,
                                quality: 1
                            },
                            right: {
                                type: ValueTypes.Integer,
                                value: 10
                            }
                        }
                    }
                ]
            };
            const result = renderer.renderQuest(quest);
            assert.equal(result.title, undefined);
            assert.equal(result.id, "quest");
            assert.equal(result.state, QuestStates.Completed);
            assert.equal(result.details, "State Description");
            assert.equal(result.subtasks.length, 0);
        });

        it("No ID - Undefined ID", function(){
            renderer.qualities[1] = 10;
            const quest = {
                title: "Quest Title",
                states: [
                    {
                        state: QuestStates.Completed,
                        description: "State Description",
                        condition: {
                            type: LogicTypes.Comparison,
                            comparison: ComparisonTypes.Equal,
                            left: {
                                type: ValueTypes.Quality,
                                quality: 1
                            },
                            right: {
                                type: ValueTypes.Integer,
                                value: 10
                            }
                        }
                    }
                ]
            };
            const result = renderer.renderQuest(quest);
            assert.equal(result.title, "Quest Title");
            assert.equal(result.id, undefined);
            assert.equal(result.state, QuestStates.Completed);
            assert.equal(result.details, "State Description");
            assert.equal(result.subtasks.length, 0);
        });

        it("No Matching State - Falsy Result", function(){
            renderer.qualities[1] = 10;
            const quest = {
                title: "Quest Title",
                id: "quest",
                states: [
                    {
                        state: QuestStates.Completed,
                        description: "State Description",
                        condition: {
                            type: LogicTypes.Comparison,
                            comparison: ComparisonTypes.Equal,
                            left: {
                                type: ValueTypes.Quality,
                                quality: 1
                            },
                            right: {
                                type: ValueTypes.Integer,
                                value: 1
                            }
                        }
                    }
                ]
            };
            assert(!renderer.renderQuest(quest));
        });

        it("Multiple Matching States - Last One Selected", function(){
            renderer.qualities[1] = 10;
            const quest = {
                title: "Quest Title",
                id: "quest",
                states: [
                    {
                        state: QuestStates.InProgress,
                        description: "State 1",
                        condition: {
                            type: LogicTypes.Comparison,
                            comparison: ComparisonTypes.Equal,
                            left: {
                                type: ValueTypes.Quality,
                                quality: 1
                            },
                            right: {
                                type: ValueTypes.Integer,
                                value: 10
                            }
                        }
                    },
                    {
                        state: QuestStates.Completed,
                        description: "State 2",
                        condition: {
                            type: LogicTypes.Comparison,
                            comparison: ComparisonTypes.Equal,
                            left: {
                                type: ValueTypes.Quality,
                                quality: 1
                            },
                            right: {
                                type: ValueTypes.Integer,
                                value: 10
                            }
                        }
                    }
                ]
            };
            const result = renderer.renderQuest(quest);
            assert.equal(result.title, "Quest Title");
            assert.equal(result.id, "quest");
            assert.equal(result.state, QuestStates.Completed);
            assert.equal(result.details, "State 2");
            assert.equal(result.subtasks.length, 0);
        });

        it("Task Without Completed - Error", function(){
            renderer.qualities[1] = 10;
            const quest = {
                title: "Quest Title",
                id: "quest",
                states: [
                    {
                        state: QuestStates.InProgress,
                        description: "State 1",
                        condition: {
                            type: LogicTypes.Comparison,
                            comparison: ComparisonTypes.Equal,
                            left: {
                                type: ValueTypes.Quality,
                                quality: 1
                            },
                            right: {
                                type: ValueTypes.Integer,
                                value: 10
                            }
                        },
                        tasks: [
                            {
                                description: "Task 1"
                            }
                        ]
                    }
                ]
            };
            assert.throws(function(){
                renderer.renderQuest(quest);
            }, e => e.message == "Task does not include a completed condition.");
        });

        it("Incomplete Task - Error", function(){
            renderer.qualities[1] = 10;
            const quest = {
                title: "Quest Title",
                id: "quest",
                states: [
                    {
                        state: QuestStates.InProgress,
                        description: "State 1",
                        condition: {
                            type: LogicTypes.Comparison,
                            comparison: ComparisonTypes.Equal,
                            left: {
                                type: ValueTypes.Quality,
                                quality: 1
                            },
                            right: {
                                type: ValueTypes.Integer,
                                value: 10
                            }
                        },
                        tasks: [
                            {
                                description: "Task 1",
                                completed: {
                                    type: LogicTypes.Comparison,
                                    comparison: ComparisonTypes.Equal,
                                    left: {
                                        type: ValueTypes.Quality,
                                        quality: 1
                                    },
                                    right: {
                                        type: ValueTypes.Integer,
                                        value: 1
                                    }
                                }
                            }
                        ]
                    }
                ]
            };
            const result = renderer.renderQuest(quest);
            assert.equal(result.title, "Quest Title");
            assert.equal(result.id, "quest");
            assert.equal(result.state, QuestStates.InProgress);
            assert.equal(result.details, "State 1");
            assert.equal(result.subtasks.length, 1);
            assert.equal(result.subtasks[0].description, "Task 1")
            assert.equal(result.subtasks[0].completed, false);
        });

        it("Completed Task - Error", function(){
            renderer.qualities[1] = 10;
            const quest = {
                title: "Quest Title",
                id: "quest",
                states: [
                    {
                        state: QuestStates.InProgress,
                        description: "State 1",
                        condition: {
                            type: LogicTypes.Comparison,
                            comparison: ComparisonTypes.Equal,
                            left: {
                                type: ValueTypes.Quality,
                                quality: 1
                            },
                            right: {
                                type: ValueTypes.Integer,
                                value: 10
                            }
                        },
                        tasks: [
                            {
                                description: "Task 1",
                                completed: {
                                    type: LogicTypes.Comparison,
                                    comparison: ComparisonTypes.Equal,
                                    left: {
                                        type: ValueTypes.Quality,
                                        quality: 1
                                    },
                                    right: {
                                        type: ValueTypes.Integer,
                                        value: 10
                                    }
                                }
                            }
                        ]
                    }
                ]
            };
            const result = renderer.renderQuest(quest);
            assert.equal(result.title, "Quest Title");
            assert.equal(result.id, "quest");
            assert.equal(result.state, QuestStates.InProgress);
            assert.equal(result.details, "State 1");
            assert.equal(result.subtasks.length, 1);
            assert.equal(result.subtasks[0].description, "Task 1")
            assert.equal(result.subtasks[0].completed, true);
        });

        it("Visible Task - Error", function(){
            renderer.qualities[1] = 10;
            const quest = {
                title: "Quest Title",
                id: "quest",
                states: [
                    {
                        state: QuestStates.InProgress,
                        description: "State 1",
                        condition: {
                            type: LogicTypes.Comparison,
                            comparison: ComparisonTypes.Equal,
                            left: {
                                type: ValueTypes.Quality,
                                quality: 1
                            },
                            right: {
                                type: ValueTypes.Integer,
                                value: 10
                            }
                        },
                        tasks: [
                            {
                                description: "Task 1",
                                completed: {
                                    type: LogicTypes.Comparison,
                                    comparison: ComparisonTypes.Equal,
                                    left: {
                                        type: ValueTypes.Quality,
                                        quality: 1
                                    },
                                    right: {
                                        type: ValueTypes.Integer,
                                        value: 10
                                    }
                                },
                                visible: {
                                    type: LogicTypes.Comparison,
                                    comparison: ComparisonTypes.Equal,
                                    left: {
                                        type: ValueTypes.Quality,
                                        quality: 1
                                    },
                                    right: {
                                        type: ValueTypes.Integer,
                                        value: 10
                                    }
                                }
                            }
                        ]
                    }
                ]
            };
            const result = renderer.renderQuest(quest);
            assert.equal(result.title, "Quest Title");
            assert.equal(result.id, "quest");
            assert.equal(result.state, QuestStates.InProgress);
            assert.equal(result.details, "State 1");
            assert.equal(result.subtasks.length, 1);
            assert.equal(result.subtasks[0].description, "Task 1")
            assert.equal(result.subtasks[0].completed, true);
        });

        it("Invisible Task - Error", function(){
            renderer.qualities[1] = 10;
            const quest = {
                title: "Quest Title",
                id: "quest",
                states: [
                    {
                        state: QuestStates.InProgress,
                        description: "State 1",
                        condition: {
                            type: LogicTypes.Comparison,
                            comparison: ComparisonTypes.Equal,
                            left: {
                                type: ValueTypes.Quality,
                                quality: 1
                            },
                            right: {
                                type: ValueTypes.Integer,
                                value: 10
                            }
                        },
                        tasks: [
                            {
                                description: "Task 1",
                                completed: {
                                    type: LogicTypes.Comparison,
                                    comparison: ComparisonTypes.Equal,
                                    left: {
                                        type: ValueTypes.Quality,
                                        quality: 1
                                    },
                                    right: {
                                        type: ValueTypes.Integer,
                                        value: 10
                                    }
                                },
                                visible: {
                                    type: LogicTypes.Comparison,
                                    comparison: ComparisonTypes.NotEqual,
                                    left: {
                                        type: ValueTypes.Quality,
                                        quality: 1
                                    },
                                    right: {
                                        type: ValueTypes.Integer,
                                        value: 10
                                    }
                                }
                            }
                        ]
                    }
                ]
            };
            const result = renderer.renderQuest(quest);
            assert.equal(result.title, "Quest Title");
            assert.equal(result.id, "quest");
            assert.equal(result.state, QuestStates.InProgress);
            assert.equal(result.details, "State 1");
            assert.equal(result.subtasks.length, 0);
        });

        it("Percentage Task - Calculated", function(){
            renderer.qualities[1] = 10;
            const quest = {
                title: "Quest Title",
                id: "quest",
                states: [
                    {
                        state: QuestStates.InProgress,
                        description: "State 1",
                        condition: {
                            type: LogicTypes.Comparison,
                            comparison: ComparisonTypes.Equal,
                            left: {
                                type: ValueTypes.Quality,
                                quality: 1
                            },
                            right: {
                                type: ValueTypes.Integer,
                                value: 10
                            }
                        },
                        tasks: [
                            {
                                description: "Task 1",
                                percentage: {
                                    value: {
                                        type: ValueTypes.Quality,
                                        quality: 1
                                    },
                                    outOf: {
                                        type: ValueTypes.Integer,
                                        value: 20
                                    }
                                }
                            }
                        ]
                    }
                ]
            };
            const result = renderer.renderQuest(quest);
            assert.equal(result.title, "Quest Title");
            assert.equal(result.id, "quest");
            assert.equal(result.state, QuestStates.InProgress);
            assert.equal(result.details, "State 1");
            assert.equal(result.subtasks.length, 1);
            assert.equal(result.subtasks[0].percentage, 0.5);
        });
    });

    describe("#sortQuests()", function(){
        let renderer;
        this.beforeEach(function(){
            renderer = makeSpoofedRenderer();
        });

        it("No Parameters - No Error", function(){
            assert.doesNotThrow(function(){
                renderer.sortQuests();
            });
        });

        it("Sort States - Sorted", function(){
            const quests = [
                {
                    state: QuestStates.Completed,
                    title: "quest"
                },
                {
                    state: QuestStates.HiddenStatus,
                    title: "quest"
                },
                {
                    state: QuestStates.NotStart,
                    title: "quest"
                },
                {
                    state: QuestStates.InProgress,
                    title: "quest"
                },
                {
                    state: QuestStates.Blocked,
                    title: "quest"
                }
            ];
            renderer.sortQuests(quests);
            assert.equal(quests[0].state, QuestStates.InProgress);
            assert.equal(quests[1].state, QuestStates.Blocked);
            assert.equal(quests[2].state, QuestStates.NotStart);
            assert.equal(quests[3].state, QuestStates.HiddenStatus);
            assert.equal(quests[4].state, QuestStates.Completed);
        });

        it("Sort Titles - Sorted", function(){
            const quests = [
                {
                    state: QuestStates.Completed,
                    title: "b"
                },
                {
                    state: QuestStates.Completed,
                    title: "c"
                },
                {
                    state: QuestStates.Completed,
                    title: "a"
                }
            ];
            renderer.sortQuests(quests);
            assert.equal(quests[0].title, "a");
            assert.equal(quests[1].title, "b");
            assert.equal(quests[2].title, "c");
        });

        it("Sort Both States & Order - State Prioritized", function(){
            const quests = [
                {
                    state: QuestStates.Completed,
                    title: "b"
                },
                {
                    state: QuestStates.InProgress,
                    title: "c"
                },
                {
                    state: QuestStates.Completed,
                    title: "a"
                }
            ];
            renderer.sortQuests(quests);
            assert.equal(quests[0].state, QuestStates.InProgress)
            assert.equal(quests[0].title, "c");
            assert.equal(quests[1].state, QuestStates.Completed)
            assert.equal(quests[1].title, "a");
            assert.equal(quests[2].state, QuestStates.Completed)
            assert.equal(quests[2].title, "b");
        });
    });

    describe("#renderQuests()", function(){
        let renderer;
        this.beforeEach(function(){
            renderer = makeSpoofedRenderer();
        });

        it("No Parameters - Empty Result", function(){
            const result = renderer.renderQuests();
            assert.equal(result.length, 0);
        });

        it("No Categories Parameter - Empty Result", function(){
            const result = renderer.renderQuests({
            });
            assert.equal(result.length, 0);
        });

        it("Empty Categories Not Array - Empty Result", function(){
            const result = renderer.renderQuests({
                categories: "Test"
            });
            assert.equal(result.length, 0);
        });

        it("Category with No Quests Property - Empty Result", function(){
            const quests = {
                categories: [
                    {
                        id: "cat1",
                        title: "Category 1"
                    }
                ]
            };
            const result = renderer.renderQuests(quests);
            assert.equal(result.length, 0);
        });

        it("Category with Empty Quests - Empty Result", function(){
            const quests = {
                categories: [
                    {
                        id: "cat1",
                        title: "Category 1",
                        quests: []
                    }
                ]
            };
            const result = renderer.renderQuests(quests);
            assert.equal(result.length, 0);
        });

        it("Category with Quest without Matching State - Empty Result", function(){
            renderer.qualities[1] = 10;
            const quests = {
                categories: [
                    {
                        id: "cat1",
                        title: "Category 1",
                        quests: [
                            {
                                title: "Quest 1",
                                states: [
                                    {
                                        state: QuestStates.InProgress,
                                        description: "State 1",
                                        condition: {
                                            type: LogicTypes.Comparison,
                                            comparison: ComparisonTypes.Equal,
                                            left: {
                                                type: ValueTypes.Quality,
                                                quality: 1
                                            },
                                            right: {
                                                type: ValueTypes.Integer,
                                                value: 1
                                            }
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };
            const result = renderer.renderQuests(quests);
            assert.equal(result.length, 0);
        });

        it("Category with Quest with Matching State - Category Rendered", function(){
            renderer.qualities[1] = 10;
            const quests = {
                categories: [
                    {
                        id: "cat1",
                        title: "Category 1",
                        order: 10,
                        quests: [
                            {
                                title: "Quest 1",
                                states: [
                                    {
                                        state: QuestStates.InProgress,
                                        description: "State 1",
                                        condition: {
                                            type: LogicTypes.Comparison,
                                            comparison: ComparisonTypes.Equal,
                                            left: {
                                                type: ValueTypes.Quality,
                                                quality: 1
                                            },
                                            right: {
                                                type: ValueTypes.Integer,
                                                value: 10
                                            }
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };
            const result = renderer.renderQuests(quests);
            assert.equal(result.length, 1);
            assert.equal(result[0].id, "cat1");
            assert.equal(result[0].title, "Category 1");
            assert.equal(result[0].order, 10);
            assert.equal(result[0].quests.length, 1);
            assert.equal(result[0].quests[0].title, "Quest 1");
            assert.equal(result[0].quests[0].state, QuestStates.InProgress);
            assert.equal(result[0].quests[0].details, "State 1");
        });

        it("Category with Multiple Quests - Quests Sorted", function(){
            renderer.qualities[1] = 10;
            const quests = {
                categories: [
                    {
                        id: "cat1",
                        title: "Category 1",
                        order: 10,
                        quests: [
                            {
                                title: "Quest 1",
                                states: [
                                    {
                                        state: QuestStates.Completed,
                                        description: "State 1",
                                        condition: {
                                            type: LogicTypes.Comparison,
                                            comparison: ComparisonTypes.Equal,
                                            left: {
                                                type: ValueTypes.Quality,
                                                quality: 1
                                            },
                                            right: {
                                                type: ValueTypes.Integer,
                                                value: 10
                                            }
                                        }
                                    }
                                ]
                            },
                            {
                                title: "Quest 2",
                                states: [
                                    {
                                        state: QuestStates.InProgress,
                                        description: "State 1",
                                        condition: {
                                            type: LogicTypes.Comparison,
                                            comparison: ComparisonTypes.Equal,
                                            left: {
                                                type: ValueTypes.Quality,
                                                quality: 1
                                            },
                                            right: {
                                                type: ValueTypes.Integer,
                                                value: 10
                                            }
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };
            const result = renderer.renderQuests(quests);
            assert.equal(result.length, 1);
            assert.equal(result[0].id, "cat1");
            assert.equal(result[0].title, "Category 1");
            assert.equal(result[0].order, 10);
            assert.equal(result[0].quests.length, 2);
            assert.equal(result[0].quests[0].title, "Quest 2");
            assert.equal(result[0].quests[1].title, "Quest 1");
        });
    });
});