import { CSVReader } from "../../src/csv/csv-reader.js";
import { QualitiesStore } from "../../src/qualities/qualities-store.js";
import assert from "node:assert";

describe("QualityStore", function(){
    describe("#getInteger()", function(){
        it("No Params - Undefined", function(){
            assert.equal(QualitiesStore.getInteger(), undefined);
        });

        it("Empty String - Undefined", function(){
            assert.equal(QualitiesStore.getInteger(""), undefined);
        });

        it("Empty String w/ White Space - Undefined", function(){
            assert.equal(QualitiesStore.getInteger(" "), undefined);
        });

        it("Letters - Undefined", function(){
            assert.equal(QualitiesStore.getInteger("abc"), undefined);
        });

        it("Numbers - Integer", function(){
            assert.equal(QualitiesStore.getInteger("123"), 123);
        });

         it("Zero - Integer", function(){
            assert.equal(QualitiesStore.getInteger("0"), 0);
        });

        it("Numbers w/ Outer Whites Space - Integer", function(){
            assert.equal(QualitiesStore.getInteger(" 123 "), 123);
        });

        it("Numbers w/ Inner Whites Space - Undefined", function(){
            assert.equal(QualitiesStore.getInteger("1 23"), undefined);
        });

        it("Float - Undefined", function(){
            assert.equal(QualitiesStore.getInteger("1.0"), undefined);
        });
    });

    describe("#readHeaderRow()", function(){
        it("Empty Reader - Error", function(){
            const reader = new CSVReader("");
            assert.throws(() =>{
                QualitiesStore.readHeaderRow(reader);
            }, e => e.message == `CSV is empty.`);
        });

        it("Important Headers - Parsed", function(){
            const reader = new CSVReader("id,level,effectiveLevel,cap");
            const map = QualitiesStore.readHeaderRow(reader);
            assert.equal(map.id, 0);
            assert.equal(map.level, 1);
            assert.equal(map.effectivelevel, 2);
            assert.equal(map.cap, 3);
        });

        it("Headers Caps & Whitespace - Parsed", function(){
            const reader = new CSVReader(" ID  ,  LEVEL , EFFECTIVELEVEL ,  CAP  ");
            const map = QualitiesStore.readHeaderRow(reader);
            assert.equal(map.id, 0);
            assert.equal(map.level, 1);
            assert.equal(map.effectivelevel, 2);
            assert.equal(map.cap, 3);
        });

        it("Empty Header - Ignored", function(){
            const reader = new CSVReader(",id,level,effectiveLevel,cap");
            const map = QualitiesStore.readHeaderRow(reader);
            assert.equal(map.id, 1);
            assert.equal(map.level, 2);
            assert.equal(map.effectivelevel, 3);
            assert.equal(map.cap, 4);
        });

        it("Extra Headers - Ignored", function(){
            const reader = new CSVReader("beans,id,level,plain,effectiveLevel,cap,soup");
            const map = QualitiesStore.readHeaderRow(reader);
            assert.equal(map.id, 1);
            assert.equal(map.level, 2);
            assert.equal(map.effectivelevel, 4);
            assert.equal(map.cap, 5);
        });

        it("Out of Order - Parsed", function(){
            const reader = new CSVReader("effectiveLevel,id,cap,level");
            const map = QualitiesStore.readHeaderRow(reader);
            assert.equal(map.id, 1);
            assert.equal(map.level, 3);
            assert.equal(map.effectivelevel, 0);
            assert.equal(map.cap, 2);
        });

        it("No ID Column - Error", function(){
            const reader = new CSVReader("level,effectiveLevel,cap");
            assert.throws(() =>{
                QualitiesStore.readHeaderRow(reader);
            }, e => e.message == `CSV does not include a "id" column.`);
        });

        it("No Level Column - Error", function(){
            const reader = new CSVReader("id,effectiveLevel,cap");
            assert.throws(() =>{
                QualitiesStore.readHeaderRow(reader);
            }, e => e.message == `CSV does not include a "level" column.`);
        });

        it("No Effective Level Column - Error", function(){
            const reader = new CSVReader("id,level,cap");
            assert.throws(() =>{
                QualitiesStore.readHeaderRow(reader);
            }, e => e.message == `CSV does not include a "effectivelevel" column.`);
        });

        it("No Cap Column - Error", function(){
            const reader = new CSVReader("id,level,effectiveLevel");
            assert.throws(() =>{
                QualitiesStore.readHeaderRow(reader);
            }, e => e.message == `CSV does not include a "cap" column.`);
        });
    });

    describe("#fromCSV()", function(){
        it("No Parameters - Error", function(){
            assert.throws(() =>{
                QualitiesStore.fromCSV();
            }, e => e.message == `CSV is empty.`);
        });

        if("Headers Only - Empty Store") {
            const csvString = `
            id,level,effectiveLevel,cap
            `;
            const store = QualitiesStore.fromCSV(csvString.trim());
            assert.equal(Object.keys(store.qualities).length, 0);
        }

        if("One Quality - One Stored") {
            const csvString = `
            id,level,effectiveLevel,cap
            1,2,3,4
            `;
            const store = QualitiesStore.fromCSV(csvString.trim());
            assert.equal(store.qualities[1].id, 1);
            assert.equal(store.qualities[1].level, 2);
            assert.equal(store.qualities[1].effectiveLevel, 3);
            assert.equal(store.qualities[1].cap, 4);
        }

        if("Two Quality - Two Stored") {
            const csvString = `
            id,level,effectiveLevel,cap
            1,2,3,4
            5,6,7,8
            `;
            const store = QualitiesStore.fromCSV(csvString.trim());
            assert.equal(store.qualities[1].id, 1);
            assert.equal(store.qualities[1].level, 2);
            assert.equal(store.qualities[1].effectiveLevel, 3);
            assert.equal(store.qualities[1].cap, 4);
            assert.equal(store.qualities[5].id, 5);
            assert.equal(store.qualities[5].level, 6);
            assert.equal(store.qualities[5].effectiveLevel, 7);
            assert.equal(store.qualities[5].cap, 8);
        }

        if("Out of Order - Stored Correctly") {
            const csvString = `
            level,cap,id,effectiveLevel
            1,2,3,4
            `;
            const store = QualitiesStore.fromCSV(csvString.trim());
            assert.equal(store.qualities[3].id, 3);
            assert.equal(store.qualities[3].level, 1);
            assert.equal(store.qualities[3].effectiveLevel, 4);
            assert.equal(store.qualities[3].cap, 2);
        }

        if("No Cap - No Cap Stored") {
            const csvString = `
            id,level,effectiveLevel,cap
            1,2,3,
            `;
            const store = QualitiesStore.fromCSV(csvString.trim());
            assert.equal(store.qualities[1].id, 1);
            assert.equal(store.qualities[1].level, 2);
            assert.equal(store.qualities[1].effectiveLevel, 3);
            assert(!Object.hasOwn(store.qualities[1], "cap"));
        }

        if("Cap Not Number - Error") {
            const csvString = `
            id,level,effectiveLevel,cap
            1,2,3,abc
            `;
            assert.throws(() =>{
                QualitiesStore.fromCSV(csvString.trim());
            }, e => e.message == `Error at cell D2: Is not a valid integer.`);
        }

        if("ID Empty - Error") {
            const csvString = `
            id,level,effectiveLevel,cap
            ,2,3,4
            `;
            assert.throws(() =>{
                QualitiesStore.fromCSV(csvString.trim());
            }, e => e.message == `Error at cell A2: Is not a valid integer.`);
        }

        if("ID Not A Number - Error") {
            const csvString = `
            id,level,effectiveLevel,cap
            a,2,3,4
            `;
            assert.throws(() =>{
                QualitiesStore.fromCSV(csvString.trim());
            }, e => e.message == `Error at cell A2: Is not a valid integer.`);
        }

        if("Level Empty - Error") {
            const csvString = `
            id,level,effectiveLevel,cap
            1,,3,4
            `;
            const store = QualitiesStore.fromCSV(csvString.trim());
            assert.equal(store.qualities[1].id, 1);
            assert.equal(store.qualities[1].level, 0);
            assert.equal(store.qualities[1].effectiveLevel, 3);
            assert.equal(store.qualities[1].cap, 4);
        }

        if("Level Not A Number - Error") {
            const csvString = `
            id,level,effectiveLevel,cap
            1,a,3,4
            `;
            assert.throws(() =>{
                QualitiesStore.fromCSV(csvString.trim());
            }, e => e.message == `Error at cell B2: Is not a valid integer.`);
        }

        if("Effective Level Empty - Error") {
            const csvString = `
            id,level,effectiveLevel,cap
            1,2,,4
            `;
            const store = QualitiesStore.fromCSV(csvString.trim());
            assert.equal(store.qualities[1].id, 1);
            assert.equal(store.qualities[1].level, 2);
            assert.equal(store.qualities[1].effectiveLevel, 0);
            assert.equal(store.qualities[1].cap, 4);
        }

        if("Effective Level Not A Number - Error") {
            const csvString = `
            id,level,effectiveLevel,cap
            1,2,a,4
            `;
            assert.throws(() =>{
                QualitiesStore.fromCSV(csvString.trim());
            }, e => e.message == `Error at cell C2: Is not a valid integer.`);
        }
    });
});