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

                if(idnts == 0)return;
                for (let i = 0; i < idnts; i++)
                    currentParent = currentParent.parent;
            }

            if(this.debug)
                console.log(index, indents, Math.abs(indents - lastIndent), l, splitLine, Array.isArray(currentParent));

            if(indents > 0){
                if(!currentParent)
                    throw new Error("Object/Array doesn't exist, Line "+l.trim())

                if(Array.isArray(currentParent)){
                    let nxtLine = lines[index + 1];

                    if(!nxtLine)
                        return currentParent.push(this.convertString(splitLine[0].trim()));

                    let indents2 = 0;
                    let inWord2 = false;

                    nxtLine.split('').forEach(char => {
                        if(char === ' ' && !inWord2)
                            indents2 += 0.25;
                        else 
                            inWord2 = true;
                    });

                    indents2 = Math.floor(indents2);

                    if(indents2 - indents > 0){
                        // Check if a vaild object
                        let nxtLine = lines[index + 1];
                        let indents3 = 0;
                        let inWord3 = false;

                        nxtLine.split('').forEach(char => {
                            if(char === ' ' && !inWord3)
                                indents3 += 0.25;
                            else 
                                inWord3 = true;
                        });

                        indents3 = Math.floor(indents3);
                        lastIndent = indents3;

                        if(indents3 == 0)
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
    
                        currentParent = currentParent[splitLine[0].trim()];
                    } else
                        currentParent.push(this.convertString(splitLine[0].trim()));
                } else if((splitLine[1] && splitLine[1].trim() !== '')){
                    if(this.debug)
                        console.log('gggggggggg');

                    let key = splitLine[0].trim();

                    splitLine.shift();
                    splitLine = splitLine.join(': ');

                    currentParent[key] = this.convertString(splitLine);

                    if(this.debug)
                        console.log('       ' + key, this.convertString(splitLine));
                } else{
                    if(this.debug)
                        console.log('hhhhhhhhh');

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

                    // Check if its an array or object
                    if(this.debug)
                        console.log('Next line is object: '+nxtLine.includes(': '));

                    if(nxtLine.includes(': '))
                        currentParent[splitLine[0].trim()] = {
                            parent: currentParent
                        };
                    else {
                        let tmpParent = currentParent;

                        currentParent[splitLine[0].trim()] = [];
                        currentParent[splitLine[0].trim()].parent = tmpParent;
                    }

                    currentParent = currentParent[splitLine[0].trim()];

                    if(this.debug)
                        console.log('       ' + splitLine[0].trim(), currentParent);
                }

                return;
            }
            
            if(!splitLine[1] || splitLine[1].trim() === ''){
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
                    console.log('Next line is object: '+nxtLine.includes(': '));

                if(nxtLine.includes(': '))
                    this.data[splitLine[0].replace(':', '')] = {
                        parent: this.data
                    };
                else{
                    this.data[splitLine[0].replace(':', '')] = [];
                    this.data[splitLine[0].replace(':', '')].parent = this.data;
                }

                currentParent = this.data[splitLine[0].replace(':', '')];

                if(this.debug)
                    console.log('       ' + splitLine[0].trim(), currentParent);
            } else{
                // Single values
                this.data[splitLine[0]] = this.convertString(splitLine[1]);
                
                if(this.debug)
                    console.log('       ' + splitLine[0].trim(), this.convertString(splitLine[1]));
            }
        })
    }

    convertString( str ){
        if(!isNaN(parseInt(str)))
            return parseInt(str);
        else if(!isNaN(parseFloat(str)))
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