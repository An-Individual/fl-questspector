import { read } from "node:fs";
import { CSVReader } from "../../src/csv/csv-reader.js";
import assert from "node:assert";

describe("CSVReader", function(){
    describe("#readRow()", function(){
        it("Empty String - No Rows", function(){
            const reader = new CSVReader(``);
            assert(!reader.readRow());
        });

        it("Single Comma - 1 Row, 2 Cells", function(){
            const reader = new CSVReader(`,`);
            let row = reader.readRow();
            assert.equal(row.length, 2);
            assert.equal(row[0], "");
            assert.equal(row[1], "");
            assert.equal(reader.rowNumber, 1);
            assert(!reader.readRow());
        });

        it("Plain Text Cell - 1 Row, 1 Cell", function(){
            const reader = new CSVReader(`a`);
            let row = reader.readRow();
            assert.equal(row.length, 1);
            assert.equal(row[0], "a");
            assert.equal(reader.rowNumber, 1);
            assert(!reader.readRow());
        });

        it("2 Plain Text Cells - 1 Row, 2 Cells", function(){
            const reader = new CSVReader(`a,b`);
            let row = reader.readRow();
            assert.equal(row.length, 2);
            assert.equal(row[0], "a");
            assert.equal(row[1], "b");
            assert.equal(reader.rowNumber, 1);
            assert(!reader.readRow());
        });

        it("2 Cells with trailing comma - 1 Row, 3 Cells", function(){
            const reader = new CSVReader(`a,b,`);
            let row = reader.readRow();
            assert.equal(row.length, 3);
            assert.equal(row[0], "a");
            assert.equal(row[1], "b");
            assert.equal(row[2], "");
            assert.equal(reader.rowNumber, 1);
            assert(!reader.readRow());
        });
        
        it("Cell With Comma - 1 Row, 1 Cell", function(){
            const reader = new CSVReader(`"a,b"`);
            let row = reader.readRow();
            assert.equal(row.length, 1);
            assert.equal(row[0], "a,b");
            assert.equal(reader.rowNumber, 1);
            assert(!reader.readRow());
        });

        it("2 Cells with Quotes - 1 Row, 2 Cells", function(){
            const reader = new CSVReader(`"a","b"`);
            let row = reader.readRow();
            assert.equal(row.length, 2);
            assert.equal(row[0], "a");
            assert.equal(row[1], "b");
            assert.equal(reader.rowNumber, 1);
            assert(!reader.readRow());
        });

        it("1 Cells with Escaped Quotes - 1 Row, 1 Cell", function(){
            const reader = new CSVReader(`"""a"",""b"""`);
            let row = reader.readRow();
            assert.equal(row.length, 1);
            assert.equal(row[0], `"a","b"`);
            assert.equal(reader.rowNumber, 1);
            assert(!reader.readRow());
        });

        it("1 Cells with Escaped Quotes & New Line - 1 Row, 1 Cell", function(){
            const reader = new CSVReader(`"""a"",\n""b"""`);
            let row = reader.readRow();
            assert.equal(row.length, 1);
            assert.equal(row[0], `"a",\n"b"`);
            assert.equal(reader.rowNumber, 1);
            assert(!reader.readRow());
        });

        it("2 Cells with New Line - 2 Rows, 1 Cell Each", function(){
            const reader = new CSVReader(`a\nb`);
            let row = reader.readRow();
            assert.equal(row.length, 1);
            assert.equal(row[0], "a");
            assert.equal(reader.rowNumber, 1);
            row = reader.readRow();
            assert.equal(row.length, 1);
            assert.equal(row[0], "b");
            assert.equal(reader.rowNumber, 2);
            assert(!reader.readRow());
        });
        

        it("2 Rows with trailing New Line - 2 Rows, 1 Cell Each", function(){
            const reader = new CSVReader(`a\nb\n`);
            let row = reader.readRow();
            assert.equal(row.length, 1);
            assert.equal(row[0], "a");
            assert.equal(reader.rowNumber, 1);
            row = reader.readRow();
            assert.equal(row.length, 1);
            assert.equal(row[0], "b");
            assert.equal(reader.rowNumber, 2);
            assert(!reader.readRow());
        });

        it("2 Rows 2 Cells - 2 Rows, 2 Cell Each", function(){
            const reader = new CSVReader(`a,b\nc,d`);
            let row = reader.readRow();
            assert.equal(row.length, 2);
            assert.equal(row[0], "a");
            assert.equal(row[1], "b");
            assert.equal(reader.rowNumber, 1);
            row = reader.readRow();
            assert.equal(row.length, 2);
            assert.equal(row[0], "c");
            assert.equal(row[1], "d");
            assert.equal(reader.rowNumber, 2);
            assert(!reader.readRow());
        });

        it("Different Cell Count - Failure on Secton Read", function(){
            const reader = new CSVReader(`a,b\nc`);
            let row = reader.readRow();
            assert.equal(row.length, 2);
            assert.equal(row[0], "a");
            assert.equal(row[1], "b");
            assert.equal(reader.rowNumber, 1);
            assert.throws(function(){
                read.readRow();
            });
        });
    });
});