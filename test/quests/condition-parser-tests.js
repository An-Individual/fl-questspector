import { ConditionParser } from "../../quests/helpers/conditions/condition-parser.js";
import { LogicTypes, ComparisonTypes, ValueTypes } from "../../src/datatypes.js";
import assert from "node:assert";

describe("ConditionParser", function(){
    describe("parse()", function(){
        let parser;
        beforeEach(function() {
            parser = new ConditionParser();
        });
        
        it(`Empty String - False Result`, function(){
            assert(!parser.parse(""));
        });

        it(`"a" - Basic Existence Check`, function(){
            const condition = parser.parse("a", {
                a: 1
            });
            assert.equal(condition.type, LogicTypes.Comparison);
            assert.equal(condition.left.type, ValueTypes.Quality);
            assert.equal(condition.left.quality, 1);
            assert(!condition.left.property);
            assert.equal(condition.comparison, ComparisonTypes.Greater);
            assert.equal(condition.right.type, ValueTypes.Integer);
            assert.equal(condition.right.value, 0);
        });

        it(`"a=2" - Comparison Parsed`, function(){
            const condition = parser.parse("a=2", {
                a: 1
            });
            assert.equal(condition.type, LogicTypes.Comparison);
            assert.equal(condition.left.type, ValueTypes.Quality);
            assert.equal(condition.left.quality, 1);
            assert(!condition.left.property);
            assert.equal(condition.comparison, ComparisonTypes.Equal);
            assert.equal(condition.right.type, ValueTypes.Integer);
            assert.equal(condition.right.value, 2);
        });

        it(`"a!=2" - Comparison Parsed`, function(){
            const condition = parser.parse("a!=2", {
                a: 1
            });
            assert.equal(condition.type, LogicTypes.Comparison);
            assert.equal(condition.left.type, ValueTypes.Quality);
            assert.equal(condition.left.quality, 1);
            assert(!condition.left.property);
            assert.equal(condition.comparison, ComparisonTypes.NotEqual);
            assert.equal(condition.right.type, ValueTypes.Integer);
            assert.equal(condition.right.value, 2);
        });

        it(`"a>2" - Comparison Parsed`, function(){
            const condition = parser.parse("a>2", {
                a: 1
            });
            assert.equal(condition.type, LogicTypes.Comparison);
            assert.equal(condition.left.type, ValueTypes.Quality);
            assert.equal(condition.left.quality, 1);
            assert(!condition.left.property);
            assert.equal(condition.comparison, ComparisonTypes.Greater);
            assert.equal(condition.right.type, ValueTypes.Integer);
            assert.equal(condition.right.value, 2);
        });

        it(`"a>=2" - Comparison Parsed`, function(){
            const condition = parser.parse("a>=2", {
                a: 1
            });
            assert.equal(condition.type, LogicTypes.Comparison);
            assert.equal(condition.left.type, ValueTypes.Quality);
            assert.equal(condition.left.quality, 1);
            assert(!condition.left.property);
            assert.equal(condition.comparison, ComparisonTypes.GreaterEqual);
            assert.equal(condition.right.type, ValueTypes.Integer);
            assert.equal(condition.right.value, 2);
        });

        it(`"a<2" - Comparison Parsed`, function(){
            const condition = parser.parse("a<2", {
                a: 1
            });
            assert.equal(condition.type, LogicTypes.Comparison);
            assert.equal(condition.left.type, ValueTypes.Quality);
            assert.equal(condition.left.quality, 1);
            assert(!condition.left.property);
            assert.equal(condition.comparison, ComparisonTypes.Less);
            assert.equal(condition.right.type, ValueTypes.Integer);
            assert.equal(condition.right.value, 2);
        });

        it(`"a<=2" - Comparison Parsed`, function(){
            const condition = parser.parse("a<=2", {
                a: 1
            });
            assert.equal(condition.type, LogicTypes.Comparison);
            assert.equal(condition.left.type, ValueTypes.Quality);
            assert.equal(condition.left.quality, 1);
            assert(!condition.left.property);
            assert.equal(condition.comparison, ComparisonTypes.LessEqual);
            assert.equal(condition.right.type, ValueTypes.Integer);
            assert.equal(condition.right.value, 2);
        });

        it(`"a?2" - Error`, function(){
            assert.throws(function(){
                const condition = parser.parse("a?2", {
                    a: 1
                });
            }, e => e.message == "Condition error at position 1: Unexpected element '?'");
        });

        it(`"a?2" - Error`, function(){
            assert.throws(function(){
                const condition = parser.parse("a?2", {
                    a: 1
                });
            }, e => e.message == "Condition error at position 1: Unexpected element '?'");
        });

        it(`"a=b" - Qualities compared`, function(){
            const condition = parser.parse("a = b", {
                a: 1,
                b: 2
            });
            assert.equal(condition.type, LogicTypes.Comparison);
            assert.equal(condition.left.type, ValueTypes.Quality);
            assert.equal(condition.left.quality, 1);
            assert(!condition.left.property);
            assert.equal(condition.comparison, ComparisonTypes.Equal);
            assert.equal(condition.right.type, ValueTypes.Quality);
            assert.equal(condition.right.quality, 2);
            assert(!condition.right.property);
        });

        it(`"a.level=b.cap" - Qualities compared`, function(){
            const condition = parser.parse("a.level = b.cap", {
                a: 1,
                b: 2
            });
            assert.equal(condition.type, LogicTypes.Comparison);
            assert.equal(condition.left.type, ValueTypes.Quality);
            assert.equal(condition.left.quality, 1);
            assert.equal(condition.left.property, "level");
            assert.equal(condition.comparison, ComparisonTypes.Equal);
            assert.equal(condition.right.type, ValueTypes.Quality);
            assert.equal(condition.right.quality, 2);
            assert.equal(condition.right.property, "cap");
        });

        it(`"a=b" with b Unmapped - Error`, function(){
            assert.throws(function(){
                const condition = parser.parse("a=b", {
                    a: 1
                });
            }, e => e.message == "Condition error at position 2: No mapping for 'b'");
        });

        it(`"(a)" - Same as Unbracketed`, function(){
            const condition = parser.parse("(a)", {
                a: 1
            });
            assert.equal(condition.type, LogicTypes.Comparison);
            assert.equal(condition.left.type, ValueTypes.Quality);
            assert.equal(condition.left.quality, 1);
            assert(!condition.left.property);
            assert.equal(condition.comparison, ComparisonTypes.Greater);
            assert.equal(condition.right.type, ValueTypes.Integer);
            assert.equal(condition.right.value, 0);
        });

        it(`"(((a)))" - Same as Unbracketed`, function(){
            const condition = parser.parse("(((a)))", {
                a: 1
            });
            assert.equal(condition.type, LogicTypes.Comparison);
            assert.equal(condition.left.type, ValueTypes.Quality);
            assert.equal(condition.left.quality, 1);
            assert(!condition.left.property);
            assert.equal(condition.comparison, ComparisonTypes.Greater);
            assert.equal(condition.right.type, ValueTypes.Integer);
            assert.equal(condition.right.value, 0);
        });

        it(`"(((a))" - Error`, function(){
            assert.throws(function(){
                const condition = parser.parse("(((a))", {
                    a: 1
                });
            }, e => e.message == "Condition error at position 0: Bracket not closed.");
        });

        it(`"((a)))" - Error`, function(){
            assert.throws(function(){
                const condition = parser.parse("((a)))", {
                    a: 1
                });
            }, e => e.message == "Condition error at position 5: Unexpected element ')'");
        });

        it(`"a&b" - Basic And`, function(){
            const condition = parser.parse("a&b", {
                a: 1,
                b: 2
            });
            assert.equal(condition.type, LogicTypes.And);
            assert.equal(condition.left.type, LogicTypes.Comparison);
            assert.equal(condition.left.left.quality, 1);
            assert.equal(condition.left.comparison, ComparisonTypes.Greater);
            assert.equal(condition.left.right.value, 0);
            assert.equal(condition.right.type, LogicTypes.Comparison);
            assert.equal(condition.right.left.quality, 2);
            assert.equal(condition.right.comparison, ComparisonTypes.Greater);
            assert.equal(condition.right.right.value, 0);
        });

        it(`"a&&b" - Basic And`, function(){
            const condition = parser.parse("a&&b", {
                a: 1,
                b: 2
            });
            assert.equal(condition.type, LogicTypes.And);
            assert.equal(condition.left.type, LogicTypes.Comparison);
            assert.equal(condition.left.left.quality, 1);
            assert.equal(condition.left.comparison, ComparisonTypes.Greater);
            assert.equal(condition.left.right.value, 0);
            assert.equal(condition.right.type, LogicTypes.Comparison);
            assert.equal(condition.right.left.quality, 2);
            assert.equal(condition.right.comparison, ComparisonTypes.Greater);
            assert.equal(condition.right.right.value, 0);
        });

        it(`"a&&&b" - error`, function(){
            assert.throws(function(){
                const condition = parser.parse("a&&&b", {
                    a: 1,
                    b: 2
                });
            }, e => e.message == "Condition error at position 1: Unexpected element '&&&'");
        });

        it(`"a|b" - Basic And`, function(){
            const condition = parser.parse("a|b", {
                a: 1,
                b: 2
            });
            assert.equal(condition.type, LogicTypes.Or);
            assert.equal(condition.left.type, LogicTypes.Comparison);
            assert.equal(condition.left.left.quality, 1);
            assert.equal(condition.left.comparison, ComparisonTypes.Greater);
            assert.equal(condition.left.right.value, 0);
            assert.equal(condition.right.type, LogicTypes.Comparison);
            assert.equal(condition.right.left.quality, 2);
            assert.equal(condition.right.comparison, ComparisonTypes.Greater);
            assert.equal(condition.right.right.value, 0);
        });

        it(`"a||b" - Basic And`, function(){
            const condition = parser.parse("a||b", {
                a: 1,
                b: 2
            });
            assert.equal(condition.type, LogicTypes.Or);
            assert.equal(condition.left.type, LogicTypes.Comparison);
            assert.equal(condition.left.left.quality, 1);
            assert.equal(condition.left.comparison, ComparisonTypes.Greater);
            assert.equal(condition.left.right.value, 0);
            assert.equal(condition.right.type, LogicTypes.Comparison);
            assert.equal(condition.right.left.quality, 2);
            assert.equal(condition.right.comparison, ComparisonTypes.Greater);
            assert.equal(condition.right.right.value, 0);
        });

        it(`"a|||b" - Error`, function(){
            assert.throws(function(){
                const condition = parser.parse("a|||b", {
                    a: 1,
                    b: 2
                });
            }, e => e.message == "Condition error at position 1: Unexpected element '|||'");
        });

        it(`"a.level" - Condition With Property`, function(){
            const condition = parser.parse("a.level", {
                a: 1
            });
            assert.equal(condition.type, LogicTypes.Comparison);
            assert.equal(condition.left.type, ValueTypes.Quality);
            assert.equal(condition.left.quality, 1);
            assert.equal(condition.left.property, "level");
            assert.equal(condition.comparison, ComparisonTypes.Greater);
            assert.equal(condition.right.type, ValueTypes.Integer);
            assert.equal(condition.right.value, 0);
        });

        it(`"a.effectiveLevel" - Condition With Property`, function(){
            const condition = parser.parse("a.effectiveLevel", {
                a: 1
            });
            assert.equal(condition.type, LogicTypes.Comparison);
            assert.equal(condition.left.type, ValueTypes.Quality);
            assert.equal(condition.left.quality, 1);
            assert.equal(condition.left.property, "effectiveLevel");
            assert.equal(condition.comparison, ComparisonTypes.Greater);
            assert.equal(condition.right.type, ValueTypes.Integer);
            assert.equal(condition.right.value, 0);
        });

        it(`"a.baseLevel" - Condition With Property`, function(){
            const condition = parser.parse("a.baseLevel", {
                a: 1
            });
            assert.equal(condition.type, LogicTypes.Comparison);
            assert.equal(condition.left.type, ValueTypes.Quality);
            assert.equal(condition.left.quality, 1);
            assert.equal(condition.left.property, "baseLevel");
            assert.equal(condition.comparison, ComparisonTypes.Greater);
            assert.equal(condition.right.type, ValueTypes.Integer);
            assert.equal(condition.right.value, 0);
        });

        it(`"a.cap" - Condition With Property`, function(){
            const condition = parser.parse("a.cap", {
                a: 1
            });
            assert.equal(condition.type, LogicTypes.Comparison);
            assert.equal(condition.left.type, ValueTypes.Quality);
            assert.equal(condition.left.quality, 1);
            assert.equal(condition.left.property, "cap");
            assert.equal(condition.comparison, ComparisonTypes.Greater);
            assert.equal(condition.right.type, ValueTypes.Integer);
            assert.equal(condition.right.value, 0);
        });

        it(`"a.Level" - Error`, function(){
            assert.throws(function(){
                const condition = parser.parse("a.Level", {
                    a: 1
                });
            }, e => e.message == "Condition error at position 2: Unknown quality property 'Level'");
        });

        it(`"a.2" - Condition With Property`, function(){
            assert.throws(function(){
                const condition = parser.parse("a.2", {
                    a: 1
                });
            }, e => e.message == "Condition error at position 2: Invalid quality property '2'");
        });

        it(`"a.level == 2" - Condition With Property`, function(){
            const condition = parser.parse("a.level == 2", {
                a: 1
            });
            assert.equal(condition.type, LogicTypes.Comparison);
            assert.equal(condition.left.type, ValueTypes.Quality);
            assert.equal(condition.left.quality, 1);
            assert.equal(condition.left.property, "level");
            assert.equal(condition.comparison, ComparisonTypes.Equal);
            assert.equal(condition.right.type, ValueTypes.Integer);
            assert.equal(condition.right.value, 2);
        });

        it(`"!a" - Not`, function(){
            const condition = parser.parse("!a", {
                a: 1
            });

            assert.equal(condition.type, LogicTypes.Not);
            assert.equal(condition.statement.type, LogicTypes.Comparison);
            assert.equal(condition.statement.left.quality, 1);
            assert.equal(condition.statement.comparison, ComparisonTypes.Greater);
            assert.equal(condition.statement.right.value, 0);
            assert(!condition.statement.property);
        });

        it(`"!a=2" - Not`, function(){
            const condition = parser.parse("!a=2", {
                a: 1
            });

            assert.equal(condition.type, LogicTypes.Not);
            assert.equal(condition.statement.type, LogicTypes.Comparison);
            assert.equal(condition.statement.left.quality, 1);
            assert.equal(condition.statement.comparison, ComparisonTypes.Equal);
            assert.equal(condition.statement.right.value, 2);
            assert(!condition.statement.property);
        });

        it(`"!(a=2)" - Not`, function(){
            const condition = parser.parse("!(a=2)", {
                a: 1
            });

            assert.equal(condition.type, LogicTypes.Not);
            assert.equal(condition.statement.type, LogicTypes.Comparison);
            assert.equal(condition.statement.left.quality, 1);
            assert.equal(condition.statement.comparison, ComparisonTypes.Equal);
            assert.equal(condition.statement.right.value, 2);
            assert(!condition.statement.property);
        });

        it(`"!a && b" - Not`, function(){
            const condition = parser.parse("!a && b", {
                a: 1,
                b: 2
            });

            assert.equal(condition.type, LogicTypes.And);
            assert.equal(condition.left.type, LogicTypes.Not);
            assert.equal(condition.left.statement.type, LogicTypes.Comparison);
            assert.equal(condition.left.statement.left.quality, 1);
            assert.equal(condition.left.statement.comparison, ComparisonTypes.Greater);
            assert.equal(condition.left.statement.right.value, 0);
            assert(!condition.left.statement.property);
            assert.equal(condition.right.type, LogicTypes.Comparison);
            assert.equal(condition.right.left.quality, 2);
            assert.equal(condition.right.comparison, ComparisonTypes.Greater);
            assert.equal(condition.right.right.value, 0);
            assert(!condition.right.property);
        });

        it(`"!(a && b)" - Not`, function(){
            const condition = parser.parse("!(a && b)", {
                a: 1,
                b: 2
            });

            assert.equal(condition.type, LogicTypes.Not);
            assert.equal(condition.statement.type, LogicTypes.And);
            assert.equal(condition.statement.left.type, LogicTypes.Comparison);
            assert.equal(condition.statement.left.left.quality, 1);
            assert.equal(condition.statement.left.comparison, ComparisonTypes.Greater);
            assert.equal(condition.statement.left.right.value, 0);
            assert(!condition.statement.left.property);
            assert.equal(condition.statement.right.type, LogicTypes.Comparison);
            assert.equal(condition.statement.right.left.quality, 2);
            assert.equal(condition.statement.right.comparison, ComparisonTypes.Greater);
            assert.equal(condition.statement.right.right.value, 0);
            assert(!condition.statement.right.property);
        });

        it(`"!" - Error`, function(){
            assert.throws(function(){
                const condition = parser.parse("!", {
                    a: 1
                });
            }, e => e.message == "Unexpected end of condition");
        });

        it(`"(!)" - Error`, function(){
            assert.throws(function(){
                const condition = parser.parse("(!)", {
                    a: 1
                });
            }, e => e.message == "Condition error at position 2: No statement following a NOT.");
        });

        it(`Unmapped Quality - Error`, function(){
            assert.throws(function(){
                const condition = parser.parse("a", {
                    b: 1
                });
            }, e => e.message == "Condition error at position 0: No mapping for 'a'");
        });
    });
});