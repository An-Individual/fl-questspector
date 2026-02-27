export class HelpPageManager {
    static updateVersionBox(quests, qualities) {
        let versionString = "Quests Information"
        if(!quests) {
            versionString += "\n    Undefined";
        } else {
            versionString += `\n    Version: ${quests.version}`;

            let categories = quests.categories.length;
            let questsCount = 0;
            quests.categories.forEach(cat => {
                questsCount += cat.quests.length;
            });

            versionString += `\n    Categories: ${categories}`;
            versionString += `\n    Quests: ${questsCount}`;
        }

        versionString += "\nQualities Information";
        if(!qualities) {
            versionString += "\n    None";
        } else {
            versionString += `\n    Count: ${qualities.getCount()}`;
        }

        const versionElem = document.getElementById("version-box");
        versionElem.innerText = versionString;
    }
}