//
var helps = null;

//
function createHelpText(x, y, fontSize)
{    
    var text = game.add.text(x, y);
    text.anchor.set(0.5);
    text.align = 'center';
    var fontSizeScale = 1;
    if(text.fontSize !== 0 && text.fontSize !== 32) fontSizeScale = 32 / text.fontSize;
    text.fontSize = fontSize * fontSizeScale;
    text.fill = '#f05e43';
    return text;
}

//
function checkTutorialNeed()
{
    helps = null;  

    switch(playerData.tutorialStep)
    {
        case 0:
            helps = new Object();
            helps.a1 = game.add.sprite(156, 230, 'help_atlas', 'help1');
            helps.a2 = game.add.sprite(247, 620, 'help_atlas', 'help2');
            helps.b = game.add.sprite(game.world.centerX, 260, 'help_atlas', 'help3');
            helps.b.anchor.set(0.5);
            helps.b.alpha = 0.0;
            var text_help = game.cache.getJSON('text_help');
            var text_a1 = createHelpText(helps.a1.width * 0.5, helps.a1.height * 0.4, text_help[0].size);
            text_a1.text = text_help[0].text;
            var text_a2 = createHelpText(helps.a2.width * 0.5, helps.a2.height * 0.6, text_help[1].size);
            text_a2.text = text_help[1].text;
            var text_b = createHelpText(0, 0, text_help[2].size);
            text_b.text = text_help[2].text;
            helps.a1.addChild(text_a1);
            helps.a2.addChild(text_a2);
            helps.b.addChild(text_b);
            playerData.tutorialStep = 1;
            break;

        case 2:
            if(playerData.currentLevel === 4 && playerData.levelsComplete === 4)
            {
                helps = game.add.sprite(269, 360, 'help_atlas', 'help4');
                var text_help = game.cache.getJSON('text_help');
                var text = createHelpText(helps.width * 0.5, helps.height * 0.37, text_help[3].size);
                text.text = text_help[3].text;
                helps.addChild(text);
                playerData.tutorialStep = 3;
            }
            break;

        case 3:
            if(playerData.currentLevel === 7 && playerData.levelsComplete === 7)
            {
                helps = game.add.sprite(160, 625, 'help_atlas', 'help5');
                var text_help = game.cache.getJSON('text_help');
                var text = createHelpText(helps.width * 0.5, helps.height * 0.6, text_help[4].size);
                text.text = text_help[4].text;
                helps.addChild(text);
                playerData.tutorialStep = 4;
            }
            break;       
    } 
}

//
function tutorialNextStep()
{
    if(playerData.tutorialStep === 1)
    {        
        firstHelpNext();
        playerData.tutorialStep = 2;
    }
    else if(playerData.tutorialStep !== 2) addTweenToHelp(helps, 0.0, null);
}

//
function tutorialPreviosStep()
{
    if(playerData.tutorialStep === 1 || playerData.tutorialStep === 2)
    {        
        firstHelpPrevios();
        playerData.tutorialStep = 1;
    }
    else addTweenToHelp(helps, 1.0, null);
}

//
function firstHelpNext()
{
    addTweenToHelp(helps.a1, 0.0, null);    
    addTweenToHelp(helps.a2, 0.0, function() { addTweenToHelp(helps.b, 1.0, null); });
}

//
function firstHelpPrevios()
{
    addTweenToHelp(helps.b, 0.0, function() { addTweenToHelp(helps.a1, 1.0, null); addTweenToHelp(helps.a2, 1.0, null); });
}

//
function addTweenToHelp(ho, target, onComplete)
{
    var tween = game.add.tween(ho).to({ alpha: target }, 200, Phaser.Easing.None, true);
    if(onComplete) tween.onComplete.add(onComplete, ho);
}