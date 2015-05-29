//
var levelsData = null;

//
var CreateReaperData = function(left, top, right, bottom)
{
    this.left = left != 0;
    this.top = top != 0;
    this.right = right != 0;
    this.bottom = bottom != 0;
    return this;
};

//
var CreatePreyData = function(type, property)
{
    this.type = type;
    this.property = property;
    return this;
};

//
var CreateLevelData = function()
{
    this.reapers = null;
    this.preys = null;    
    return this;
};

//
function parseLevels()
{
    var levels = game.cache.getBinary('levels');    
    var reader = new DataView(levels);
    var byteIdx = 0;

    var left, top, right, bottom;

    var levelsCount = reader.getUint8(byteIdx);    

    levelsData = new Array(levelsCount);

    for(var n = 0; n < levelsCount; n++)
    {
        var reapersCount = reader.getUint8(++byteIdx);
        
        levelsData[n] = new CreateLevelData();
        levelsData[n].reapers = new Array(reapersCount);

        for(var i = 0; i < reapersCount; i++)
        {           
            left = reader.getInt8(++byteIdx);
            top = reader.getInt8(++byteIdx);
            right = reader.getInt8(++byteIdx);
            bottom = reader.getInt8(++byteIdx);
            
            levelsData[n].reapers[i] = new CreateReaperData(left, top, right, bottom);
        }

        var preysCount = reader.getUint8(++byteIdx);     

        var preyType = 0;
        var preyProperty = 0;        

        levelsData[n].preys = new Array(preysCount);

        for(var i = 0; i < preysCount; i++)
        {
            preyType = reader.getUint8(++byteIdx);
            preyProperty = reader.getUint8(++byteIdx);

            levelsData[n].preys[i] = new CreatePreyData(preyType, preyProperty);
        }
    }    
}

//level select
function createLevelBlock(x, y, frame, number)
{
    var levelBlock = game.add.sprite(x, y, 'atlas', frame);
    levelBlock.anchor.set(0.5);    
    levelBlock.inputEnabled = true;
    levelBlock.events.onInputDown.add(levelButtonInputDown, this);
    levelBlock.idButton = 0;
    levelBlock.stateName = 'level_select_state';
    AddNumbersString(number, '_num', levelBlock, -1, 4);
}

//
function AddNumbersString(number, posFixStr, parent, x0, addSpacing)
{
    var str = number.toString();
    var chars = new Array(str.length);
    var widthString = 0;
    var x = x0;
    var y = 3;       

    for(var i = 0; i < str.length; i++)
    {
        chars[i] = game.add.sprite(x, y, 'atlas', str[i] + posFixStr);
        chars[i].anchor.y = 0.5;
        if(i > 0) chars[i].x = chars[i - 1].x + chars[i - 1].width + addSpacing;
        widthString += chars[i].width + addSpacing;
    }

    widthString *= 0.5;

    if(chars.length > 0)
    {
        for(var i = 0; i < chars.length; i++)
        {
            chars[i].x -= widthString;
            if(parent) parent.addChild(chars[i]);
        }
    }

    return chars;
}