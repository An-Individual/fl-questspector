import { CSVError, CSVReader } from "../csv/csv-reader.js";

export class QualitiesStore {
    
    static fromCSV(csvString) {
        const reader = new CSVReader(csvString);
        const columnMap = QualitiesStore.readHeaderRow(reader);

        let list = [];
        while(reader.readRow()) {
            const id = QualitiesStore.getInteger(reader.row[columnMap["id"]]);
            if(!id) {
                throw new CSVError(reader.rowNumber, columnMap["id"], "Is not a valid integer.")
            }

            const levelString = reader.row[columnMap["level"]].trim();
            const level = levelString.length == 0 ? 0 : QualitiesStore.getInteger(levelString);
            if(!level && level !== 0) {
                throw new CSVError(reader.rowNumber, columnMap["level"], "Is not a valid integer.");
            }

            const effectiveLevelString = reader.row[columnMap["effectivelevel"]].trim();
            const effectiveLevel = effectiveLevelString.length == 0 ? 0 : QualitiesStore.getInteger(effectiveLevelString);
            if(!effectiveLevel && effectiveLevel !== 0) {
                throw new CSVError(reader.rowNumber, columnMap["effectivelevel"], "Is not a valid integer.");
            }
            
            let quality = {
                id: id,
                level: level,
                effectiveLevel: effectiveLevel
            };

            const capString = reader.row[columnMap["cap"]]
            const cap = QualitiesStore.getInteger(capString);
            if(!cap && cap !== 0) {
                if(capString.trim()) {
                    throw new CSVError(reader.rowNumber, columnMap["cap"], "Is not a valid integer.");
                }
            } else {
                quality.cap = cap;
            }

            list.push(quality);
        }

        return new QualitiesStore(list);
    }

    static readHeaderRow(reader) {
        const headerRow = reader.readRow();
        if(!headerRow) {
            throw new Error("CSV is empty.");
        }

        const importantHeaders = [
            "id",
            "level",
            "effectivelevel",
            "cap"
        ];
        const columnMap = {}
        for(let i = 0; i < headerRow.length; i++) {
            const header = headerRow[i]?.trim()?.toLowerCase();
            if(importantHeaders.includes(header)) {
                columnMap[header] = i;
            }
        }

        for(let i = 0; i < importantHeaders.length; i++) {
            if(!Object.hasOwn(columnMap, importantHeaders[i])) {
                throw new Error(`CSV does not include a "${importantHeaders[i]}" column.`);
            }
        }

        return columnMap;
    }

    static getInteger(value) {
        value = value?.trim();
        if(!value?.match(/^[0-9]+$/)) {
            return;
        }

        return parseInt(value);
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

    getCount() {
        return Object.keys(this.qualities).length;
    }
}