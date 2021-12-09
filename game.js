var suits = ['Spades', 'Hearts', 'Clubs', 'Diamonds'];

var deck;
var playerPoints;
var dealerPoints;

class Card {
    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
    }

    get desc() {
        var rank_str;
        if (this.rank == 1)
            rank_str = "Ace";
        else if (this.rank == 11)
            rank_str = "Jack";
        else if (this.rank == 12)
            rank_str = "Queen";
        else if (this.rank == 13)
            rank_str = "King";
        else
            rank_str = this.rank;

        //get the suits in suits array by suits[this.suits]
        return rank_str + " of " + suits[this.suit];
    }

    get image() {
        var rank_str;
        if (this.rank == 1)
            rank_str = "A";
        else if (this.rank == 11)
            rank_str = "J";
        else if (this.rank == 12)
            rank_str = "Q";
        else if (this.rank == 13)
            rank_str = "K";
        else
            rank_str = this.rank;

        //returning the image name -> 11H.png 11 of Hearts
        return rank_str + suits[this.suit].charAt(0) + ".png";
    }
};

class Deck {
    //generating 52 cards
    constructor() {
        this.deck = [];
        for (var suit = 0; suit < 4; suit++) {
            for (var rank = 1; rank <= 13; rank++) {
                var card = new Card(suit, rank);
                this.deck[this.deck.length] = card;//adding card to the deck
            }
        }

        this.currentTop = 0;
    }

    //shuffling cards
    shuffle() {
        for (var i = this.deck.length - 1; i > 0; i--) {
            //pick a random number within i
            var j = Math.floor(Math.random() * (i + 1));

            //swapping Cards at i and j
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    //dealing cards == returning the top card
    deal() {
        var topCard = this.currentTop;

        this.currentTop += 1;

        if (this.currentTop >= this.deck.length) {
            console.log("Reset the deck...");
            this.shuffle();
            this.currentTop = 0;
        }

        return this.deck[topCard];
    }
};

var createImg = function (name, where) {
    var URL = "./cards/PNG/" + name;
    var img = $('<img>');//creating the <img> tag
    img.css({ 'width': '20%', 'height': '21%' });//how to create image with not a fixed width and height??
    img.attr('src', URL);
    img.appendTo(where);

}

var isFaceCard = function (card) {
    if (card.rank == 11 || card.rank == 12 || card.rank == 13)
        return true;
    return false;
}

var sum = function (cards) {
    var total = 0;
    var numberOfAces = 0;//Ace is 11 or 1 as long as total not exceed 21

    for (var i = 0; i < cards.length; i++) {
        if (cards[i].rank == 1) {
            total += 11;
            numberOfAces += 1;
        }
        else if (cards[i].rank == 11 || cards[i].rank == 12 || cards[i].rank == 13) {
            total += 10;
        } else {
            total += cards[i].rank;
        }
    }

    for (var i = numberOfAces; i > 0; i--) {
        if (total > 21) {
            total -= 10;
        }
    }

    return total;
}

var isBlackJack = function (cards) {
    //Must only have two cards
    if (cards.length == 2) {
        if (sum(cards) == 21)
            return true;
        else
            return false
    } else {
        return false;
    }
}

var printScores = function (who) {
    if (who == "player")
        $("#playerArea .scoreBox p").text(playerPoints);
    else if (who == "dealer")
        $("#dealerArea .scoreBox p").text(dealerPoints);
}

var gameStart = false;
var burst = false;
var stand = false;
$(document).ready(function () {
    deck = new Deck();
    deck.shuffle();
    var playerCards = [];
    var dealerCards = [];

    //deal: restart the game
    $("#deal").on("click", function () {
        gameStart = true;
        burst = false;
        stand = false;
        playerCards = [];
        dealerCards = [];
        $("#playerArea .cardBox").empty();
        $("#dealerArea .cardBox").empty();
        $("#playerArea .scoreBox p").empty();
        $("#dealerArea .scoreBox p").empty();
        $("#resultArea p").empty();


        //giving player and dealer two cards each
        playerCards[playerCards.length] = deck.deal();
        playerCards[playerCards.length] = deck.deal();
        dealerCards[dealerCards.length] = deck.deal();
        dealerCards[dealerCards.length] = deck.deal();

        //rendering player cards images
        createImg(playerCards[0].image, "#playerArea .cardBox");
        createImg(playerCards[1].image, "#playerArea .cardBox");

        createImg("yellow_back.png", "#dealerArea .cardBox");
        createImg(dealerCards[1].image, "#dealerArea .cardBox");

        playerPoints = sum(playerCards);

        printScores("player");

        if (isBlackJack(playerCards)) {
            $("#resultArea p").text("BLACK JACK! YOU WON!");
            $("#dealerArea .cardBox img:first-child").attr("src", "./cards/PNG/" + dealerCards[0].image);
            stand = true;
        }

    });

    $("#hit").on("click", function () {
        if (gameStart == true && burst == false && stand == false) {
            playerCards[playerCards.length] = deck.deal();
            createImg(playerCards[playerCards.length - 1].image, "#playerArea .cardBox");
            playerPoints = sum(playerCards);
            printScores("player");
            if (playerPoints > 21) {
                $("#resultArea p").text("BURST! YOU LOSE");
                $("#dealerArea .cardBox img:first-child").attr("src", "./cards/PNG/" + dealerCards[0].image);
                burst = true;
            }
        }
    });

    $("#stand").on("click", function () {
        if (gameStart == true && burst == false && stand == false) {
            stand = true;
            $("#dealerArea .cardBox img:first-child").fadeOut("fast", function () {
                $("#dealerArea .cardBox img:first-child").attr("src", "./cards/PNG/" + dealerCards[0].image).fadeOut().fadeIn();
            });
            dealerPoints = sum(dealerCards);
            printScores("dealer");
            if (isBlackJack(dealerCards))
                $("#resultArea p").text("DEALER BLACK JACK! YOU LOSE!");
            else {
                while (dealerPoints < 16) {
                    dealerCards[dealerCards.length] = deck.deal();
                    createImg(dealerCards[dealerCards.length - 1].image, "#dealerArea .cardBox");
                    dealerPoints = sum(dealerCards);
                    printScores("dealer");
                }

                if (dealerPoints > 21)
                    $("#resultArea p").text("DEALER BURST! YOU WON!");

                else if (dealerPoints > playerPoints)
                    $("#resultArea p").text("YOU LOSE!");

                else if (dealerPoints < playerPoints)
                    $("#resultArea p").text("YOU WON!");
                else
                    $("#resultArea p").text("DRAW!");
            }
        }
    });


});