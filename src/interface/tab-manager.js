export class TabManager {
    static tabs = [
        "upload",
        "quests",
        "help",
        "landing"
    ]

    static classes = {
        clickable: "clickable",
        selected: "tab-selected",
        unselected: "tab-unselected"
    }

    static selectTab(name) {
        TabManager.tabs.forEach(tab => {
                const tabElem = document.getElementById(`tab-${tab}`);
                const pageElem = document.getElementById(`page-${tab}`);
                if (tab == name) {
                    if (tabElem) {
                        tabElem.classList.remove(TabManager.classes.clickable);
                        tabElem.classList.remove(TabManager.classes.unselected);
                        tabElem.classList.add(TabManager.classes.selected);
                    }
                    if (pageElem) {
                        pageElem.style.display = "block";
                    }
                } else {
                    if (tabElem) {
                        tabElem.classList.remove(TabManager.classes.selected);
                        tabElem.classList.add(TabManager.classes.clickable);
                        tabElem.classList.add(TabManager.classes.unselected);
                    }
                    if (pageElem) {
                        pageElem.style.display = "none";
                    }
                }
            });
    }

    static attachEvents() {
        document.getElementById("tab-upload").onclick = function() {
            TabManager.selectTab("upload");
        }

        document.getElementById("tab-quests").onclick = function() {
            TabManager.selectTab("quests");
        }

        document.getElementById("tab-help").onclick = function() {
            TabManager.selectTab("help");
        }

        TabManager.selectTab("upload");
    }
}