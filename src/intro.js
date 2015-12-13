var IntroLayer = cc.Layer.extend({
    ctor:function(){
        this._super();
        var sprite = new cc.Sprite(res.intro_png);
        sprite.attr({
            x: cc.winSize.width/2,
            y: cc.winSize.height/2
        })
        this.addChild(sprite);

        var lang = cc.sys.language;
        if ( lang != "zh" ) lang = "en";

        var vsItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("menu-vs-default-"+lang+".png"),
            cc.spriteFrameCache.getSpriteFrame("menu-vs-press-"+lang+".png"),
            function () {
                //TODO if played once
                cc.audioEngine.playEffect(res.click_mp3,false);
                cc.director.runScene(new ModeSelectScene({mode:"vs"}));
                //TODO else quickMode

            }, this);
        vsItem.attr({
            x: cc.winSize.width/2,
            y: cc.winSize.height/2 - 200
        });

//        var quickVsItem = new cc.MenuItemImage(
//            cc.spriteFrameCache.getSpriteFrame("menu-quick-vs-default-"+lang+".png"),
//            cc.spriteFrameCache.getSpriteFrame("menu-quick-vs-press-"+lang+".png"),
//            function () {
//                cc.audioEngine.playEffect(res.click_mp3,false);
//                var store = cc.sys.localStorage.getItem("unlocked");
//                var unlocked = [];
//                if ( store ) {
//                    unlocked = JSON.parse(store);
//                }
//                cc.director.runScene(new MainScene({
//                    itemPool : _.union(INIT_ITEMS, unlocked)
//                }));
//            }, this);
//        quickVsItem.attr({
//            x: cc.winSize.width/2,
//            y: cc.winSize.height/2 - 200
//        });

        var vsAIItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("menu-vs-ai-default-"+lang+".png"),
            cc.spriteFrameCache.getSpriteFrame("menu-vs-ai-press-"+lang+".png"),
            function () {
                cc.audioEngine.playEffect(res.click_mp3,false);
                cc.director.runScene(new ModeSelectScene({mode:"vs-ai"}));
            }, this);
        vsAIItem.attr({
            x: cc.winSize.width/2,
            y: cc.winSize.height/2 - 300
        });
        var menu = new cc.Menu([vsItem, vsAIItem]);
        menu.x = 0;
        menu.y = 0;
        this.addChild(menu);
    }
});

var IntroScene = cc.Scene.extend({
    onEnter:function () {
        this._super();

        var layer = new IntroLayer();
        this.addChild(layer);
    }
});