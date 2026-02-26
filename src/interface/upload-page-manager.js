import { QualitiesStore } from "../qualities/qualities-store.js";
import { QuestsPageManager } from "./quests-page-manager.js";
import { TabManager } from "./tab-manager.js";

export class UploadPageManager {
    static initialize() {
        UploadPageManager.addEventInterrupts();
        UploadPageManager.attachFileDropEvent(UploadPageManager.onFileUploaded);
    }

    // Lovingly borrowed from: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop
    static addEventInterrupts() {

        window.addEventListener("drop", (e) => {
            if ([...e.dataTransfer.items].some((item) => item.kind === "file")) {
                e.preventDefault();
            }
        });

        window.addEventListener("dragover", (e) => {
            const fileItems = [...e.dataTransfer.items].filter(
                (item) => item.kind === "file",
            );
            if (fileItems.length > 0) {
                e.preventDefault();
                if (!document.getElementById("drop-zone").contains(e.target)) {
                    e.dataTransfer.dropEffect = "none";
                }
            }
        });

        document.getElementById("drop-zone").addEventListener("dragover", (e) => {
            const fileItems = [...e.dataTransfer.items].filter(
                (item) => item.kind === "file",
            );
            if (fileItems.length > 0) {
                e.preventDefault();
                if (fileItems.some((item) => item.type.startsWith("text/"))) {
                    e.dataTransfer.dropEffect = "copy";
                } else {
                    e.dataTransfer.dropEffect = "none";
                }
            }
        });
    }

    static attachFileDropEvent(onFileUploaded) {
        const dropZone = document.getElementById("drop-zone");
        dropZone.addEventListener("drop", ev => {
            ev.preventDefault();
            const files = [...ev.dataTransfer.items];
            if(files.length > 0) {
                onFileUploaded(files[0].getAsFile());
            }
        });

        const fileInput = document.getElementById("file-input");
        fileInput.addEventListener("change", (e) => {
            if(e.target.files.length > 0) {
                onFileUploaded(e.target.files[0]);
            }
        });
    }

    static async onFileUploaded(file) {
        try {
            let rawFile = await UploadPageManager.readFile(file);
            let qualities = QualitiesStore.fromCSV(rawFile);
            await QuestsPageManager.renderFromQualities(qualities);
            TabManager.selectTab("quests");
        } catch (error) {
            alert(error);
        }
    }

    static readFile(file) {
        return new Promise((resolve,reject) =>{
            let reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.onerror = () => {
                reject(new Error(`An error occurred reading file: ${file.name}`));
            };
            reader.readAsText(file);
        })
    }
}