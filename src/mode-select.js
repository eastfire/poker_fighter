/**
 * Created by 赢潮 on 2015/11/8.
 */
var ModeSelectLayer = cc.Layer.extend({


});

var ModeSelectScene = cc.Scene.extend({
    onEnter:function () {
        this._super();

        var layer = new ModeSelectLayer();
        this.addChild(layer);
    }
});