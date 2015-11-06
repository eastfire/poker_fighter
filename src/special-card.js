var MoneyCardModel = Backbone.Model.extend({
    defaults:function(){
        return {
            money : 1
        }
    }
});

var MoneySpecialCardSprite = NormalCardSprite.extend({
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

var ItemSpecialCardModel = Backbone.Model.extend({
    defaults:function(){
        return {
        }
    }
});

var ItemSpecialCardSprite = NormalCardSprite.extend({
    initView:function(){
        this.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("card-item.png"));
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
        this.runAction(new cc.Sequence( new cc.MoveTo(times.getMoney, playerSprite.itemSlotSprite.x, playerSprite.itemSlotSprite.y) ,
            new cc.CallFunc(function(){
                gameModel.destroyCard(this.model);
                playerSprite.getAnItem();
            },this)
        ));

    }
})

var BombSpecialCardModel = Backbone.Model.extend({
    initialize:function(){
        this.isSpecialCard = true;
    }
});

var BombSpecialCardSprite = NormalCardSprite.extend({
    initView:function(){
        this.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("bomb.png"));
    },
    render:function(){

    },
    playerTakeCard:function(player){
        if ( this.alreadyTaken )
            return;
        this.stopAllActions();
        this.setTag(0);

        this.alreadyTaken = true;
        this.zIndex = 20;
        var playerSprite = player == gameModel.player1 ? mainLayer.player1Sprite : mainLayer.player2Sprite;
        this.runAction(new cc.Sequence( new cc.MoveTo(times.getMoney, cc.winSize.width/2, player == gameModel.player1 ? dimens.player1HandPosition.y : dimens.player2HandPosition.y ) ,
            new cc.CallFunc(function(){
                gameModel.destroyCard(this.model);

                //TODO play explosion animation
                cc.audioEngine.playEffect(res.explosion_mp3, false);
                if ( player.canTakeCard() ) {
                    //Destroy hand
                    player.discardRandomCard();
                }
            },this)
        ));

    }
});

var ThiefSpecialCardModel = Backbone.Model.extend({
    initialize:function(){
        this.isSpecialCard = true;
        this.power = Math.random() < 0.1 ? 10 : Math.ceil( Math.random()*5);
    }
});
var ThiefSpecialCardSprite = NormalCardSprite.extend({
    initView:function(){
        this.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame(this.model.power == 10 ? "thief-red.png" : "thief-green.png"));
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
                player.set("money", Math.max(1, player.get("money") - this.model.power * gameModel.get("betRate")));
                gameModel.destroyCard(this.model);
            },this)
        ));
    }
});