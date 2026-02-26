import assert from "node:assert";
import { ConditionReader } from "../../quests/helpers/conditions/condition-reader.js";

describe("ConditionReader", function() {
    describe("#next()", function() {
        it("Empty String - False", async function(){
            const reader = new ConditionReader("");
            assert(!reader.next());
        });

        it("Whitespace String - False", async function(){
            const reader = new ConditionReader(" \r\n ");
            assert(!reader.next());
        });
        
        it(`"a" - Single Read`, async function(){
            const reader = new ConditionReader("a");
            assert.equal(reader.next(), "a");
            assert.equal(reader.lastIndex, 0);
            assert.equal(reader.index, 1);
            assert(!reader.next());
        });

        it(`"ab" - Single Read`, async function(){
            const reader = new ConditionReader("ab");
            assert.equal(reader.next(), "ab");
            assert.equal(reader.lastIndex, 0);
            assert.equal(reader.index, 2);
            assert(!reader.next());
        });

        it(`"12" - Single Read`, async function(){
            const reader = new ConditionReader("12");
            assert.equal(reader.next(), "12");
            assert.equal(reader.lastIndex, 0);
            assert.equal(reader.index, 2);
            assert(!reader.next());
        });

        it(`"12" - Single Read`, async function(){
            const reader = new ConditionReader("12");
            assert.equal(reader.next(), "12");
            assert.equal(reader.lastIndex, 0);
            assert.equal(reader.index, 2);
            assert(!reader.next());
        });

        it(`"a1a" - Three Reads`, async function(){
            const reader = new ConditionReader("a1a");
            assert.equal(reader.next(), "a");
            assert.equal(reader.lastIndex, 0);
            assert.equal(reader.index, 1);
            assert.equal(reader.next(), "1");
            assert.equal(reader.lastIndex, 1);
            assert.equal(reader.index, 2);
            assert.equal(reader.next(), "a");
            assert.equal(reader.lastIndex, 2);
            assert.equal(reader.index, 3);
            assert(!reader.next());
        });

        it(`" a 1 a " - Three Reads`, async function(){
            const reader = new ConditionReader(" a 1 a ");
            assert.equal(reader.next(), "a");
            assert.equal(reader.lastIndex, 1);
            assert.equal(reader.index, 2);
            assert.equal(reader.next(), "1");
            assert.equal(reader.lastIndex, 3);
            assert.equal(reader.index, 4);
            assert.equal(reader.next(), "a");
            assert.equal(reader.lastIndex, 5);
            assert.equal(reader.index, 6);
            assert(!reader.next());
        });

        it(`"!a" - Two Reads`, async function(){
            const reader = new ConditionReader("!a");
            assert.equal(reader.next(), "!");
            assert.equal(reader.next(), "a");
            assert(!reader.next());
        });

        it(`"!(a)" - Four Reads`, async function(){
            const reader = new ConditionReader("!(a)");
            assert.equal(reader.next(), "!");
            assert.equal(reader.next(), "(");
            assert.equal(reader.next(), "a");
            assert.equal(reader.next(), ")");
            assert(!reader.next());
        });

        it(`"!()" - Three Reads`, async function(){
            const reader = new ConditionReader("!()");
            assert.equal(reader.next(), "!");
            assert.equal(reader.next(), "(");
            assert.equal(reader.next(), ")");
            assert(!reader.next());
        });

        it(`"a.b" - Three Reads`, async function(){
            const reader = new ConditionReader("a.b");
            assert.equal(reader.next(), "a");
            assert.equal(reader.next(), ".");
            assert.equal(reader.next(), "b");
            assert(!reader.next());
        });

        it(`"a&b" - Three Reads`, async function(){
            const reader = new ConditionReader("a&b");
            assert.equal(reader.next(), "a");
            assert.equal(reader.next(), "&");
            assert.equal(reader.next(), "b");
            assert(!reader.next());
        });

        it(`"a&&b" - Three Reads`, async function(){
            const reader = new ConditionReader("a&&b");
            assert.equal(reader.next(), "a");
            assert.equal(reader.next(), "&&");
            assert.equal(reader.next(), "b");
            assert(!reader.next());
        });

        it(`"a|b" - Three Reads`, async function(){
            const reader = new ConditionReader("a|b");
            assert.equal(reader.next(), "a");
            assert.equal(reader.next(), "|");
            assert.equal(reader.next(), "b");
            assert(!reader.next());
        });

        it(`"a||b" - Three Reads`, async function(){
            const reader = new ConditionReader("a||b");
            assert.equal(reader.next(), "a");
            assert.equal(reader.next(), "||");
            assert.equal(reader.next(), "b");
            assert(!reader.next());
        });

        it(`"a=1" - Three Reads`, async function(){
            const reader = new ConditionReader("a=1");
            assert.equal(reader.next(), "a");
            assert.equal(reader.next(), "=");
            assert.equal(reader.next(), "1");
            assert(!reader.next());
        });

        it(`"a==1" - Three Reads`, async function(){
            const reader = new ConditionReader("a==1");
            assert.equal(reader.next(), "a");
            assert.equal(reader.next(), "==");
            assert.equal(reader.next(), "1");
            assert(!reader.next());
        });

        it(`"a==1" - Three Reads`, async function(){
            const reader = new ConditionReader("a==1");
            assert.equal(reader.next(), "a");
            assert.equal(reader.next(), "==");
            assert.equal(reader.next(), "1");
            assert(!reader.next());
        });

        it(`"a>1" - Three Reads`, async function(){
            const reader = new ConditionReader("a>1");
            assert.equal(reader.next(), "a");
            assert.equal(reader.next(), ">");
            assert.equal(reader.next(), "1");
            assert(!reader.next());
        });

        it(`"a>=1" - Three Reads`, async function(){
            const reader = new ConditionReader("a>=1");
            assert.equal(reader.next(), "a");
            assert.equal(reader.next(), ">=");
            assert.equal(reader.next(), "1");
            assert(!reader.next());
        });

        it(`"a<1" - Three Reads`, async function(){
            const reader = new ConditionReader("a<1");
            assert.equal(reader.next(), "a");
            assert.equal(reader.next(), "<");
            assert.equal(reader.next(), "1");
            assert(!reader.next());
        });

        it(`"a<=1" - Three Reads`, async function(){
            const reader = new ConditionReader("a<=1");
            assert.equal(reader.next(), "a");
            assert.equal(reader.next(), "<=");
            assert.equal(reader.next(), "1");
            assert(!reader.next());
        });

        it(`"((a&&b==5)||c.level=32)" - Fifteen Reads`, async function(){
            const reader = new ConditionReader("((a&&b==5)||c.level=32)");
            assert.equal(reader.next(), "(");
            assert.equal(reader.next(), "(");
            assert.equal(reader.next(), "a");
            assert.equal(reader.next(), "&&");
            assert.equal(reader.next(), "b");
            assert.equal(reader.next(), "==");
            assert.equal(reader.next(), "5");
            assert.equal(reader.next(), ")");
            assert.equal(reader.next(), "||");
            assert.equal(reader.next(), "c");
            assert.equal(reader.next(), ".");
            assert.equal(reader.next(), "level");
            assert.equal(reader.next(), "=");
            assert.equal(reader.next(), "32");
            assert.equal(reader.next(), ")");
            assert(!reader.next());
        });

        it(`"@#*[]{}<>" - Nine Reads`, async function(){
            const reader = new ConditionReader("@#*[]{};,");
            assert.equal(reader.next(), "@");
            assert.equal(reader.next(), "#");
            assert.equal(reader.next(), "*");
            assert.equal(reader.next(), "[");
            assert.equal(reader.next(), "]");
            assert.equal(reader.next(), "{");
            assert.equal(reader.next(), "}");
            assert.equal(reader.next(), ";");
            assert.equal(reader.next(), ",");
            assert(!reader.next());
        });
    });

    describe("#nextThrowIfEnd()", function() {
        it('"a" - Throws after one', async function(){
            const reader = new ConditionReader("a");
            assert.equal(reader.nextThrowIfEnd(), "a");
            assert.equal(reader.lastIndex, 0);
            assert.equal(reader.index, 1);
            assert.throws(function(){
                reader.nextThrowIfEnd();
            });
        })
    });
});


        
        
        
        

        

        

        