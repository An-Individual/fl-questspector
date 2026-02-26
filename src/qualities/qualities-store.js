import { CSVReader } from "../csv/csv-reader";

export class QualitiesStore {
    
    static fromCSV(csvString) {
        const reader = new CSVReader(csvString);
        let list = [];
        let columns = [];
        while(reader.readRow()) {
            if(reader.rowNumber == 1) {
                for(let i = 0; i < reader.row.length; i++) {
                    columns.push(reader.row[i]?.trim());
                }

                if(!columns.includes("id")) {
                    throw new Error(`Does not include an "id" column`);
                }

                if(!columns.includes("level")) {
                    throw new Error(`Does not include a "level" column`);
                }

                if(!columns.includes("effectiveLevel")) {
                    throw new Error(`Does not include a "effectiveLevel" column`);
                }
            } else {
                let quality = {};
                for(let i = 0; i < reader.row.length; i++) {
                    quality[columns[i]] = reader.row[i];
                }
                list.push();
            }
        }

        return new QualitiesStore(list);
    }

    constructor(qualityList) {
        this.qualities = {};
        qualityList.forEach(q => {
            this.qualities[q.id] = q;
        });
    }

    getValue(id, property) {
        if(!property) {
            property = "effectiveLevel"
        }
        if(property == "baseLevel") {
            property = "level";
        }
        return this.qualities[id]?.[property] ?? 0;
    }
}