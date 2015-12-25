/**
 * Created by 赢潮 on 2015/10/29.
 */
var PauseMenuLayer = cc.LayerColor.extend({
    ctor:function(){
        this._super(colors.table);

        var resumeItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("resume-default.png"),
            cc.spriteFrameCache.getSpriteFrame("resume-press.png"),
            function () {
                cc.audioEngine.playEffect(res.click_mp3,false);
                cc.director.popScene();
            }, this);
        resumeItem.attr({
            x: cc.winSize.width/2,
            y: cc.winSize.height/8
        });

//        var infoItem = new cc.MenuItemImage(
//            cc.spriteFrameCache.getSpriteFrame("info-default.png"),
//            cc.spriteFrameCache.getSpriteFrame("info-press.png"),
//            function () {
//                cc.audioEngine.playEffect(res.click_mp3,false);
//                cc.director.pushScene( new HelpScene() );
//            }, this);
//        infoItem.attr({
//            x: cc.winSize.width/2,
//            y: cc.winSize.height*3/8
//        });

        var restartItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("restart-default.png"),
            cc.spriteFrameCache.getSpriteFrame("restart-press.png"),
            function () {
                cc.audioEngine.playEffect(res.click_mp3,false);
                saveStatistic();
                window.gameModel = null;
                cc.director.runScene(new MainScene(setting));
            }, this);
        restartItem.attr({
            x: cc.winSize.width/2,
            y: cc.winSize.height*3/8
        });

        var exitItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("exit-default.png"),
            cc.spriteFrameCache.getSpriteFrame("exit-press.png"),
            function () {
                cc.audioEngine.playEffect(res.click_mp3,false);
                saveStatistic();
                window.gameModel = null;
                cc.director.runScene(new IntroScene());
            }, this);
        exitItem.attr({
            x: cc.winSize.width/2,
            y: cc.winSize.height*5/8
        });

        this.muteItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("mute-default.png"),
            cc.spriteFrameCache.getSpriteFrame("mute-press.png"),
            function () {
                cc.audioEngine.playEffect(res.click_mp3,false);
                var store = cc.sys.localStorage.getItem("poker_fighter.sound");
                var sound = 0;
                if ( store != null ) {
                    sound = 1-store;
                } else {
                    sound = 0;
                }
                cc.sys.localStorage.setItem("poker_fighter.sound",sound);
                cc.audioEngine.setEffectsVolume(sound);
                this.renderMuteItem();
            }, this);
        this.renderMuteItem();
        this.muteItem.attr({
            x: cc.winSize.width/2,
            y: cc.winSize.height*7/8
        });


        var menu = new cc.Menu([exitItem, restartItem, resumeItem, this.muteItem ]);
        menu.x = 0;
        menu.y = 0;
        this.addChild(menu);
    },
    renderMuteItem:function(){
        var store = cc.sys.localStorage.getItem("poker_fighter.sound");
        var sound = 1;
        if ( store != null ) {
            sound = store;
        } else {
            sound = 0;
        }
        if ( sound != 0 ) { //"0"?
            this.muteItem.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("mute-default.png"));
            this.muteItem.setSelectedSpriteFrame(cc.spriteFrameCache.getSpriteFrame("mute-press.png"));
        } else {
            this.muteItem.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("unmute-default.png"));
            this.muteItem.setSelectedSpriteFrame(cc.spriteFrameCache.getSpriteFrame("unmute-press.png"));
        }
    }
})

var PauseMenuScene = cc.Scene.extend({
    ctor:function () {
        this._super();
        var layer = new PauseMenuLayer();
        this.addChild(layer);
    }
});