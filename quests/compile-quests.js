import { QuestsCSVParser } from "./helpers/quests-csv-parser.js";
import { QuestsValidator } from "../src/quests/quests-validator.js";
import * as fs from "fs";

const parser = new QuestsCSVParser();
const validator = new QuestsValidator();
const definitionsDir = "./quests/definitions/";
const outputFile = "./dev/quests.json"

const version = fs.readFileSync(definitionsDir + "version.txt").toString().trim();
if(!version) {
    console.error(`No version string defined in ${definitionsDir}version.txt`);
}

const quests = {
    version: version,
    categories: []
};
const files = fs.readdirSync(definitionsDir, {
    recursive: true
});
for(let i = 0; i < files.length; i++) {
    const file = files[i];
    if(!file.endsWith(".csv")) {
        continue;
    }
    console.log(`Processing ${file}`);
    const csvString = fs.readFileSync(definitionsDir + file).toString();
    const parsedQuests = parser.parse(csvString, true);
    if(!parsedQuests) {
        throw new Error("No quests returned");
    }
    if(parsedQuests.error) {
        throw new Error(parsedQuests.error);
    }
    if(!parsedQuests.categories) {
        throw new Error("No categories returned");
    }

    parsedQuests.categories.forEach(cat =>{
        if(cat.isAug) {
            console.log(`    Category Aug: ${cat.id} (${cat.quests.length} Quests)`);
        } else {
            console.log(`    New Category: ${cat.id} (${cat.quests.length} Quests)`);
        }
        quests.categories.push(cat);
    });
}

let augCatIdx
do {
    augCatIdx = quests.categories.findIndex(cat => cat.isAug);
    if(augCatIdx >= 0) {
        const augCat = quests.categories[augCatIdx];
        const origCat = quests.categories.find(cat => cat.id == augCat.id && !cat.isAug);
        if(!origCat) {
            throw new Error(`Category augmentation "${augCat.id}" does not augment an existing category.`);
        }

        augCat.quests.forEach(quest => {
            origCat.quests.push(quest);
        });
        quests.categories.splice(augCatIdx, 1);
    }
} while (augCatIdx >= 0);

console.log("Validating Quest JSON");
validator.validate(quests);

fs.writeFileSync(outputFile, JSON.stringify(quests))