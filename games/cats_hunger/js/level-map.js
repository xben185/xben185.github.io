//Level Select Menu
var isCameraDrag = false;
var tapPointY = 0;
var btnSound = null;

//
function createLevelSelect()
{
    var map = game.add.sprite(0, 0, 'level_map_bg');
    map.inputEnabled = true;
    map.events.onInputDown.add(function() { isCameraDrag = true; tapPointY = game.input.activePointer.y + game.camera.y; }, this);
    map.events.onInputUp.add(function() { isCameraDrag = false; tapPointY = game.input.activePointer.y + game.camera.y; }, this);

    isCameraDrag = false;
    
    game.world.setBounds(0, 0, 634, 1440); //1350
   
    createLevelsBlock();

    game.camera.y = playerData.levelsComplete > 15 ? 0 : 480;      

    if(game.device.webAudio)
    {
        btnSound = createSoundButton();
        btnSound.x = 60;
        btnSound.y = game.camera.y + 60;
    }

    homeButton = createHomeButton();
    homeButton.x = 20;
    homeButton.y = 1000;

    screenBlink(0.0);
}

function updateLevelSelect()
{
    if(isCameraDrag)
    {
        game.camera.y = tapPointY - game.input.activePointer.y;
        if(btnSound) btnSound.y = game.camera.y + 60;
    }
}

function levelButtonInputDown(sprite)
{
    sprite.inputEnabled = false;
    game.add.tween(sprite.scale).to({ x: 1.2, y: 0.8 }, 200, Phaser.Easing.Linear.None, true, 0, 1, true).onComplete.add(clickLevelBlock, sprite);
    sfx_button.play();
}

//
function clickLevelBlock()
{
    playerData.currentLevel = this.idButton;
    var stateName = this.stateName;
    screenBlink(1.0, function() { game.state.start(stateName); });
}

//
function createLevelsBlock()
{
    //locations:
    function Loc(x, y)
    {
        this.x = x;
        this.y = y;
        return this;
    }

    var locs = new Array(levelsData.length);

    locs[0] = new Loc(69, 791 + 500);
    locs[1] = new Loc(187, 793 + 500);
    locs[2] = new Loc(307, 787 + 500);
    locs[3] = new Loc(424, 787 + 500);
    locs[4] = new Loc(537, 754 + 500);
    locs[5] = new Loc(578, 646 + 500);
    locs[6] = new Loc(561, 543 + 500);
    locs[7] = new Loc(461, 962);
    locs[8] = new Loc(352, 945);
    locs[9] = new Loc(238, 924);
    locs[10] = new Loc(128, 881);
    locs[11] = new Loc(77, 783);
    locs[12] = new Loc(110, 683);
    locs[13] = new Loc(218, 655);
    locs[14] = new Loc(334, 640);
    locs[15] = new Loc(443, 624);
    locs[16] = new Loc(543, 571);
    locs[17] = new Loc(548, 470);
    locs[18] = new Loc(460, 396);
    locs[19] = new Loc(347, 358);
    locs[20] = new Loc(233, 333);
    locs[21] = new Loc(165, 237);
    locs[22] = new Loc(181, 134);
    locs[23] = new Loc(307, 101);
    locs[24] = new Loc(438, 111);

    //
    for(var i = 0; i < levelsData.length; i++)
    {
        var levelButton = game.add.sprite(locs[i].x, locs[i].y, 'atlas', (i < playerData.levelsComplete) ? 'level_select_complete' : 'level_select_undone');
        levelButton.anchor.set(0.5);

        if(i < playerData.levelsComplete + 1)
        {
            AddNumbersString(i + 1, '_num', levelButton, 2, 6);

            levelButton.inputEnabled = true;
            levelButton.events.onInputDown.add(levelButtonInputDown, this);
            levelButton.idButton = i;
            levelButton.stateName = 'main_state';
        }
        else
        {
            var lock = game.add.sprite(0, 0, 'atlas', 'level_select_locked');
            lock.anchor.set(0.5);
            levelButton.addChild(lock);
        }        
    }

}