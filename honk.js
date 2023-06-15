class HONK{
    constructor( input ){
        this.raw = null;
        this.data = null;
        this.debug = false;

        if(input){
            this.raw = input.toString();
        }
    }

    parse(){
        let lines = this.raw.split('\r\n');

        // Remove any lines that don't start with "-" and remove "-" from lines that do
        let newLines = [];

        lines.forEach(l => {
            if(l.trim().startsWith('- ')){
                newLines.push(l.replace('- ', ''));
            }
        });

        lines = newLines;
        return this.parseObject(lines);
    }

    parseObject( lines ){
        this.data = {};
        let currentParent = null;
        let lastIndent = 0;

        // Add keys/values to the data of the object
        lines.forEach((l, index) => {
            // Count the indents at the start of the line
            let indents = 0;
            let inWord = false;

            l.split('').forEach(char => {
                if(char === ' ' && !inWord)
                    indents += 0.25;
                else
                    inWord = true;
            })

            indents = Math.floor(indents);
            let splitLine = l.split(': ');

            if(indents < lastIndent){
                let idnts = Math.abs(indents - lastIndent);
                lastIndent = indents;
                if(this.debug)
                    console.log(index, indents, idnts, l)

                if(idnts == 0)return;
                for (let i = 0; i < idnts; i++){
                    currentParent = currentParent.parent;
                }
            }

            if(indents > 0){
                if(!currentParent)
                    throw new Error("Object/Array doesn't exist, Line "+l.trim())

                if(Array.isArray(currentParent)) {
                    if(splitLine[0].trim().endsWith(':')){
                        // Check if vaild array
                        let nxtLine = lines[index + 1];
                        let indents2 = 0;
                        let inWord2 = false;

                        nxtLine.split('').forEach(char => {
                            if(char === ' ' && !inWord2)
                                indents2 += 0.25;
                            else 
                                inWord2 = true;
                        });

                        indents2 = Math.floor(indents2);
                        lastIndent = indents2;

                        if(indents2 == 0)
                            throw new Error("Not a vaild object/array: "+splitLine[0])

                        if(nxtLine.includes(': '))
                            currentParent[splitLine[0].trim()] = {
                                parent: currentParent
                            };
                        else {
                            let tmpParent = currentParent;

                            currentParent[splitLine[0].trim()] = [];
                            currentParent[splitLine[0].trim()].parent = tmpParent;
                        }

                        if(this.debug)
                            console.log('Original:', l, 'Parsed:', splitLine);

                        currentParent = currentParent[splitLine[0].trim()];
                    } else{
                        if(splitLine[1]){
                            let key = splitLine[0].trim();

                            splitLine.shift();
                            splitLine = splitLine.join(': ');

                            currentParent[key] = splitLine;
                        } else
                            currentParent.push(splitLine[0].trim());
                    }
                } else if(splitLine[1]){
                    let key = splitLine[0].trim();

                    splitLine.shift();
                    splitLine = splitLine.join(': ');

                    if(this.debug)
                        console.log('Original:', l, 'Parsed:', key, splitLine);

                    currentParent[key] = this.convertString(splitLine);
                } else{
                    // Check if a vaild object
                    let nxtLine = lines[index + 1];
                    let indents2 = 0;
                    let inWord2 = false;

                    nxtLine.split('').forEach(char => {
                        if(char === ' ' && !inWord2)
                            indents2 += 0.25;
                        else 
                            inWord2 = true;
                    });

                    indents2 = Math.floor(indents2);
                    lastIndent = indents2;

                    if(indents2 == 0)
                        throw new Error("Not a vaild object/array: "+splitLine[0])

                    splitLine = splitLine.join(': ').split(':');

                    // Check if its an array or object
                    if(nxtLine.includes(': '))
                        currentParent[splitLine[0].trim()] = {
                            parent: currentParent
                        };
                    else {
                        let tmpParent = currentParent;

                        currentParent[splitLine[0].trim()] = [];
                        currentParent[splitLine[0].trim()].parent = tmpParent;
                    }

                    if(this.debug)
                        console.log('Original:', l, 'Parsed:', splitLine);

                    currentParent = currentParent[splitLine[0].trim()];
                }

                return;
            };
            
            if(!splitLine[1]){
                // Check if a vaild object
                let nxtLine = lines[index + 1];
                let indents2 = 0;
                let inWord2 = false;

                nxtLine.split('').forEach(char => {
                    if(char === ' ' && !inWord2)
                        indents2 += 0.25;
                    else 
                        inWord2 = true;
                });

                indents2 = Math.floor(indents2);
                if(indents2 == 0)
                    throw new Error("Not a vaild object/array: "+splitLine[0])

                // Check if its an array or object
                if(this.debug)
                    console.log(splitLine, nxtLine, nxtLine.includes(': '));

                if(nxtLine.includes(': '))
                    this.data[splitLine[0].replace(':', '')] = {
                        parent: this.data
                    };
                else{
                    this.data[splitLine[0].replace(':', '')] = [];
                    this.data[splitLine[0].replace(':', '')].parent = this.data;
                }

                currentParent = this.data[splitLine[0].replace(':', '')];
            } else
                // Single values
                this.data[splitLine[0]] = this.convertString(splitLine[1]);
        })
    }

    convertString( str ){
        if(!isNaN(parseInt(str)) && str.split('.').length < 2)
            return parseInt(str);
        else if(!isNaN(parseFloat(str)) && str.split('.').length < 3)
            return parseFloat(str);
        else if(str === 'true')
            return true;
        else if(str === 'false')
            return false;
        else
            return str;
    }
}

module.exports = HONK;