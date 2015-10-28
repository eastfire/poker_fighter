var MoneyCardModel = Backbone.Model.extend({
    defaults:function(){
        return {
            money : 1
        }
    }
});

var MoneySpecialCardSprite = PokerCardSprite.extend({
    initView:function(){
        var name;
        if ( this.model.get("money") === 1 ) {
            name = "token-green.png";
        } else if ( this.model.get("money") === 10 ) {
            name = "token-red.png";
        } else {
            name = "token-black.png";
        }
        this.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame(name));
    },
    render:function(){

    },
    playerTakeCard:function(player){
        if ( this.alreadyTaken )
            return;
        this.stopAllActions();
        this.setTag(0);

        this.alreadyTaken = true;

        var playerSprite = player == gameModel.player1 ? mainLayer.player1Sprite : mainLayer.player2Sprite;
        this.runAction(new cc.Sequence( new cc.MoveTo(times.getMoney, playerSprite.moneyLabel.x, playerSprite.moneyLabel.y) ,
            new cc.CallFunc(function(){
                player.set("money", player.get("money") + this.model.get("money"));
                gameModel.destroyCard(this.model);
            },this)
            ));

    }
});