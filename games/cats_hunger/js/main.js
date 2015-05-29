//
window.AutoScaler = function(element, initialWidth, initialHeight, skewAllowance)
{    
    var self = this;    

    this.viewportWidth = 0;
    this.viewportHeight = 0;

    if(typeof element === "string") element = document.getElementById(element);

    this.element = element;
    this.gameAspect = initialWidth / initialHeight;
    this.skewAllowance = skewAllowance || 0;

    // Ensure our element is going to behave:
    self.element.style.display = 'block';
    self.element.style.margin = '0';
    self.element.style.padding = '0';

    if(window.innerWidth == self.viewportWidth && window.innerHeight == self.viewportHeight) return;

    var w = window.innerWidth;
    var h = window.innerHeight;

    var windowAspect = w / h;
    var targetW = 0;
    var targetH = 0;

    targetW = w;
    targetH = h;

    if(Math.abs(windowAspect - self.gameAspect) > self.skewAllowance)
    {
        if(windowAspect < self.gameAspect) targetH = w / self.gameAspect;
        else targetW = h * self.gameAspect;
    }

    self.element.style.width = targetW + "px";
    self.element.style.height = targetH + "px";

    self.element.style.marginLeft = ((w - targetW) / 2) + "px";
    self.element.style.marginTop = ((h - targetH) / 2) + "px";

    self.viewportWidth = w;
    self.viewportHeight = h;    
};

//
function emptyFunc() { }

//
var game = null;
var curtain_bmd = null;
var btn_restart = null;

//sfx
var sfx_button = null;
var sfx_cat_pick = null;
var sfx_error = null;
var sfx_nya_win = null;
var sfx_start = null;

//
var playerData = {
    levelsComplete: 0,
    currentLevel: 0,
    tutorialStep: 0
}

//
//Game states
var StartState = {
    create: startGame
}

var MenuState = {
    create: createMenu
}

var MainState = {
    create: createMain,
    update: updateMain
}

var LevelSelectState = {
    create: createLevelSelect,
    update: updateLevelSelect
}

var VictoryState = {
    create: createVictory
}

//
function init()
{
    setTimeout("window.scrollTo(0, 1)", 10);
    game = new Phaser.Game(634, 960, Phaser.CANVAS, 'catshunger-game', StartState);
}

//added
function pause(millis)
{   
    console.log('effecting pause')
    var date = new Date();
    var curDate = null;

    do{ curDate = new Date();}
    while(curDate-date<millis);

}

//
function startGame()
{    



    //scale stuff
    function scaleFix()
    {        
        window.AutoScaler('catshunger-game', 634, 960);
        game.scale.setShowAll();
        game.scale.refresh();        
    }    

    function onEnterIncorrectOrientation()
    {
        document.getElementById('incorrect-orientation').style.display = 'block';
        document.body.style.marginBottom = "0px";
    }


    function onLeaveIncorrectOrientation()
    {
        document.getElementById('incorrect-orientation').style.display = 'none';
        setTimeout("window.scrollTo(0, 1)", 10);        
    }

    if(!game.device.desktop)
    {        
        game.scale.forceOrientation(false, true);
        game.scale.enterIncorrectOrientation.add(onEnterIncorrectOrientation, this);
        game.scale.leaveIncorrectOrientation.add(onLeaveIncorrectOrientation, this);
    }

    game.scale.hasResized.add(scaleFix, this);    
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.setShowAll();    
    game.scale.setScreenSize(true);    
    game.scale.refresh();

    //
    game.stage.backgroundColor = '#000000';
    game.stage.disableVisibilityChange = true;

    game.state.add('menu_state', MenuState);
    game.state.add('level_select_state', LevelSelectState);
    game.state.add('main_state', MainState);
    game.state.add('victory_state', VictoryState);

    game.load.onLoadStart.add(loadStart, this);
    pause(2001)
    game.load.onFileComplete.add(fileComplete, this);
    game.load.onLoadComplete.add(loadComplete, this);

    //SoftGames hooks
    var lang = SG.lang;
    SG_Hooks.setOrientationHandler(onEnterIncorrectOrientation);
    SG_Hooks.setResizeHandler(scaleFix);

    //load assets    
    game.load.json('text_help', 'text/' + lang + '.json');


    game.load.image('sg_logo', 'assets/logo_ingame_620.png'); //load Sg logo
    game.load.image('home_button', 'assets/home-button.png'); //add home
    game.load.image('start_menu_bg', 'assets/start_menu_bg.jpg');
    game.load.image('level_map_bg', 'assets/level_map_bg.jpg');
    game.load.image('bg_main', 'assets/bg_main.jpg');    
    game.load.image('curtain', 'assets/curtain.jpg');
    

    game.load.atlas('start_menu_atlas', 'assets/start_menu_atlas.png', 'assets/start_menu_atlas.json');
    game.load.atlas('atlas', 'assets/atlas.png', 'assets/atlas.json');
    game.load.atlas('victory_atlas', 'assets/victory_atlas.png', 'assets/victory_atlas.json');
    game.load.atlas('help_atlas', 'assets/help_atlas.png', 'assets/help_atlas.json');

    if(game.device.webAudio)
    {
        game.load.audio('music', ['assets/sfx/music.mp3', 'assets/sfx/music.ogg']);
        game.load.audio('sfx_button', ['assets/sfx/sfx_button.mp3', 'assets/sfx/sfx_button.ogg']);
        game.load.audio('sfx_cat_pick', ['assets/sfx/sfx_cat_pick.mp3', 'assets/sfx/sfx_cat_pick.ogg']);
        game.load.audio('sfx_error', ['assets/sfx/sfx_error.mp3', 'assets/sfx/sfx_error.ogg']);
        game.load.audio('sfx_nya_win', ['assets/sfx/sfx_nya_win.mp3', 'assets/sfx/sfx_nya_win.ogg']);
        game.load.audio('sfx_start', ['assets/sfx/sfx_start.mp3', 'assets/sfx/sfx_start.ogg']);
    }

    game.load.binary('levels', 'assets/levels.bin');
    
    //
    game.load.start();
}

//
function loadStart()
{

    loadText = game.add.text(game.world.centerX, game.world.centerY, '', { fill: '#ffffff' });
    loadText.anchor.setTo(0.5, 0.5);
}


//
function fileComplete(progress, cacheKey, success, totalLoaded, totalFiles)
{
    var loadImage = game.add.sprite(game.world.centerX, 250, 'sg_logo');
    loadImage.anchor.set(0.5);
    loadImage.inputEnabled = true;
    loadImage.events.onInputDown.add(listener, this);

    loadText.setText(progress + "%");

}

function listener () 
{
   // window.open("http://m.softgames.de", "_blank")
   //alert("4399");
}

//
function loadComplete()
{
    if(game.device.webAudio)
    {
        var music = game.add.audio('music');
        music.onDecoded.add(function() { music.play("", 0, 1, true); }, this);
    }
    
    //sfx
    sfx_button = game.add.audio('sfx_button');  
    sfx_cat_pick = game.add.audio('sfx_cat_pick');
    sfx_error = game.add.audio('sfx_error');
    sfx_nya_win = game.add.audio('sfx_nya_win');
    sfx_start = game.add.audio('sfx_start');

    //
    parseLevels();

    //game.device.localStorage = false;
    //
    if(game.device.localStorage)
    {
        var saveData = localStorage.getItem('catshungersavegame');
        if(saveData) playerData = JSON.parse(saveData);
    }

    //
    game.onFocus.add(onFocusFixFishAnim, game);

    //
    game.state.start('menu_state');
}

//Main
function createMain()
{
    game.add.sprite(0, 0, 'bg_main');

    //buttons
    btn_restart = game.add.button(66, 64, 'atlas', restartLevel, this, 'btn_restart', 'btn_restart', 'btn_restart_down', 'btn_restart');
    btn_restart.anchor.set(0.5);
    btn_restart.setDownSound(sfx_button);     
    createLevelBlock(570, 60, 'level_select_complete_b', playerData.currentLevel + 1);

    //
    createPreys();
    createReapers();

    reapingSpreadPool.Create(6);

    //
    if(game.device.webAudio) createSoundButton();

    //
    checkTutorialNeed();

    //
    screenBlink(0.0);
}

//
function updateMain()
{
    if(reapingSpreadPool.isReapingNow) reapingSpreadPool.update();
    if(draggableReaper) reaperDrag();
}

//
function levelComplete()
{
    if(playerData.currentLevel === playerData.levelsComplete)
    {
        playerData.levelsComplete += 1;
        if(game.device.localStorage) localStorage.setItem('catshungersavegame', JSON.stringify(playerData));
    }
    btn_restart.inputEnabled = false; 
    game.time.events.add(Phaser.Timer.SECOND, function() { game.state.start('victory_state'); }, this);
    sfx_nya_win.play();
}


function soundDown() 
{
    game.sound.volume = 0
}

function soundUp()
{
    game.sound.volume = 2
}


//VictoryState
function createVictory()
{   
    //sound off
    soundDown();

    //SoftGames Hook
    SG_Hooks.levelUp(playerData.currentLevel + 1, (playerData.levelsComplete) * 100,function(){soundUp()}); //sound on
    //


    game.add.sprite(0, 0, 'start_menu_bg');

    //tasty
    var tasty = game.add.sprite(302, 140, 'victory_atlas', 'Tasty_frame01');
    tasty.anchor.set(0.5);

    var framesAnim = Phaser.Animation.generateFrameNames('Tasty_frame', 1, 9, '', 2);
    tasty.animations.add('tasty', framesAnim, 24);
    tasty.animations.play('tasty');    
    tasty.scale.setTo(0.4, 0.8);
    game.add.tween(tasty.scale).to({ x: 1.0, y: 1.0 }, 800, Phaser.Easing.Elastic.Out, true, 100);
    game.time.events.loop(3000, function() { tasty.animations.play('tasty'); }, this);

    //rays
    var rays = game.add.sprite(307, 400, 'victory_atlas', 'rays');
    rays.anchor.set(0.5);    
    game.add.tween(rays.scale).to({ x: 1.2, y: 1.2 }, 1000, Phaser.Easing.Linear.None, true, 0, Number.MAX_VALUE, true);
    rays.update = function() { this.rotation += 0.0003 * game.time.elapsed; };

    //cat
    var cat = game.add.sprite(317, 411, 'start_menu_atlas', 'tasty_cat');
    cat.anchor.set(0.5);
    game.add.tween(cat).to({ y: 420 }, 2200, Phaser.Easing.Linear.None, true, 0, Number.MAX_VALUE, true);

    //plate
    game.add.sprite(319, 690, 'start_menu_atlas', 'plate').anchor.set(0.5);

    //cat hands
    var cat_hand_r = game.add.sprite(257, 524, 'start_menu_atlas', 'cat_hand_r');
    cat_hand_r.anchor.set(0.5);
    var cat_hand_l = game.add.sprite(379, 522, 'start_menu_atlas', 'cat_hand_l');
    cat_hand_l.anchor.set(0.5);

    //
    var isGameComplete = playerData.levelsComplete === levelsData.length && playerData.currentLevel === levelsData.length - 1;

    var btn = game.add.button(203, 684, 'start_menu_atlas', levelSelectClick, this, 'btn_LevSel_main', 'btn_LevSel_main', 'btn_LevSel_pressed', 'btn_LevSel_main');
    btn.anchor.set(0.5);
    btn.scale.set(0.4);
    btn.visible = false;
    game.add.tween(btn.scale).to({ x: 1.0, y: 1.0 }, 800, Phaser.Easing.Elastic.Out, true, 250).onStart.add(function() { btn.visible = true; });

    if(isGameComplete)
    {
        soundDown(); //sound off
        SG_Hooks.gameOver(playerData.levelsComplete, playerData.levelsComplete * 100, function(){soundUp()});//sound on
        btn.y = 690;
    }
    else(!isGameComplete)
    {
        function nextClick(button)
        {
            playerData.currentLevel += 1;
            screenBlink(1.0, function() { game.state.start('main_state'); });
            sfx_button.play();
        }

        var btnNext = game.add.button(438, 683, 'start_menu_atlas', nextClick, this, 'btn_next_main', 'btn_next_main', 'btn_next_pressed', 'btn_next_main');
        btnNext.anchor.set(0.5);
        btnNext.scale.set(0.4);
        btnNext.visible = false;
        game.add.tween(btnNext.scale).to({ x: 1.0, y: 1.0 }, 800, Phaser.Easing.Elastic.Out, true, 400).onStart.add(function() { btnNext.visible = true; });
    }

    function levelSelectClick()
    {
        screenBlink(1.0, function() { game.state.start('level_select_state'); });
        sfx_button.play();
    }    
}

//screen blink
function screenBlink(targetAlpha, onComplete)
{
    var curtain = game.add.sprite(0, game.camera.y, 'curtain');
    curtain.alpha = 1.0 - targetAlpha;
    function end() { if(curtain.alpha === 0.0) curtain.destroy(); if(onComplete) onComplete(); }
    game.add.tween(curtain).to({ alpha: targetAlpha }, 300, Phaser.Easing.Linear.None, true).onComplete.add(end, game);
}

//buttons
function createSoundButton()
{
    var btn = game.add.button(game.world.centerX, 60, 'atlas', buttonSoundClick, this, 'btn_sound', 'btn_sound', 'btn_sound_down', 'btn_sound');
    if(game.sound.mute) btn.setFrames('btn_sound_off', 'btn_sound_off', 'btn_sound_off_down', 'btn_sound_off');
    btn.anchor.set(0.5);    
    return btn;
}

//
function buttonSoundClick(button)
{
    game.sound.mute = !game.sound.mute;
    if(game.sound.mute) button.setFrames('btn_sound_off', 'btn_sound_off', 'btn_sound_off_down', 'btn_sound_off');
    else button.setFrames('btn_sound', 'btn_sound', 'btn_sound_down', 'btn_sound');
}

function createHomeButton()
{
    var btn = game.add.button(100, 100, 'home_button', homeButtonClick)
    return btn;
}

function homeButtonClick()
{
    game.state.start('menu_state');
}