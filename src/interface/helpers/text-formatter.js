export class TextFormatter {
    static Expressions = {
        Header: /^\s*(#{1,6}) ?/,
        ListPoint: /^(\s*)([-+]|\* )/
    }

    static ChunkType = {
        Unknown: 0,
        Text: 1,
        Heading: 2,
        List: 3
    }

    /**
     * This function makes text safe for insertion
     * into the UI as HTML. It can also, optionally,
     * insert line breaks and do some light formatting
     * based on markdown syntax. This includes headings,
     * bold/italic/strikethrough text, and unordered 
     * lists. It does not include links as I do not want
     * to risk someone distributing quest files 
     * containing malicious links.
     */
    static sanitizeAndFormat(str, markdownLite) {
        if(!str) {
            return str;
        }

        let escaped = TextFormatter.htmlEscape(str);

        if(!markdownLite) {
            return escaped;
        }

        let result = "";
        let chunks = TextFormatter.mardownSplitChunks(escaped);
        chunks.forEach(chunk =>{
            if(!chunk.trim()) {
                return;
            }

            let headingMatch = chunk.match(TextFormatter.Expressions.Header);
            if(headingMatch) {
                let hNum = headingMatch[1].length;
                let hBody = chunk.substring(headingMatch[0].length);
                result += `<h${hNum}>${TextFormatter.formatTextChunk(hBody)}</h${hNum}>`
            } else if(chunk.match(TextFormatter.Expressions.ListPoint)) {
                result += TextFormatter.handleListChunk(chunk);
            } else {
                result += "<p>" + TextFormatter.formatTextChunk(chunk) + "</p>";
            }
        });

        return result;
    }

    /**
     * Splits the string along double return lines
     * and standardizes the returns within a chunk
     * to use just "\n" so the chunk handling code
     * doesn't need to account for the "\r\n" case.
     */
    static mardownSplitChunks(str) {
        if(!str){
            return [];
        }

        /**
         * Markdown carves things up into meaningful
        * chunks via double new line characters. But
        * there are two. "\r" and "\n". And Windows
        * can make our life hard by using "\r\n" for
        * a single new line. The lone "\r" case is
        * old enough we're going to ignore it, but
        * we have to account for the other two.
         */
        let winLines = str.split("\r\n");
        let lines = [];
        winLines.forEach(wl =>{
            wl.split("\n").forEach(l =>{
                lines.push(l);
            })
        })
        
        let chunks = [];
        let currentChunk;
        let currentType = TextFormatter.ChunkType.Unknown;
        for(const i in lines) {
            if(!lines[i]) {
                if(currentChunk) {
                    chunks.push(currentChunk);
                    currentChunk = null;
                    currentType = TextFormatter.ChunkType.Unknown;
                }
                continue;
            }

            let line = lines[i];
            let type = TextFormatter.getLineType(line);
            if(type == TextFormatter.ChunkType.Text) {
                line = line.trim();
                if(currentChunk) {
                    currentChunk += " " + line;
                } else {
                    currentChunk = line;
                    currentType = type;
                }
            } else {
                line = line.trimEnd();
                if(type != currentType || type == TextFormatter.ChunkType.Heading) {
                    if(currentChunk) {
                        chunks.push(currentChunk);
                    }
                    currentChunk = line;
                    currentType = type;
                } else {
                    // If we get here we have chained
                    // list item rows.
                    if(currentChunk) {
                        currentChunk += "\n" + line;
                    } else {
                        currentChunk = line;
                    }
                }
            }

            if(i == lines.length - 1 && currentChunk) {
                chunks.push(currentChunk);
            }
        }

        return chunks
    }

    static getLineType(line) {
        if(!line) {
            return TextFormatter.ChunkType.Unknown;
        }

        if(line.match(TextFormatter.Expressions.Header)) {
            return TextFormatter.ChunkType.Heading;
        }

        if(line.match(TextFormatter.Expressions.ListPoint)) {
            return TextFormatter.ChunkType.ListPoint;
        }

        return TextFormatter.ChunkType.Text;
    }

    static handleListChunk(chunk) {
        let lines = chunk.split("\n");
        let points = [];
        lines.forEach(line =>{
            // Vertical tab (\v) and form feeder (\f) characters
            // risk breaking this. We're just going to assume
            // people aren't going to be typing those and 
            // let it break.
            let match = line.match(TextFormatter.Expressions.ListPoint);
            if(!match) {
                if(points.length == 0) {
                    throw new Error("Cannot listify non-list chunk.");
                }
                points[points.length - 1].chunk += "\n" + line;
            } else {
                /**
                 * The possibility of tabs is complicated because
                 * how they'll look to the writer differes based
                 * on the editor they're looking at it through.
                 * For example, both Notepad and Notepad++ push
                 * text ahead in fixed increments that ignore
                 * preceeding spaces if they don't exceed that
                 * distance, but Notepad uses 8 spaces and 
                 * Notepad++ uses 4. The correct thing to do
                 * is not use tabs at all. But if we encounter
                 * them I've decided to just let them count
                 * as a flat 4 spaces.
                 */
                points.push({
                    depth: match[1].length + ((match[1].match(/\t/g)?.length ?? 0) * 3),
                    chunk: line.substring(match[0].length)
                });
            }
        });

        return TextFormatter.collapsePoints(points);
    }

    /**
     * Recursive helper method for handleListChunks that takes the list
     * of points and depths it generates and creates a string with
     * appropriate <ul> and <li> tag wrappings. 
     */
    static collapsePoints(points) {
        let depths = points.map(p => p.depth);
        let depth = Math.min.apply(Math, depths);
        let subPoints = [];
        let lines = [];
        for(let i = 0; i < points.length; i++) {
            let point = points[i];
            if(point.depth > depth) {
                subPoints.push(point);
            }
            
            if(i == points.length - 1 || point.depth == depth) {
                if(subPoints.length > 0) {
                    lines.push(TextFormatter.collapsePoints(subPoints));
                    subPoints = [];
                }
            }

            if(point.depth == depth){
                lines.push(`<li>${TextFormatter.formatTextChunk(point.chunk)}</li>`);
            }
        }

        return `<ul>${lines.join("")}</ul>`;
    }

    /**
     * Takes the new line characters remaining in
     * text chunks after the chunk split that breaks
     * up text on double new line characters and
     * replaces them, and any lingery white space
     * between them, with a single regular space.
     */
    static formatTextChunk(chunk) {
        if(!chunk) {
            return chunk;
        }

        let lines = chunk.split("\n");
        let result = "";
        lines.forEach(line => {
            let l = line.trim();
            if(result){
                result += " ";
            }
            result += TextFormatter.markdownCharacterEmphasis(l);
        });

        return result;
    }

    static markdownCharacterEmphasis(line){
        /**
         * These all work in a similar way. First they find a sequence of the wrapper
         * character (one, two, or three instances) followed by a non-space, non-wrapper
         * character. They end by matching the same sequence in reverse (using a lookbehind
         * to check for the non-wrapper character so we can match cases that wrap a single
         * character). Between those points they match either any character that isn't the 
         * wrapper charactor, or an instance of the wrapper character that doesn't match the 
         * end sequence when you do a reverse lookbehind.
         */
        const boldItalic = /\*{3}([^*\s]([^*]|(?<![^*\s]\*\*)\*)*)(?<=[^*\s])\*{3}/;
        const bold = /\*{2}([^*\s]([^*]|(?<![^*\s]\*)\*)*)(?<=[^*\s])\*{2}/;
        const italic = /\*([^*\s]([^*]|(?<![^\s*])\*)*)(?<=[^*\s])\*/;
        const strikethrough = /~{2}([^~\s]([^~]|(?<![^~\s]~)~)*)(?<=[^~\s])~{2}/;

        const patterns = [
            boldItalic,
            bold,
            italic,
            strikethrough
        ]

        let result = "";
        let remainingLine = line;
        while(remainingLine) {
            let closestMatch;
            let closestType;
            for(let i = 0; i < patterns.length; i++) {
                let match = patterns[i].exec(remainingLine);
                if(match){
                    if(!closestMatch || match.index < closestMatch.index) {
                        closestMatch = match;
                        closestType = i;
                    }
                }
            }

            if(!closestMatch) {
                result += remainingLine;
                remainingLine = "";
            } else {
                // Run the conversion logic recursively. This is done to handle
                // nested tags without risking the possibility that tags overlap
                // each other.
                let innerText = this.markdownCharacterEmphasis(closestMatch[1]);
                result += remainingLine.substring(0, closestMatch.index);
                remainingLine = remainingLine.substring(closestMatch.index + closestMatch[0].length);
                switch(closestType){
                    case 0:
                        result += "<b><i>" + innerText + "</i></b>";
                        break;
                    case 1:
                        result += "<b>" + innerText + "</b>";
                        break;
                    case 2:
                        result += "<i>" + innerText + "</i>";
                        break;
                    case 3:
                        result += "<s>" + innerText + "</s>";
                        break;
                    default:
                        throw new Error("Markdown emphasis type not implemented");
                }
            }
        }

        return result;
    }

    static htmlEscape(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/'/g, '&apos;')
            .replace(/"/g, '&quot;')
            .replace(/>/g, '&gt;')
            .replace(/</g, '&lt;');
    }
}