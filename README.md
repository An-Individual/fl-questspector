# Fallen London Questspector

The website can be found [here](https://an-individual.github.io/fl-questspector/).

Questspector is a 3rd party tool meant to help Fallen London players identify which of the game's story lines they've done, which are in progress, and which they have yet to do. It uses data exported by the [Sheetifier extension](https://github.com/An-Individual/fl-sheetifier) to render a page displaying this information.

# Building the Site

The first step to compiling things is to install [Node.js](https://nodejs.org/). This repository was developed against version 24.13.1, but any newer version should also work. Once you've install Node.js, you should run `npm install` to install the dependencies. The repository uses `webpack`, `mocha`, `eslint`, and `html-server`. Once you've done this here are the `npm` scripts that you can run.

- `npm run build` packages the Javascript in the `/src` folder and compliles the quests in the `/quests` folder and deposits the resulting `.js` and `.csv` files in the `/dev` folder.
- `npm run debug` functions as above, but it then starts a local http server serving the files in the `/dev` folder. This is necessary to test the site locally as just opening the `index.html` page in a browser will result in CSP errors loading the Quests JSON.
- `npm run test` runs the unit tests. These tests don't cover everything. But they do make sure the quest generation and rendering steps run smoothly.
- `npm run deploy` runs the build step and then copies the contens of the `/dev` folder into the `/docs` folder. The Questifier is built on Github pages and the docs folder is where the pages site is hosted from.

If you want to know how the quests are documented and rendered, there's a [wiki page](https://github.com/An-Individual/fl-questspector/wiki/Quest-Creation) about it.
