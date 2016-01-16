var IntroLayer = cc.Layer.extend({
    ctor:function(){
        this._super();
        var sprite = new cc.Sprite(res.intro_png);
        sprite.attr({
            x: cc.winSize.width/2,
            y: cc.winSize.height/2
        })
        this.addChild(sprite);

        this.initAudio();

        var lang = cc.sys.language;
        if ( lang != "zh" ) lang = "en";

        var vsItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("2player-menu.png"),
            cc.spriteFrameCache.getSpriteFrame("2player-menu.png"),
            function () {
                cc.audioEngine.playEffect(res.click_mp3, false);
                statistic.game = statistic.game || {};
                var playedOnce = statistic.game.vs || statistic.game["vs-ai"]
                if ( playedOnce && isTutorialPassed("main","betRateIncrease")) {
                    cc.director.runScene(new ModeSelectScene({mode: "vs"}));
                } else {
                    cc.director.runScene(new MainScene({
                        mode: "vs",
                        itemPool : INIT_ITEMS
                    }));
                }
            }, this);
        vsItem.attr({
            x: cc.winSize.width/2,
            y: -500,
            scaleX: 1.1,
            scaleY: 1.1,
            rotation: 0//-5
        });

        var vsAIItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("vs-ai-menu.png"),
            cc.spriteFrameCache.getSpriteFrame("vs-ai-menu.png"),
            function () {
                cc.audioEngine.playEffect(res.click_mp3,false);
                statistic.game = statistic.game || {};
                var playedOnce = statistic.game.vs || statistic.game["vs-ai"]
                if ( playedOnce && isTutorialPassed("main","betRateIncrease") ) {
                    cc.director.runScene(new ModeSelectScene({mode: "vs-ai"}));
                } else {
                    cc.director.runScene(new MainScene({
                        mode: "vs-ai",
                        itemPool : INIT_ITEMS
                    }));
                }
            }, this);
        vsAIItem.attr({
            x: cc.winSize.width/2,
            y: -500,
            scaleX: 1.1,
            scaleY: 1.1,
            rotation: 0//5
        });

        var helpItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("help-menu.png"),
            cc.spriteFrameCache.getSpriteFrame("help-menu.png"),
            function () {
                cc.audioEngine.playEffect(res.click_mp3,false);
                clearTutorial();
                cc.director.runScene(new MainScene({
                    mode: "vs",
                    itemPool : INIT_ITEMS
                }));
            }, this);
        helpItem.attr({
            x: cc.winSize.width/2,
            y: -500,
            scaleX: 1.1,
            scaleY: 1.1,
            rotation: 0//5
        });

        var dealTime = 0.5;
        var y = cc.winSize.height/2 - 100;
        vsItem.runAction(cc.sequence(cc.delayTime(0), cc.callFunc(function(){
            cc.audioEngine.playEffect(res.card_slide_mp3, false);
        },this), cc.spawn(
            cc.moveTo(dealTime, cc.winSize.width/2 - 120 - 15 + 30*Math.random(), y+Math.random()*50),
            cc.rotateTo(dealTime, -5 - Math.random()*10))))
        vsAIItem.runAction(cc.sequence(cc.delayTime(0.25), cc.callFunc(function(){
            cc.audioEngine.playEffect(res.card_slide_mp3, false);
        },this), cc.spawn(
            cc.moveTo(dealTime, cc.winSize.width/2-15+30*Math.random(), y+Math.random()*50),
            cc.rotateTo(dealTime, 5- Math.random()*10))))
        helpItem.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(function(){
            cc.audioEngine.playEffect(res.card_slide_mp3, false);
        },this), cc.spawn(
            cc.moveTo(dealTime, cc.winSize.width/2+120 - 15 + 30*Math.random(), y+Math.random()*50),
            cc.rotateTo(dealTime, 5+Math.random()*10))))

        var menu = new cc.Menu([vsItem, vsAIItem, helpItem]);
        menu.x = 0;
        menu.y = 0;
        this.addChild(menu);
    },
    initAudio:function(){
        var store = cc.sys.localStorage.getItem("poker_fighter.sound");
        if ( store != null ) {
            this.sound = store;
        } else {
            this.sound = 1;
        }
        cc.audioEngine.setEffectsVolume(this.sound);
    }
});

var IntroScene = cc.Scene.extend({
    onEnter:function () {
        this._super();

        var layer = new IntroLayer();
        this.addChild(layer);
    }
});