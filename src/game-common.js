var IconSprite = cc.Sprite.extend({
    ctor: function(options){
        options = options || {}
        var fontSize = options.fontSize || 15;
        var fontColor = options.fontColor || cc.color.BLACK;
        var text = options.text || "";
        var image = options.image;
        var offset = options.offset || {
            x : 24,
            y : 24
        }
        this._super(image);

        this.label = new ccui.Text(text, "Arial", fontSize );
        this.label.enableOutline(cc.color.WHITE, 2);
        this.label.setTextColor(fontColor);

        this.label.attr({
            x: offset.x,
            y: offset.y
        })
        this.addChild(this.label,1)
    },
    setIcon:function(image){
        if ( image instanceof cc.Texture2D )
            this.setTexture(image);
        else if ( image instanceof cc.SpriteFrame )
            this.setSpriteFrame(image);
    },
    setString:function(str){
        this.label.setString(str)
    },
    setFontColor:function(color){
        //this.label.setColor(color);
        this.label.setTextColor(color);
    }
})