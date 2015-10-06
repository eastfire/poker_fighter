var buildRichText = function( options ) {
    options = options || {};
    var richText = options.richText || new ccui.RichText();
    richText.ignoreContentAdaptWithSize(false);
    richText.width = options.width || 200;
    richText.height = options.height || 30;
    var str = options.str || options.text || "";
    var fontSize = options.fontSize || 16;
    var fontColor = options.fontColor || cc.color.WHITE;
    var fontFamily = options.fontFamily || "Arial";
    var opacity = options.opacity || 255;
    var segments = str.split(/[{|}]/);
    var tag = 1;
    _.each( segments, function(segment){
        var frame = null;
        if ( segment.substr(0,1) === "[" && segment.substr( segment.length - 1, 1) === "]" ) {
            var iconName = segment.substr(1, segment.length -2);
            frame = cc.spriteFrameCache.getSpriteFrame(iconName+".png");
        }
        if ( frame ) {
            var reimg = new ccui.RichElementImage(tag, cc.color.WHITE, 255, frame );
            richText.pushBackElement(reimg);
        } else {
            var re = new ccui.RichElementText(tag, new cc.FontDefinition({
                fillStyle: fontColor,
                fontName: fontFamily,
                fontSize: fontSize,
                fontWeight: "normal",
                fontStyle: "normal"
            }), opacity, segment);
            richText.pushBackElement(re);
        }
        tag++;
    });
    return richText;
}

var blockAllTouchEvent = function(mask){
    cc.eventManager.addListener(cc.EventListener.create({
        event: cc.EventListener.TOUCH_ONE_BY_ONE,
        swallowTouches: true,
        onTouchBegan: function (touch, event) {
            return true;
        },
        onTouchMoved: function (touch, event) {
        },
        //Process the touch end event
        onTouchEnded: function (touch, event) {
        }
    }), mask);
}

var blockMyTouchEvent = function(mask){
    cc.eventManager.addListener(cc.EventListener.create({
        event: cc.EventListener.TOUCH_ONE_BY_ONE,
        swallowTouches: true,
        onTouchBegan: function (touch, event) {
            var target = event.getCurrentTarget();

            var locationInNode = target.convertToNodeSpace(touch.getLocation());
            var s = target.getContentSize();
            var rect = cc.rect(0, 0, s.width, s.height);

            //Check the click area
            if (cc.rectContainsPoint(rect, locationInNode)) {
                return true;
            }
            return false;
        },
        onTouchMoved: function (touch, event) {
        },
        //Process the touch end event
        onTouchEnded: function (touch, event) {
        }
    }), mask);
}