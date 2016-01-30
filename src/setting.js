var SettingLayer = PlayerRotateLayer.extend({
    ctor:function(){
        this._super({disableRotate:true});

        this.menuArray = [];

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

        this.tutorialItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("tutorial-on.png"),
            cc.spriteFrameCache.getSpriteFrame("tutorial-on.png"),
            function () {
                cc.audioEngine.playEffect(res.click_mp3,false);
                if ( tutorialPassed.off ) {
                    clearTutorial();
                    tutorialPassed.off = false;
                } else {
                    tutorialPassed.off = true;
                }
                saveTutorial();
                this.renderTutorialItem();
            }, this);
        this.renderTutorialItem();
        this.tutorialItem.attr({
            x: cc.winSize.width/2,
            y: cc.winSize.height*5/8
        });

        this.menuArray = [this.tutorialItem, this.muteItem ]

        var y = cc.winSize.height*1/8
        this.addChild(this.langSelectLabel = this.makeLabel("", cc.winSize.width/2, y+40, 24))
        this.sysLang = this.renderButtonGroup(cc.winSize.width/2-90, y, 0, function(){
            cc.audioEngine.playEffect(res.click_mp3,false);
            cc.sys.localStorage.removeItem("poker_fighter.lang")
            initTexts();
            this.renderLangItem();
        });
        this.zhLang = this.renderButtonGroup(cc.winSize.width/2, y, 1, function(){
            cc.audioEngine.playEffect(res.click_mp3,false);
            cc.sys.localStorage.setItem("poker_fighter.lang","zh")
            initTexts();
            this.renderLangItem();
        });
        this.enLang = this.renderButtonGroup(cc.winSize.width/2+90, y, 2, function(){
            cc.audioEngine.playEffect(res.click_mp3,false);
            cc.sys.localStorage.setItem("poker_fighter.lang","en")
            initTexts();
            this.renderLangItem();
        });
        this.addChild( this.sysLangLabel = this.makeLabel("", cc.winSize.width/2-90, y, 20));
        this.addChild( this.makeLabel(texts.zhLang, cc.winSize.width/2, y, 20));
        this.addChild( this.makeLabel(texts.enLang, cc.winSize.width/2+90, y, 20));
        this.renderLangItem();

        var menu = new cc.Menu(this.menuArray);
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
    },
    renderTutorialItem:function(){
        if ( !tutorialPassed.off ) {
            this.tutorialItem.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("tutorial-on.png"));
            this.tutorialItem.setSelectedSpriteFrame(cc.spriteFrameCache.getSpriteFrame("tutorial-on.png"));
        } else {
            this.tutorialItem.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("tutorial-off.png"));
            this.tutorialItem.setSelectedSpriteFrame(cc.spriteFrameCache.getSpriteFrame("tutorial-off.png"));
        }
    },
    renderLangItem:function(){
        var lang = cc.sys.localStorage.getItem("poker_fighter.lang")
        if ( lang ) {
            if ( lang === "zh" ) {
                this.sysLang.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("left-button-group-default.png"));
                this.zhLang.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("middle-button-group-selected-default.png"));
                this.enLang.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("left-button-group-default.png"));
            } else {
                this.sysLang.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("left-button-group-default.png"));
                this.zhLang.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("middle-button-group-default.png"));
                this.enLang.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("left-button-group-selected-default.png"));
            }
        } else {
            this.sysLang.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("left-button-group-selected-default.png"));
            this.zhLang.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("middle-button-group-default.png"));
            this.enLang.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("left-button-group-default.png"));
        }
        this.sysLangLabel.setString(texts.followSystem)
        this.langSelectLabel.setString(texts.language)
    }
})

var SettingScene = cc.Scene.extend({
    ctor:function () {
        this._super();
        var layer = new SettingLayer();
        this.addChild(layer);
    }
});