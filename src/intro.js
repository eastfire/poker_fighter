var APPID = 1079424965;

var IntroLayer = cc.LayerColor.extend({
    ctor:function(){
        this._super(new cc.color(0x0,0x0,0x0));
//        this._super();
        var sprite = new cc.Sprite(res.intro_png);
        sprite.attr({
            x: cc.winSize.width/2,
            y: cc.winSize.height/2
        })
        this.addChild(sprite);

        this.initAudio();

        this.initTutorial();

        var lang = cc.sys.language;
        if ( lang != "zh" ) lang = "en";

        var vsItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("2player-menu.png"),
            cc.spriteFrameCache.getSpriteFrame("2player-menu.png"),
            function () {
                this.putStack(vsItem.x,vsItem.y,function(){
                    statistic.game = statistic.game || {};
                    var playedOnce = statistic.game.vs || statistic.game["vs-ai"]
                    if ( playedOnce ) {
                        cc.director.runScene(new ModeSelectScene({mode: "vs"}));
                    } else {
                        cc.director.runScene(new MainScene({
                            mode: "vs",
                            itemPool : INIT_ITEMS
                        }));
                    }
                })
            }, this);
        vsItem.attr({
            x: cc.winSize.width/2,
            y: -500,
            rotation: 0//-5
        });

        var vsAIItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("vs-ai-menu.png"),
            cc.spriteFrameCache.getSpriteFrame("vs-ai-menu.png"),
            function () {
                this.putStack(vsAIItem.x,vsAIItem.y,function() {
                    statistic.game = statistic.game || {};
                    var playedOnce = statistic.game.vs || statistic.game["vs-ai"]
                    if (playedOnce) {
                        cc.director.runScene(new ModeSelectScene({mode: "vs-ai"}));
                    } else {
                        cc.director.runScene(new MainScene({
                            mode: "vs-ai",
                            itemPool: INIT_ITEMS
                        }));
                    }
                })
            }, this);
        vsAIItem.attr({
            x: cc.winSize.width/2,
            y: -500,
            rotation: 0//5
        });

        var settingItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("setting-menu.png"),
            cc.spriteFrameCache.getSpriteFrame("setting-menu.png"),
            function () {
                this.putStack(settingItem.x,settingItem.y,function() {
                    cc.director.pushScene(new SettingScene());
                })
            }, this);
        settingItem.attr({
            x: cc.winSize.width/2,
            y: -500,
            rotation: 0
        });

        var heartItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("rate-menu.png"),
            cc.spriteFrameCache.getSpriteFrame("rate-menu.png"),
            function () {
                cc.audioEngine.playEffect(res.click_mp3, false);
                var url;
                //                if ( cc.sys.isNative ) {
                url = "http://itunes.apple.com/WebObjects/MZStore.woa/wa/viewContentsUserReviews?id=" + APPID + "&pageNumber=0&sortOrdering=2&type=Purple+Software&mt=8";
                //                } else {
                //                    url = "http://eastfire.github.io";
                //                }
                cc.sys.openURL(url);
            }, this);
        heartItem.attr({
            x: cc.winSize.width/2,
            y: -500,
            rotation: 0
        });

        var dealTime = 0.5;
        var y = cc.winSize.height/2 - 100;
        vsItem.runAction(cc.sequence(cc.delayTime(0), cc.callFunc(function(){
            cc.audioEngine.playEffect(res.card_slide_mp3, false);
        },this), cc.spawn(
            cc.moveTo(dealTime, cc.winSize.width/2 - 80 - 15 + 30*Math.random(), y+Math.random()*30),
            cc.rotateTo(dealTime, - Math.random()*10))))
        vsAIItem.runAction(cc.sequence(cc.delayTime(0.2), cc.callFunc(function(){
            cc.audioEngine.playEffect(res.card_slide_mp3, false);
        },this), cc.spawn(
            cc.moveTo(dealTime, cc.winSize.width/2 + 80-15+30*Math.random(), y+Math.random()*30),
            cc.rotateTo(dealTime, Math.random()*10))))
        settingItem.runAction(cc.sequence(cc.delayTime(0.4), cc.callFunc(function(){
            cc.audioEngine.playEffect(res.card_slide_mp3, false);
        },this), cc.spawn(
            cc.moveTo(dealTime, cc.winSize.width/2 - 80 - 15 + 30*Math.random(), y - 130 -Math.random()*30),
            cc.rotateTo(dealTime, -Math.random()*10))))
        heartItem.runAction(cc.sequence(cc.delayTime(0.6), cc.callFunc(function(){
            cc.audioEngine.playEffect(res.card_slide_mp3, false);
        },this), cc.spawn(
            cc.moveTo(dealTime, cc.winSize.width/2+80 - 15 + 30*Math.random(), y- 130-Math.random()*30),
            cc.rotateTo(dealTime, Math.random()*10))))

        var menu = new cc.Menu([vsItem, vsAIItem, settingItem,heartItem]);
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
    },
    initTutorial:function(){
        tutorialMap = null;
    },
    putStack:function(x,y,callback){
        if ( this.alreadyPutting ) return;
        this.alreadyPutting = true;

        cc.audioEngine.playEffect(res.chips2_mp3,false);

        var initY = y + 100;
        var interval = 0.06;
        var last = 5;
        var tokenHeight = 10;
        var tokens = [];
        for ( var i = 0; i < last; i++ ) {
            var tokenFrame = _.sample(["token-green.png","token-red.png","token-black.png"])
            var token = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame(tokenFrame))
            token.attr({
                x: x,
                y: initY,
                opacity: 0
            })
            this.addChild(token);
            token.runAction(new cc.sequence(
                new cc.delayTime(i*interval),
                new cc.fadeIn(0.01),
                new cc.moveTo(0.2, x, y+i*tokenHeight).easing(cc.easeOut(3.0)),
                i === last-1 ? new cc.callFunc(function(){
                    callback.call();
                }) : new cc.callFunc(function(){})
            ))
        }
    }
});

var IntroScene = cc.Scene.extend({
    onEnter:function () {
        this._super();

        var layer = new IntroLayer();
        this.addChild(layer);
    }
});