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
                cc.director.popScene();
            }, this);
        resumeItem.attr({
            x: cc.winSize.width/2,
            y: cc.winSize.height/8
        });

        var infoItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("info-default.png"),
            cc.spriteFrameCache.getSpriteFrame("info-press.png"),
            function () {
                cc.director.pushScene( new HelpScene() );
            }, this);
        infoItem.attr({
            x: cc.winSize.width/2,
            y: cc.winSize.height*3/8
        });

        var restartItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("restart-default.png"),
            cc.spriteFrameCache.getSpriteFrame("restart-press.png"),
            function () {
                window.gameModel = null;
                cc.director.runScene(new MainScene());
            }, this);
        restartItem.attr({
            x: cc.winSize.width/2,
            y: cc.winSize.height*5/8
        });

        var exitItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("exit-default.png"),
            cc.spriteFrameCache.getSpriteFrame("exit-press.png"),
            function () {
                window.gameModel = null;
                cc.director.runScene(new IntroScene());
            }, this);
        exitItem.attr({
            x: cc.winSize.width/2,
            y: cc.winSize.height*7/8
        });

        var menu = new cc.Menu([exitItem, restartItem, infoItem, resumeItem ]);
        menu.x = 0;
        menu.y = 0;
        this.addChild(menu);
    }
})

var PauseMenuScene = cc.Scene.extend({
    ctor:function () {
        this._super();
        var layer = new PauseMenuLayer();
        this.addChild(layer);
    }
});