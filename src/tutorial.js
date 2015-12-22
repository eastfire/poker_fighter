var PlayerSprite = cc.Sprite.extend({
    ctor: function (options) {
        this._super();

        if ( options.position === PLAYER_POSITION_UP )
            this.rotation = 180;
    }
});