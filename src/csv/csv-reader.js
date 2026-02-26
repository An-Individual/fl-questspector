export class CSVReader {
    constructor(csvString) {
        this.remaining = csvString;
        this.rowNumber = 0;
    }

    readRow() {
        if(!this.remaining) {
            this.row = undefined;
            return;
        }

        let cells = [];
        while(this.remaining) {
            let quoteCell = this.remaining.match(/^"(([^"]|"{2})*)"/);
            if(quoteCell) {
                cells.push(quoteCell[1].replace(/""/g,`"`));
                this.remaining = this.remaining.slice(quoteCell[0].length);
            } else {
                // This will match even on an empty string
                let plainCell = this.remaining.match(/^[^,\r\n]*/);
                cells.push(plainCell[0]);
                this.remaining = this.remaining.slice(plainCell[0].length);
            }

            // Overly defensive, but we're just going to allow
            // any combination and number of return and new line
            // characters to end a line rather than strictly
            // requiring one row per line. The goal is to reliably
            // parse a CSV exported from various spreadsheet
            // programs, not be pedantic about CSV formatting.
            let endline = this.remaining.match(/^[\r\n]+/);
            if(endline) {
                this.remaining = this.remaining.slice(endline[0].length);
                break;
            }

            if(this.remaining && this.remaining[0] == ",") {
                this.remaining = this.remaining.slice(1);
                if(!this.remaining) {
                    cells.push("");
                }
            }
        }

        if(this.row && this.row.length != cells.length) {
            throw new Error("CSV Parsing Error: Row length is not consistent.")
        }

        this.row = cells;
        this.rowNumber++;
        return cells;
    }
}

export class CSVError extends Error {
    constructor(row, column, message) {
        // Convert the column number to 
        // it's text representation.
        const letterNum = column % 26;
        const letter = (10+letterNum).toString(36).toUpperCase()
        const letterCount = Math.floor(column / 26) + 1;
        let columnLetters = "";
        for(let i = 0; i < letterCount; i++) {
            columnLetters += letter;
        }
        let cell = columnLetters + row;
        super(`Error at cell ${cell}: ${message}`);
        this.column = columnLetters;
        this.row = row;
        this.cell = cell;
        this.text = message;
    }
}