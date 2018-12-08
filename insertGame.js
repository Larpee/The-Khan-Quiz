$.get("https://cdn.jsdelivr.net/gh/Larpee/The-Khan-Quiz@master/game.js", function (game) {
    var sketchProc = function (processingInstance) {
        with (processingInstance) {
            size(400, 400);
            frameRate(30);
            eval(game);
        }
    };
    
    var canvas = document.getElementById("game");

    var processingInstance = new Processing(canvas, sketchProc);
});
