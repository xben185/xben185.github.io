//Menu
function createMenu()
{
    game.add.sprite(0, 0, 'start_menu_bg');

    //cat body
    var cat = game.add.sprite(314, 510, 'start_menu_atlas', 'cat'); //x: 350, y: 211
    cat.anchor.set(0.5);
    var cat_eyes_closed = game.add.sprite(0, -22, 'start_menu_atlas', 'cat_eyes_closed');
    cat_eyes_closed.anchor.set(0.5);    
    cat.addChild(cat_eyes_closed);
    cat_eyes_closed.visible = false;

    //cat body tweens
    //eyes
    game.time.events.loop(
        Phaser.Timer.SECOND * 2,
        function()
        {
            cat_eyes_closed.visible = true;
            game.time.events.add(Phaser.Timer.SECOND * 0.16, function() { cat_eyes_closed.visible = false; }, this);            
        },
        this);
    
    //body
    var catTweenBeginEnd = game.add.tween(cat).to({ x: 317, y: 241 }, 500, Phaser.Easing.Linear.None, false, 1000);    

    var catTween = game.add.tween(cat).to({ x: 319, y: 346 }, 500, Phaser.Easing.Linear.None, true, 500); //500
    catTween.onComplete.add(function() { catTweenBeginEnd.start(); }, this);   

    //title
    var title = game.add.sprite(319, 473, 'start_menu_atlas', 'title');
    title.anchor.set(0.5);

    //cat hands
    var cat_hand_r = game.add.sprite(275, 368, 'start_menu_atlas', 'cat_hand_r'); //289, 329
    cat_hand_r.anchor.set(0.5);

    var cat_hand_l = game.add.sprite(361, 366, 'start_menu_atlas', 'cat_hand_l'); //413, 332
    cat_hand_l.anchor.set(0.5);    

    var tweenCatHand = game.add.tween(cat_hand_r).to({ x: 266, y: 359 }, 500, Phaser.Easing.Linear.None, true, 500);
    tweenCatHand.onComplete.add(function() { game.add.tween(cat_hand_r).to({ x: 256, y: 362 }, 500, Phaser.Easing.Linear.None, true, 1000); }, this);
    tweenCatHand = game.add.tween(cat_hand_l).to({ x: 370, y: 364 }, 500, Phaser.Easing.Linear.None, true, 500);
    tweenCatHand.onComplete.add(function() { game.add.tween(cat_hand_l).to({ x: 380, y: 362 }, 500, Phaser.Easing.Linear.None, true, 1000); }, this);

    function catTweenAdd()
    {
        var delay = game.rnd.integerInRange(Phaser.Timer.SECOND, Phaser.Timer.SECOND * 3);
        game.add.tween(cat).to({ x: 317, y: 286 }, 600, Phaser.Easing.Linear.None, true, delay).onComplete.add(
            function()
            {
                var delay = game.rnd.integerInRange(Phaser.Timer.SECOND * 0.5, Phaser.Timer.SECOND * 2);
                game.add.tween(cat_hand_r).to({ x: 256, y: 362 }, 600, Phaser.Easing.Linear.None, true, delay);
                game.add.tween(cat_hand_l).to({ x: 380, y: 362 }, 600, Phaser.Easing.Linear.None, true, delay);
                game.add.tween(cat).to({ x: 317, y: 241 }, 600, Phaser.Easing.Linear.None, true, delay).onComplete.add(catTweenAdd, this);
            },
            this);

        game.add.tween(cat_hand_r).to({ x: 263, y: 359 }, 600, Phaser.Easing.Linear.None, true, delay);
        game.add.tween(cat_hand_l).to({ x: 370, y: 364 }, 600, Phaser.Easing.Linear.None, true, delay);
    }

    catTweenBeginEnd.onComplete.add(catTweenAdd, this);

    //plate
    game.add.sprite(319, 730, 'start_menu_atlas', 'plate').anchor.set(0.5);
    
    //leaves
    var leaves = game.add.sprite(115, 572, 'start_menu_atlas', 'leaves1');
    leaves.anchor.setTo(0.32, 0.74);
    leaves.scale.set(0.975);
    leaves.angle = 1.75;
    game.add.tween(leaves.scale).to({ x: 1.025, y: 1.025 }, 1900, Phaser.Easing.Linear.None, true, 0, Number.MAX_VALUE, true);
    game.add.tween(leaves).to({ angle: -1.75 }, 2800, Phaser.Easing.Linear.None, true, 0, Number.MAX_VALUE, true);

    leaves = game.add.sprite(520, 572, 'start_menu_atlas', 'leaves2');
    leaves.anchor.setTo(0.68, 0.74);
    leaves.scale.set(0.975);
    leaves.angle = -1.75;
    game.add.tween(leaves.scale).to({ x: 1.025, y: 1.025 }, 2000, Phaser.Easing.Linear.None, true, 0, Number.MAX_VALUE, true);
    game.add.tween(leaves).to({ angle: 1.75 }, 3000, Phaser.Easing.Linear.None, true, 0, Number.MAX_VALUE, true);

    //buttons
    //play
    var btnPlay = game.add.button(438, 723, 'start_menu_atlas', buttonPlayClick, this, 'btn_play_over', 'btn_play_normal', 'btn_play_pressed', 'btn_play_over');
    btnPlay.setDownSound(sfx_button);
    startSetupButton(btnPlay, true, 800);

    //more games
    var btnMoreGames = game.add.button(203, 724, 'start_menu_atlas', buttonMoreGamesClick, this, 'btn_more_games_over', 'btn_more_games_normal', 'btn_more_games_pressed', 'btn_more_games_over');
    btnMoreGames.setDownSound(sfx_button);
    startSetupButton(btnMoreGames, false, 600);

    function buttonPlayClick()
    {
        //SoftGames Hook
        SG_Hooks.start();
        //
        screenBlink(1.0, function() { game.state.start('level_select_state'); });
        sfx_start.play();
    }
    
    var btn = game.add.button(570, 80, 'start_menu_atlas', buttonCreatorsClick, this, 'btn_creators_normal', 'btn_creators_normal', 'btn_creators_pressed', 'btn_creators_normal');
    btn.setDownSound(sfx_button);
    startSetupButton(btn, false, 1000);
    
    //creators
    var creators = game.add.sprite(game.world.centerX, game.world.centerY, 'start_menu_atlas', 'creators');
    creators.anchor.set(0.5);
    creators.inputEnabled = true;
    creators.events.onInputDown.add(closeCreators, creators);
    creators.inputEnabled = false;
    creators.visible = false;

    function closeCreators()
    {        
        creators.inputEnabled = false;
        game.add.tween(creators.scale).to({ x: 0.1, y: 0.1 }, 800, Phaser.Easing.Elastic.In, true);
        game.add.tween(creators).to({ alpha: 0.0 }, 300, Phaser.Easing.Linear.None, true, 500).onComplete.add(function() { creators.visible = false; });
    }

    function buttonCreatorsClick()
    {
        if(!creators.inputEnabled)
        {            
            creators.inputEnabled = true;
            creators.visible = true;
            creators.alpha = 0.0;
            creators.scale.set(0.2);
            game.add.tween(creators.scale).to({ x: 1.0, y: 1.0 }, 800, Phaser.Easing.Elastic.Out, true);
            game.add.tween(creators).to({ alpha: 1.0 }, 400, Phaser.Easing.Linear.None, true);
        }
        else closeCreators();
    }

    screenBlink(0.0);
}

//
function startSetupButton(button, isPulsing, delay)
{
    button.anchor.set(0.5);    
    button.alpha = 0.0;
    var tweenAppear = game.add.tween(button).to({ alpha: 1.0 }, 300, Phaser.Easing.Linear.None, true, delay);
    if(isPulsing)
    {
        button.scale.set(0.95);
        game.add.tween(button.scale).to({ x: 1.1, y: 1.1 }, 500, Phaser.Easing.Linear.None, true, 0, Number.MAX_VALUE, true);
    }
    return tweenAppear;
}