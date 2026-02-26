export class ConditionReader {
    constructor(conditionString) {
        this.value = conditionString;
        this.index = 0;
    }

    next() {
        if(this.index >= this.value.length) {
            this.last = null;
            return;
        }

        if(this.isWhiteSpace(this.value[this.index])) {
            this.moveNextNot(this.isWhiteSpace);
        }

        if(this.index >= this.value.length) {
            this.last = null;
            return;
        }

        this.lastIndex = this.index;

        if(this.isLogicChar(this.value[this.index])) {
            this.moveNextNot(this.isLogicChar);
        } else if(this.isComparison(this.value[this.index])) {
            this.moveNextNot(this.isComparison);
        } else if(this.isLetter(this.value[this.index])) {
            this.moveNextNot(this.isLetter);
        } else if(this.isNumber(this.value[this.index])) {
            this.moveNextNot(this.isNumber);
        } else {
            this.index++;
        }

        this.last = this.value.substring(this.lastIndex, this.index);
        return this.last;
    }

    nextThrowIfEnd() {
        let result = this.next();
        if(!result) {
            throw new Error("Unexpected end of condition");
        }
        return result;
    }

    moveNextNot(logic) {
        while(this.index < this.value.length && logic(this.value[this.index])){
            this.index++;
        }
    }

    isLogicChar(char) {
        return /^[|&]$/.test(char);
    }

    isComparison(char) {
        return /^[!=<>]$/.test(char);
    }

    isLetter(char) {
        return /^[a-zA-Z]$/.test(char);
    }

    isNumber(char) {
        return /^[0-9]$/.test(char);
    }

    isWhiteSpace(char) {
        return /^\s$/.test(char);
    }
}