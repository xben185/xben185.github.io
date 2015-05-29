//
var reapers = null;
var draggableReaper = null;
var pointerOffset = { x: 0, y: 0 };

var preys = null;
var reapingsCount = 0;
var maxReapingsCount = 0;
var usingReapersCount = 0;
var isSpreadImmediately = false;
var prevFirstPreyShow = null;

//Preys
var CreatePrey = function(x, y, group, preyData)
{
    this.type = preyData.type;
    this.property = preyData.property;
    this.left = null;
    this.top = null;
    this.right = null;
    this.bottom = null;
    this.frame = '';       
    this.bReaped = false;
    this.tween = null;
    
    switch(this.type)
    {
        case 1: this.frame = 'Fish_anim_00'; break;
        case 2: this.frame = 'prey_blocker'; break;
        case 3: this.frame = 'prey_turn_90'; break;
        case 4: this.frame = 'prey_tplug'; break;
    }

    this.sprite = group.create(x, y, 'atlas', this.frame);
    this.sprite.anchor.set(0.5);

    //
    this.stop_pulse = false;
    this.tween_pulse = game.add.tween(this.sprite.scale).to({ x: 0.85, y: 0.85 }, 200, Phaser.Easing.Linear.None, true, 0, Number.MAX_VALUE, true);
    this.tween_pulse.onLoop.add(function() { if(this.stop_pulse && this.sprite.scale.x === 1.0) this.tween_pulse.pause(); }, this);
    this.tween_pulse.pause();

    if(this.type === 1)
    {
        var framesAnim = Phaser.Animation.generateFrameNames('Fish_anim_', 0, 23, '', 2);        
        this.animation = this.sprite.animations.add('fish_glow', framesAnim, 30, false);
        this.animation.onComplete.add(function() { this.animation.setFrame(this.frame); }, this);              
    }
    else if(this.type === 3 || this.type === 4) this.tween = game.add.tween(this.sprite).to({ angle: 0 }, 200, Phaser.Easing.Linear.None, false);    

    //
    this.reset = function()
    {
        this.bReaped = false;
        this.sprite.frameName = this.frame;        
    };

    this.totalReset = function()
    {
        this.reset();
        this.sprite.visible = true;
    };

    this.getNext = function(reapDirection)
    {
        switch(reapDirection)
        {
            case 0: return this.left;
            case 1: return this.top;
            case 2: return this.right;
            case 3: return this.bottom;
        }
        return null;
    };   

    this.reap = function(reapSpread)
    {
        if(++reapingsCount > maxReapingsCount) return null;
        
        if(this.type === 1 && !this.bReaped)
        {
            if(this.animation.isPlaying) this.animation.stop();            
            this.sprite.frameName = 'reaper_basic';
            this.bReaped = true;
        }

        switch(this.type)
        {            
            case 2: this.sprite.frameName = 'prey_blocker_full'; return null;

            case 3:
                reapSpread.direction += 1;
                if(reapSpread.direction > 3) reapSpread.direction -= 4;
                break;

            case 4: this.reapTPlug(reapSpread); break;            
        }

        return this.getNext(reapSpread.direction);
    };

    this.reapTPlug = function(reapSpread)
    {
        var direction = reapSpread.direction - 1;
        if(direction < 0) direction += 4;
        var firstPrey = this.getNext(direction);
        if(firstPrey) reapingSpreadPool.add(this, direction, isSpreadImmediately ? 0 : 75);
        //
        reapSpread.direction += 1;
        if(reapSpread.direction > 3) reapSpread.direction -= 4;
    };

    this.showPulse = function(direction)
    {
        if(++reapingsCount > maxReapingsCount) return null;       

        if(this.type != 1 || !this.bReaped)
        {
            this.stop_pulse = false;
            this.tween_pulse.resume();
        }

        switch(this.type)
        {
            case 1: return this.getNext(direction);

            case 2: break;

            case 3:
                this.checkTurnTube(direction, 0);
                this.showingDirectionTurnRight(direction);                
                break;

            case 4:
                this.checkTurnTube(direction, 90);
                this.showingDirectionTurnLeft(direction);                              
                this.showingDirectionTurnRight(direction);
                break;
        }

        return null;        
    };

    this.showingDirectionTurnRight = function(direction)
    {
        if(++direction > 3) direction -= 4;
        var nextPrey = this.getNext(direction);
        if(nextPrey) startShowSpread(nextPrey, direction);
    };

    this.showingDirectionTurnLeft = function(direction)
    {
        if(--direction < 0) direction += 4;
        var nextPrey = this.getNext(direction);
        if(nextPrey) startShowSpread(nextPrey, direction);
    };

    this.turnTube = function(angle)
    {
        if(this.tween._valuesEnd.angle === angle) return;
        this.tween._valuesStart.angle = this.sprite.angle;
        this.tween._valuesEnd.angle = angle;
        if(!this.tween.isRunning) this.tween.start();        
    };

    this.checkTurnTube = function(direction, add)
    {
        switch(direction)
        {
            case 0: this.turnTube(0 + add); break;
            case 1: this.turnTube(90 + add); break;
            case 2: this.turnTube(180 + add); break;
            case 3: this.turnTube(-90 + add); break;
        }
    };   

    return this;
};

function createPreys()
{
    var minLeft = game.world.width;
    var maxRight = 0;
    var minTop = game.world.height;
    var maxBottom = 0;

    var cellSize = 76;
    var rows = 8;
    var cols = 8;

    var level = levelsData[playerData.currentLevel];
    var i = 0;

    var x = 0;
    var y = 0;

    var emptyTiles = game.add.group();
    var preySprites = game.add.group();

    preys = null;
    preys = new Array();

    for(var r = 0; r < rows; r++)
    {
        for(var c = 0; c < cols; c++)
        {
            i = r * cols + c;
            if(level.preys[i].type > 0)
            {
                emptyTiles.create(x, y, 'atlas', 'empty_tile').anchor.set(0.5);

                preys.push(new CreatePrey(x, y, preySprites, level.preys[i]));
                var prey = preys[preys.length - 1];                

                //definiton sides
                i = preys.length - 2;
                if(i >= 0)
                {
                    //left-right
                    if(preys[i].sprite.y === prey.sprite.y)
                    {
                        prey.left = preys[i];
                        preys[i].right = prey;
                    }                                       

                    //top-bottom
                    while(i >= 0)
                    {
                        if(preys[i].sprite.x === prey.sprite.x)
                        {
                            prey.top = preys[i];
                            preys[i].bottom = prey;
                            break;
                        }
                        else i--;
                    }
                }

                //
                if(minLeft > x) minLeft = x;
                if(maxRight < x) maxRight = x;
                if(minTop > y) minTop = y;
                if(maxBottom < y) maxBottom = y;
            }

            x += cellSize;
        }       

        x = 0;
        y += cellSize;
    }

    //align
    var h_offsetAlign = (game.world.width - (maxRight - minLeft)) * 0.5 - minLeft;
    var v_offsetAlign = (game.world.height - 300 - (maxBottom - minTop)) * 0.5 - minTop;
    
    for(var i = 0; i < preys.length; i++)
    {
        emptyTiles.getAt(i).x += h_offsetAlign;
        preys[i].sprite.x += h_offsetAlign;
        emptyTiles.getAt(i).y += v_offsetAlign;
        preys[i].sprite.y += v_offsetAlign;
    }

    //
    function glowFish()
    {
        var prey = null;
        for(var i = 0; i < preys.length; ++i)
        {
            prey = preys[i];
            if(prey.type === 1 && !prey.bReaped) prey.animation.play();
        }
    }
    game.time.events.loop(4000, glowFish, this);

    //
    maxReapingsCount = rows * cols;
    reapingsCount = 0;
}

//Reapers
function CreateReaperArrowSprite(basicSprite, angle)
{
    var sprite = game.add.sprite(0, 0, 'atlas', 'arrow');
    sprite.anchor.setTo(0.5, -1.05);
    sprite.angle = angle;
    basicSprite.addChild(sprite);
    return sprite;
}

var CreateReaper = function(x, y, reaperData)
{
    this.basic_sprite = game.add.sprite(x, y, 'atlas', 'reaper_basic');
    this.basic_sprite.anchor.set(0.5);    

    this.basic_sprite.baseX = x;
    this.basic_sprite.baseY = y;
    this.basic_sprite.reaper = this;

    this.left_sprite = reaperData.left ? CreateReaperArrowSprite(this.basic_sprite, 90) : null;
    this.top_sprite = reaperData.top ? CreateReaperArrowSprite(this.basic_sprite, 180) : null;
    this.right_sprite = reaperData.right ? CreateReaperArrowSprite(this.basic_sprite, -90) : null;
    this.bottom_sprite = reaperData.bottom ? CreateReaperArrowSprite(this.basic_sprite, 0) : null; 
    
    this.isSingle = (!reaperData.left && !reaperData.top && !reaperData.right && !reaperData.bottom);    

    this.firstPrey = null;  

    this.basic_sprite.inputEnabled = true;
    this.basic_sprite.events.onInputDown.add(reaperOnInputDown, this.basic_sprite);
    this.basic_sprite.events.onInputUp.add(reaperOnInputUp, this.basic_sprite);    

    this.basic_sprite.scale.set(0.95);

    game.add.tween(this.basic_sprite.scale).to({ x: 1.05, y: 1.05 }, 500, Phaser.Easing.Linear.None, true, 0, Number.MAX_VALUE, true);

    this.startReap = function(firstPrey, delay)
    {
        firstPrey.sprite.visible = false;
        firstPrey.bReaped = true;

        this.visibleArrow(false);
        this.basic_sprite.x = firstPrey.sprite.x;
        this.basic_sprite.y = firstPrey.sprite.y;
        this.firstPrey = firstPrey;

        reapingSpreadPool.startSpread(this, delay);
    };

    this.visibleArrow = function(value)
    {
        if(this.left_sprite) this.left_sprite.visible = value;
        if(this.top_sprite) this.top_sprite.visible = value;
        if(this.right_sprite) this.right_sprite.visible = value;
        if(this.bottom_sprite) this.bottom_sprite.visible = value;
    };

    this.reset = function()
    {
        this.firstPrey = null;
        this.basic_sprite.frameName = 'reaper_basic';
        this.basic_sprite.x = this.basic_sprite.baseX;
        this.basic_sprite.y = this.basic_sprite.baseY;
        this.visibleArrow(true);
    };

    return this;
};

function createReapers()
{
    var level = levelsData[playerData.currentLevel];
    
    var s = 140;
    var x = (game.world.width - s * (level.reapers.length - 1)) * 0.5;
    var y = game.world.height;
    for(var i = 0; i < preys.length; i++) if(y > preys[i].sprite.y) y = preys[i].sprite.y;
    y -= 120;
    
    //
    reapers = null;
    reapers = new Array(level.reapers.length);

    for(var i = 0; i < level.reapers.length; i++)
    {
        reapers[i] = new CreateReaper(x, y, level.reapers[i]);
        x += s;
    }        

    usingReapersCount = 0;
    draggableReaper = null;
    isSpreadImmediately = false;    
}

function reaperDrag()
{
    draggableReaper.x = pointerOffset.x + game.input.activePointer.x;
    draggableReaper.y = pointerOffset.y + game.input.activePointer.y;
    
    var idxStartReap = getIdxStartReap();
    if(idxStartReap >= 0 && preys[idxStartReap].type === 1 && !preys[idxStartReap].bReaped) showReapWay(preys[idxStartReap]);
    else if(prevFirstPreyShow)
    {
        stopPulsePreys();
        prevFirstPreyShow = null;
    }
}

function showReapWay(startPrey)
{
    if(prevFirstPreyShow != startPrey)
    {        
        stopPulsePreys();
        reapingsCount = 0;
        if(draggableReaper.reaper.isSingle) startShowSpread(startPrey, -1);
        else
        {
            if(draggableReaper.reaper.left_sprite) startShowSpread(startPrey, 0);
            if(draggableReaper.reaper.top_sprite) startShowSpread(startPrey, 1);
            if(draggableReaper.reaper.right_sprite) startShowSpread(startPrey, 2);
            if(draggableReaper.reaper.bottom_sprite) startShowSpread(startPrey, 3);
        }
        prevFirstPreyShow = startPrey;
    }    
}

function stopPulsePreys()
{
    for(var i = 0; i < preys.length; ++i) preys[i].stop_pulse = true;   
}

function startShowSpread(prey, direction)
{
    while(prey) prey = prey.showPulse(direction);
}

function reaperOnInputDown()
{
    if(!this.inputEnabled) return;

    if(this.reaper.firstPrey)
    {
        this.reaper.visibleArrow(true);
        this.reaper.firstPrey.sprite.visible = true;
        this.reaper.firstPrey = null;

        --usingReapersCount;
        preysResetReap();
    }
    pointerOffset.x = this.x - game.input.activePointer.x;
    pointerOffset.y = this.y - game.input.activePointer.y;
    this.frameName = 'reaper_wow';
    draggableReaper = this;
    prevFirstPreyShow = null;
    game.world.bringToTop(this);
    sfx_cat_pick.play();
}

function reaperOnInputUp()
{    
    var idxStartReap = getIdxStartReap();    

    this.frameName = 'reaper_basic';

    stopPulsePreys();

    if(idxStartReap >= 0)
    {
        if(preys[idxStartReap].bReaped || preys[idxStartReap].type != 1)
        {
            reaperBeginReturn(this);
            sfx_error.play();
        }
        else
        {
            ++usingReapersCount;
            this.reaper.startReap(preys[idxStartReap], 75);
            if(helps) tutorialNextStep();
        }
    }
    else reaperBeginReturn(this);   
    
    draggableReaper = null;
}

function getIdxStartReap()
{
    var minDistance = 60;
    var distance = 0;
    var idxStartReap = -1;

    for(var i = 0; i < preys.length; ++i)
    {
        distance = Phaser.Point.distance(draggableReaper, preys[i].sprite);
        if(distance < minDistance)
        {
            minDistance = distance;
            idxStartReap = i;
        }
    }

    return idxStartReap;
}

function reaperBeginReturn(reaper_base_sprite)
{
    var target = new Phaser.Point(reaper_base_sprite.baseX, reaper_base_sprite.baseY);
    var delay = Phaser.Point.distance(reaper_base_sprite, target) * 0.6;    
    if(delay > 0) game.add.tween(reaper_base_sprite).to(target, delay, Phaser.Easing.Linear.None, true);
    if(helps && usingReapersCount === 0) tutorialPreviosStep();
}

function preysResetReap()
{    
    var i = 0;
    reapingSpreadPool.stop();
    for(; i < preys.length; ++i) preys[i].reset();
    for(i = 0; i < reapers.length; ++i)
    {
        reapers[i].basic_sprite.frameName = 'reaper_basic';
        if(reapers[i].firstPrey) reapers[i].startReap(reapers[i].firstPrey, 0);
    }
}

function checkReaping()
{    
    for(var i = 0; i < preys.length; ++i)
    {
        if(preys[i].type === 1 && !preys[i].bReaped)
        {
            if(usingReapersCount === reapers.length) setEmotions('reaper_sad');
            return;
        }
    }    
    levelWin();    
}

function levelWin()
{
    for(var i = 0; i < reapers.length; ++i) reapers[i].basic_sprite.inputEnabled = false;    
    setEmotions('reaper_nya');
    levelComplete();
}

function setEmotions(frameName)
{    
    var i = 0;
    for(; i < preys.length; ++i) if(preys[i].bReaped && preys[i].sprite.visible) preys[i].sprite.frameName = frameName;
    for(i = 0; i < reapers.length; ++i) reapers[i].basic_sprite.frameName = frameName;    
}

//Reaping Spread
var CreateReapingSpread = function()
{
    this.direction = 0;
    this.delay = 0;
    this.timeElapsed = 0;
    this.currentPrey = null;
    this.idxInPool = 0;
    this.done = false;    

    this.startReaping = function(firstPrey, direction, delay, idxInPool)
    {
        this.currentPrey = firstPrey.getNext(direction);
        if(this.currentPrey)
        {
            this.direction = direction;            
            this.idxInPool = idxInPool;
            if(delay === 0) this.spreadImmediately();
            else
            {
                this.delay = delay;
                if(this.currentPrey.bReaped || this.currentPrey.type > 2) this.timeElapsed = delay;
                else this.timeElapsed = 0;
                this.done = false;
            }            
        }
        else reapingSpreadPool.remove(idxInPool);
    };   

    this.update = function()
    {
        this.timeElapsed += game.time.elapsed;
        if(this.timeElapsed >= this.delay)
        {
            this.currentPrey = this.currentPrey.reap(this);
            if(this.currentPrey)
            {
                if(!this.currentPrey.bReaped && this.currentPrey.type <= 2) this.timeElapsed = 0;
            }
            else this.done = true;
        }
    };
    
    this.spreadImmediately = function()
    {
        isSpreadImmediately = true;
        while(this.currentPrey) this.currentPrey = this.currentPrey.reap(this);
        reapingSpreadPool.remove(this.idxInPool);
        isSpreadImmediately = false;
    };

    this.copyFrom = function(reapingSpread)
    {
        this.direction = reapingSpread.direction;        
        this.delay = reapingSpread.delay;
        this.timeElapsed = reapingSpread.timeElapsed;
        this.currentPrey = reapingSpread.currentPrey;        
        this.done = reapingSpread.done;
    };
};

var reapingSpreadPool = {

    reapingSpread: [],    
    free: 0,    
    isReapingNow: false,

    Create: function(count)
    {
        this.reapingSpread = new Array(count);
        for(var i = 0; i < count; i++) this.reapingSpread[i] = new CreateReapingSpread();        
        this.free = 0;        
        this.isReapingNow = false;
    },

    add: function(firstPrey, direction, delay)
    {
        if(this.free < this.reapingSpread.length)
        {            
            this.isReapingNow = true;
            this.reapingSpread[this.free++].startReaping(firstPrey, direction, delay, this.free - 1);                       
        }
    },

    remove: function(idxInPool)
    {
        --this.free;

        if(idxInPool !== this.free) this.reapingSpread[idxInPool].copyFrom(this.reapingSpread[this.free]);        

        if(btn_restart.inputEnabled && this.free === 0)
        {
            this.isReapingNow = false;            
            checkReaping();
        }
    },

    startSpread: function(reaper, delay)
    {
        reapingsCount = 0;
        if(reaper.isSingle) this.add(reaper.firstPrey, -1, 0);
        else
        {
            if(reaper.left_sprite) this.add(reaper.firstPrey, 0, delay);
            if(reaper.top_sprite) this.add(reaper.firstPrey, 1, delay);
            if(reaper.right_sprite) this.add(reaper.firstPrey, 2, delay);
            if(reaper.bottom_sprite) this.add(reaper.firstPrey, 3, delay);
        }
    },

    update: function()
    {
        for(var i = 0; i < this.free;)
        {
            this.reapingSpread[i].update();
            if(this.reapingSpread[i].done) this.remove(i);
            else ++i;                     
        }
    },

    stop: function()
    {
        this.free = 0;
        this.isReapingNow = false;        
    }
};

//
function restartLevel()
{
    var i = 0;
    reapingSpreadPool.stop();
    for(; i < preys.length; ++i) preys[i].totalReset();
    for(i = 0; i < reapers.length; ++i) reapers[i].reset();
    usingReapersCount = 0;
    draggableReaper = null;
    if(helps) tutorialPreviosStep();
}

//
function onFocusFixFishAnim()
{
    if(game.state.current === 'main_state')
        for(var i = 0; i < preys.length; ++i)
            if(preys[i].type === 1 && !preys[i].bReaped) preys[i].sprite.frameName = preys[i].frame;
}