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
            cc.spriteFrameCache.getSpriteFrame("2player-menu.png"),
            cc.spriteFrameCache.getSpriteFrame("2player-menu.png"),
            function () {
                cc.audioEngine.playEffect(res.click_mp3, false);
                statistic.game = statistic.game || {};
                var playedOnce = statistic.game.vs || statistic.game["vs-ai"]
                if ( playedOnce ) {
                    cc.director.runScene(new ModeSelectScene({mode: "vs"}));
                } else {
                    cc.director.runScene(new MainScene({
                        itemPool : INIT_ITEMS
                    }));
                }
            }, this);
        vsItem.attr({
            x: cc.winSize.width/2 - 55,
            y: cc.winSize.height/2 - 100,
            scaleX: 1.1,
            scaleY: 1.1,
            rotation: -5
        });

        var vsAIItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("vs-ai-menu.png"),
            cc.spriteFrameCache.getSpriteFrame("vs-ai-menu.png"),
            function () {
                cc.audioEngine.playEffect(res.click_mp3,false);
                statistic.game = statistic.game || {};
                var playedOnce = statistic.game.vs || statistic.game["vs-ai"]
                if ( playedOnce ) {
                    cc.director.runScene(new ModeSelectScene({mode: "vs-ai"}));
                } else {
                    cc.director.runScene(new MainScene({
                        mode: "vs-ai",
                        itemPool : INIT_ITEMS
                    }));
                }
            }, this);
        vsAIItem.attr({
            x: cc.winSize.width/2+55,
            y: cc.winSize.height/2 - 100,
            scaleX: 1.1,
            scaleY: 1.1,
            rotation: 5
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