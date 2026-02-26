import { QuestsValidator } from "./quests-validator.js";

export class QuestsManager {

    constructor() {
        this.validator = new QuestsValidator();
        this.getQuests();
    }

    clear() {
        this.quests = null;
        this.questsRaw = null;
    }

    clearImported() {
        this.quests = null;
    }

    async getQuests() {
        if(this.quests) {
            return this.quests
        }

        while(this.fetching) {
            await new Promise(r => setTimeout(r, 10));
            if(this.quests) {
                return this.quests;
            }
        }

        try {
            this.fetching = true;

            const response = await fetch("/quests.json");

            if(!response.ok) {
                throw new Error("HTTP error: " + response.status);
            }

            const fetchedQuests = await response.json();

            this.validator.validate(fetchedQuests);

            this.quests = fetchedQuests;
            return this.quests;
        } finally {
            this.fetching = false;
        }
    }

    async getCategories() {
        let questWrapper = await this.getQuests();
        return questWrapper.categories;
    }
}