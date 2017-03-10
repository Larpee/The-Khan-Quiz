

{


//Some global variables
var framesPassed;
var currentScene = "menu";
var currentLanguage = 0;
var points = 0;
var errors = 0;
var unseenShows = [];
var usedQuestions = [];
var currentQuestion;
var currentQuestionIndex;
var questionSelected = false;
var answerGiven = false;
var sansSerif = createFont("sans-serif");
var impact = createFont("impact");
var questionsToErase = [];
var unseenShows = [];

/**************
| Object Types |
***************/
//Text
{
var Text = function (english, spanish, x, y) {
    this.spanish = spanish;
    this.english = english;
    this.x = x;
    this.y = y;
    
    this.languages = [english, spanish];
};

Text.prototype.draw = function() {
    text(this.languages[currentLanguage], this.x, this.y);
};

Text.prototype.concatenate = function (textToAdd) {
    this.english = this.english.concatenate(textToAdd);
    this.spanish = this.spanish.concatenate(textToAdd);
    this.languages = [this.english, this.spanish];
};

Text.prototype.replace = function (textToRemove, textToAdd) {
    this.english = this.english.replace(textToRemove, textToAdd);
    this.spanish = this.spanish.replace(textToRemove, textToAdd);
    this.languages = [this.english, this.spanish];
};  
}

//Rect
{
var Rect = function (config) {
    this.width = config.width;
    this.height = config.height;
    this.x = config.x;
    this.y = config.y;
    this.text = new Text (config.text[0], config.text[1]);
    this.color = config.color;
    this.stroke = config.stroke;
    this.textSize = config.textSize || 18;
    this.textColor = config.textColor || color(0, 0, 0);
    this.textAlign = config.textAlign || CENTER;
    this.textFont = config.textFont || sansSerif;
};

Rect.prototype.draw = function() {
    if (this.stroke === undefined) {
        noStroke();
    }
    
    else {
        stroke(this.stroke);
        strokeWeight(2);
    }
    
    fill(this.colorToDraw);
    rect(this.x, this.y, this.width, this.height, 4);
    
    textAlign(this.textAlign, this.textAlign);
    textFont(this.textFont, this.textSize);
    fill(this.textColor);
    
    if (this.textAlign === CENTER) {
        this.text.x = this.x + this.width/2;
        this.text.y = this.y + this.height/2;
    }
    
    else if (this.textAlign === LEFT) {
        this.text.x = this.x + width/80;
        this.text.y = this.y + this.height/2 + height/80;
    }
    
    this.text.draw();
};

Rect.prototype.isMouseInside = function () {
    return mouseX > this.x && mouseX < this.x + this.width && mouseY > this.y && mouseY < this.y + this.height;
};
}

//Button
{
var Button = function (config) {
    this.width = config.width || width/4;
    this.height = config.height || height/8;
    this.x = config.x || 3/8 * width;
    this.y = config.y;
    this.text = new Text (config.text[0], config.text[1]);
    this.color = config.color || color(255, 0, 0);
    this.action = config.action || function () {};
    this.stroke = config.stroke;
    this.textSize = config.textSize || 18;
    this.textColor = config.textColor || color(0, 0, 0);
    this.mouseOnButtonColor = config.mouseOnButtonColor;
    this.textAlign = config.textAlign || CENTER;
    this.colorWhenPressed = undefined;
    this.textFont = config.textFont || sansSerif;
    
    this.colorToDraw = this.color;
    
};

Button.prototype = Object.create(Rect.prototype);

Button.prototype.handleMouseClick = function () {
    if (this.isMouseInside()) {
        if (this.colorWhenPressed !== undefined) {
            this.colorToDraw = this.colorWhenPressed;
            this.color = this.colorWhenPressed;
        }
        
        this.action();
    }
};

Button.prototype.mouseOnButton = function () {
    if (this.isMouseInside()) {
        if (this.mouseOnButtonColor !== undefined) {
            this.colorToDraw = this.mouseOnButtonColor;
        }
    }
    else {
        this.colorToDraw = this.color;
    }
};
}

//Button Menu
{
var ButtonMenu = function (config) {
    this.startingButton = config.startingButton;
    this.scene = config.scene;
    this.thingsToDraw = config.thingsToDraw;
    this.background = config.background;
    this.beingDrawn = false;
    this.x = config.x;
    this.y = config.y;
    
    for (var i = 0; i < this.thingsToDraw.length; i++) {
        this.thingsToDraw[i].x = this.startingButton.x; 
        this.thingsToDraw[i].y = this.startingButton.y + this.startingButton.height * i;
        this.thingsToDraw[i].width = this.startingButton.width;
        this.thingsToDraw[i].height = this.startingButton.height;
        this.thingsToDraw[i].colorToDraw = this.startingButton.color;
        this.thingsToDraw[i].color = this.startingButton.color;
        this.thingsToDraw[i].stroke = this.startingButton.stroke;
        this.thingsToDraw[i].textAlign = this.startingButton.textAlign;
        this.thingsToDraw[i].textSize = this.startingButton.textSize;
        this.thingsToDraw[i].textColor = this.startingButton.textColor;
        
        if (this.thingsToDraw[i] instanceof Button) {
            this.thingsToDraw[i].mouseOnButtonColor = this.startingButton.mouseOnButtonColor;
            
        }
    }
};

ButtonMenu.prototype.draw = function() {
        noStroke();
        
        for (var i = 0; i < this.thingsToDraw.length; i++) {
            this.thingsToDraw[i].draw();
        }
};

ButtonMenu.prototype.mouseOnButton = function () {
    for (var i = 0; i < this.thingsToDraw.length; i++) {
        if (this.thingsToDraw[i] instanceof Button) {
            this.thingsToDraw[i].mouseOnButton();
        }
    }
};

ButtonMenu.prototype.handleMouseClick = function () {
    this.mouseInDescription = false;
    for (var i = 0; i < this.thingsToDraw.length; i++) {
        if (this.thingsToDraw[i] instanceof Button && this.thingsToDraw[i].isMouseInside()) {
            this.thingsToDraw[i].handleMouseClick();
            this.beingDrawn = false;
        }
        
        else if (this.thingsToDraw[i] instanceof Rect && this.thingsToDraw[i].isMouseInside()) {
            this.mouseInDescription = true;
        }
    }
    
    if (!this.mouseInDescription) {
        this.beingDrawn = false;
    }
};
}

//Question
{
var Question = function (subjectName, subject, question, correctAnswer, answer1, answer2, answer3) {
    
    this.subjectName = subjectName || [[], []];
    
    this.question = question || [];
    
    this.question[0] += "?";
    this.question[1] = "¿".concat(this.question[1], "?");
    
    this.question = new Rect ({
        text: this.question,
        x: width/20,
        y: 9/40 * height,
        stroke: color(166, 166, 166),
        color: color(255, 255, 255),
        width: 9/10 * width,
        height: height/4,
        textSize: 11
    });
    
    this.subjectName = new Rect ({
        x: 3/20 * width,
        y: height/19,
        width: 7/10 * width,
        height: height/10,
        color: color(255, 255, 255),
        stroke: color(166, 166, 166),
        text: this.subjectName,
        textSize: 15
    });
    
    this.correctAnswer = correctAnswer;
    this.answer1 = answer1;
    this.answer2 = answer2;
    this.answer3 = answer3;
    
    this.answers = [this.answer1, this.answer2, this.answer3];
    this.answers.sort(function () {return 0.5 < random();});
    this.possibleIndexes = [0, 1, 2];
    
    this.subject = subject;
};

Question.prototype.draw = function() {
    background(255, 255, 255);
    
    noLoop();
    this.question.draw();
    this.subjectName.draw();
    loop();
};

}

/************
| Functions |
************/
var capitalize = function (string) {
    var substring = string.slice(0, 1); //Value of substring is the first letter of string
    substring = substring.toUpperCase(); //Changes value of substring to upper case
    string = string.replace(string[0], substring); //The first of string is the substring
    return string; //Returns the capitalized string
};
var searchForSpecialKey = function (variable, keyCodeToSearch) {
    if (keyCodeToSearch === keyCode) { //Checks if the key code to search is activated
        return !variable; //Returns the opposite of value of variable
    }
    
    else {
        return variable;
    }
};
var addQuoteSigns = function (string) {
    string = '"'.concat(string, '"'); 
    return string;
};
var checkForCompleteArrayOfArrays = function (array) {
    //Note: This only works for arrays of arrays that only have two elements, for example: [[1, 2], [2, 3], [3, 6]]
    //Returns true if every array in the main array has at least one string with length > 0
    var boolToReturn = false;
    for (var i = 0; i < array.length; i++) {
        for (var o = 0; o < array[i].length; o++) {
            if (array[i][0].length > 0 || array[i][1].length > 0) {
                boolToReturn = true;
            }
            
            else {
                return false;
            }
        }
    }
    
    return boolToReturn;
};
var removeEmptyElementsInArray = function (array) {
    var newArray = [];
    for (var i = 0; i < array.length; i++) {
        if (array[i] !== undefined) {
            newArray.push(array[i]);
        }
    }
    array = newArray;
    return array;
};

/************
| Questions |
************/
{
var questions = [[["TV Shows: Arrow", "Series de Televisión: Arrow"], ["tvshows", "arrow"], ["Who is Felicity's boyfriend in season 4", "Quién es el novio de Felicity en la temporada 4"], ["Billy Malone", "Billy Malone"], ["Tommy Aram", "Tommy Aram"], ["Tommy Malone", "Tommy Malone"], ["Billy Aram", "Billy Aram"]], [["Movies: Star Wars", "Películas: Star Wars"], ["movies", "starwars"], ["How many children did Han and Leia have", "Cuántos hijos tuvieron Han y Leia"], ["3", "3"], ["2", "2"], ["1", "1"], ["4", "4"]], [["TV Shows: Flash", "Series de Televisión: Flash"], ["tvshows", "flash"], ["Who created Flashpoint in season 4", "Quién creó Flashpoint en la temporada 4"], ["Barry", "Barry"], ["Jay Garrick", "Jay Garrick"], ["Cisco", "Cisco"], ["Harry", "Harry"]], [["TV Shows: Supernatural", "Series de Televisión: Supernatural"], ["tvshows", "supernatural"], ["How many actresses played Ruby", "Cuántas actrices interpretaron a Ruby"], ["4", "4"], ["3", "3"], ["2", "2"], ["5", "5"]], [["Movies: X-Men", "Películas: X-Men"], ["movies", "xmen"], ["Who plays young Magneto", "Quién interpreta a Magneto joven"], ["Michael Fassbender", "Michael Fassbender"], ["Ian McKellen", "Ian McKellen"], ["Tom Hiddleston", "Tom Hiddleston"], ["Patrick Stewart", "Patrick Stewart"]], [["Movies: X-Men", "Películas: X-Men"], ["movies", "xmen"], ["Who plays young Professor X", "Quién interpreta al Profesor X joven"], ["James McAvoy", "James McAvoy"], ["Patrick Stewart", "Patrick Stewart"], ["Michael Fassbender", "Michael Fassbender"], ["Benedict Cumberbatch", "Benedict Cumberbatch"]], [["Movies: X-Men", "Películas: X-Men"], ["movies", "xmen"], ["What happens to Mystique in the third movie", "Qué le ocurre a Mystique en la tercera película"], ["She becomes a human", "Se convierte en humana"], ["She dies", "Muere"], ["She betrays Magneto", "Traiciona a Magneto"], ["She gets married", "Se casa"]], [["TV Shows: Once Upon a Time", "Series de Televisión: Once Upon a Time"], ["tvshows", "ouat"], ["Who is Rumplestilskin's father", "Quién es el padre de Rumplestilskin"], ["Peter Pan", "Peter Pan"], ["Theodore", "Theodore"], ["The mad Hatter", "El Sombrerero Loco"], ["Neal", "Neal"]], [["TV Shows: Arrow", "Series de Televisión: Arrow"], ["tvshows", "arrow"], ["Whose mother does Quentin fall in love with", "De la madre de quién se enamora Quentin Lance"], ["Felicity's", "De Felicity"], ["Oliver's", "De Oliver"], ["Tommy's", "De Tommy"], ["Roy Harper's", "De Roy Harper"]], [["Movies: X-Men", "Películas: X-Men"], ["movies", "xmen"], ["What is Mystique's human name", "Cuál es el nombre humano de Mystique"], ["Raven Darkholme", "Raven Darkholme"], ["Doris Morrison", "Doris Morrison"], ["Nicole House", "Nicole House"], ["Katherine Mystique", "Katherine Mystique"]], [["Movies: X-Men", "Películas: X-Men"], ["movies", "xmen"], ["What is the name of the metal in Wolverine's bones", "Cómo se llama el metal en los huesos de Wolverine"], ["Adamantium", "Adamantium"], ["Vibranium", "Vibranium"], ["Steel", "Acero"], ["Dalekenium", "Dalekenium"]], [["TV Shows: Arrow", "Series de Televisión: Arrow"], ["tvshows", "arrow"], ["What's the name of Oliver's son", "Cómo se llama el hijo de Oliver"], ["William", "William"], ["David", "David"], ["Benedict", "Benedict"], ["Oliver", "Oliver"]], [["TV Shows: Arrow", "Series de Televisión: Arrow"], ["tvshows", "arrow"], ["What did Oliver have to do to save Thea in season 3", "Qué tuvo que hacer Oliver para salvar a Thea en la temporada 3"], ["Join the League of Assassins", "Unirse a la Liga de Asesinos"], ["Kill himself", "Suicidarse"], ["Sacrifice one of his friends", "Sacrificar a uno de sus amigos"], ["Make a deal with the Devil", "Hacer un pacto con el Diablo"]], [["TV Shows: Arrow", "Series de Televisión: Arrow"], ["tvshows", "arrow"], ["Which of Oliver's friends does Laurel fall in love with in season 1", "De quién de los amigos de Oliver se enamora Laurel en la temporada 1"], ["Tommy", "Tommy"], ["Diggle", "Diggle"], ["Roy Harper", "Roy Harper"], ["Ray Palmer", "Ray Palmer"]], [["TV Shows: Once Upon a Time", "Series de Televisión: Once Upon a Time"], ["tvshows", "ouat"], ["What's the relationship between Prince Charming and Snow White", "Cómo se relacionan Blancanieves y Prince Charming"], ["They are married", "Están casados"], ["Prince Charming is her father", "Prince Charming es su padre"], ["Snow White is his mother", "Blancanieves es su madre"], ["They are siblings", "Son hermanos"]], [["TV Shows: Once Upon a Time", "Series de Televisión: Once Upon a Time"], ["tvshows", "ouat"], ["In which season did Emma become evil", "En qué temporada se volvió malvada Emma"], ["Season 4", "Temporada 4"], ["Season 5", "Temporada 5"], ["Season 3", "Temporada 3"], ["Season 6", "Temporada 6"]], [["TV Shows: Once Upon a Time", "Series de Televisión: Once Upon a Time"], ["tvshows", "ouat"], ["What is the relationship between Rumplestilskin and Henry", "Cómmo se relacionan Rumplestilskin y Henry"], ["Rumplestilskin is Henry's grandfather", "Rumplestilskin es el abuelo de Henry"], ["They are not related", "No son familiares"], ["Rumplestilskin is Henry's father", "Rumplestilskin es el padre de Henry"], ["Rumplestilskin is Henry's great grandfather", "Rumplestilskin es el bisabuelo de Henry"]], [["TV Shows: Once Upon a Time", "Series de Televisión: Once Upon a Time"], ["tvshows", "ouat"], ["Why did Peter Pan want to kidnap Henry", "Por qué quería Peter Pan secuestrar a Henry"], ["Because Henry had the heart of the true believer", "Porque Henry tenía el Corazón del Verdadero Creyente"], ["Because Henry was his grandson", "Porque Henry era su nieto"], ["Because he wanted to attract Rumplestilskin to Neverland", "Porque quería atraer a Rumplestilskin a la Tierra de Nunca Jamás"], ["Because he had been ordered to", "Porque se lo habían ordenado"]], [["Movies: Star Wars", "Películas: Star Wars"], ["movies", "starwars"], ["What kind of ship did Luke pilot during the first attack on the Death Star", "Qué clase de nave pilotó Luke durante el primer ataque a la Estrella de la Muerte"], ["An X-Wing starfighter", "Un X-Wing starfighter"], ["An Y Wing fighter", "Un Y-Wing starfighter"], ["The Millenium Falcon", "El Halcón Milenario"], ["He didn't pilot a ship during the attack", "No pilotó una nave en el ataque"]], [["Movies: Star Wars", "Películas: Star Wars"], ["movies", "starwars"], ["What's Darth Vader's real name", "Cuál es el verdadero nombre de Darth Vader"], ["Anakin Skywalker", "Anakin Skywalker"], ["Han Solo", "Han Solo"], ["Luke Skywalker", "Luke Skywalker"], ["Obi Wan Kenobi", "Obi Wan Kenobi"]], [["Movies: Star Wars", "Películas: Star Wars"], ["movies", "starwars"], ["Who are Darth Vader's children", "Quiénes son los hijos de Darth Vader"], ["Luke and Leia", "Luke y Leia"], ["Luke and Han Solo", "Luke y Han Solo"], ["He doesn't have any children", "No tiene hijos"], ["Leia and Han Solo", "Leia y Han Solo"]], [["Movies: Star Wars", "Películas: Star Wars"], ["movies", "starwars"], ["What's the name of Han Solo's ship", "Cómo se llama la nave de Han Solo"], ["Millenium Falcon", "Halcón Milenario"], ["X-Wing starfighter", "X-Wing starfighter"], ["Y-Wing starfighter", "Y-Wing starfighter"], ["He doesn't have a ship", "No tiene una nave"]], [["TV Shows: Flash", "Series de Televisión: Flash"], ["tvshows", "flash"], ["What's Zoom's real name", "Cuál es el verdadero nombre de Zoom"], ["Jay Garrick", "Jay Garrick"], ["Barry Allen", "Barry Allen"], ["Eobard Thawne", "Eobard Thawne"], ["Harrison Wells", "Harrison Wells"]], [["TV Shows: Flash", "Series de Televisión: Flash"], ["tvshows", "flash"], ["Who's Kid Flash in Flashpoint", "Quién es Kid Flash en Flashpoint"], ["Wally", "Wally"], ["Barry", "Barry"], ["Cisco", "Cisco"], ["Ronnie", "Ronnie"]], [["TV Shows: Flash", "Series de Televisión: Flash"], ["tvshows", "flash"], ["What's Caitlin Snow's superpower", "Cuál es el superpoder de Caitlin Snow"], ["She controls cold", "Controla el frío"], ["Telekinesis", "Telequinesis"], ["She can see the future", "Puede ver el futuro"], ["Speedster", "Velocidad"]], [["TV Shows: Flash", "Series de Televisión: Flash"], ["tvshows", "flash"], ["How long was Barry in a comma after the Particle Accelerator exploded", "Cuánto tiempo estuvo Barry en coma luego de la explosión del Acelerador de Partículas"], ["9 months", "9 meses"], ["8 months", "8 meses"], ["1 year", "1 año"], ["10 months", "10 meses"]], [["TV Shows: Supernatural", "Series de Televisión: Supernatural"], ["tvshows", "supernatural"], ["What's Crowley's human name", "Cuál es el nombre humano de Crowley"], ["Fergus", "Fergus"], ["Crowley", "Crowley"], ["Mathew", "Mathew"], ["Charles", "Charles"]], [["TV Shows: Supernatural", "Series de Televisión: Supernatural"], ["tvshows", "supernatural"], ["What's Chuck's real identity", "Cuál es la verdadera identidad de Chuck"], ["He's God", "Es Dios"], ["He's an angel", "Es un ángel"], ["He's a prophet", "Es un profeta"], ["He's a normal human", "Es un humano normal"]], [["TV Shows: Supernatural", "Series de Televisión: Supernatural"], ["tvshows", "supernatural"], ["Which of these actors didn't play Lucifer", "Cuál de estos actores no interpretó a Lucifer"], ["Mark Sheppard", "Mark Sheppard"], ["Misha Collins", "Misha Collins"], ["Mark Pellegrino", "Mark Pellegrino"], ["Rick Springfield", "Rick Springfield"]], [["TV Shows: Supernatural", "Series de Televisión: Supernatural"], ["tvshows", "supernatural"], ["What's the name of Sam and Dean's brother", "Cómo se llama el hermano de Sam y Dean"], ["Adam", "Adam"], ["They don't have a brother", "No tienen un hermano"], ["Daniel", "Daniel"], ["John", "John"]]];

for (var i = 0; i < questions.length; i++) {
    questions[i] = new Question ([questions[i][0][0], questions[i][0][1]], questions[i][1], [questions[i][2][0], questions[i][2][1]], [questions[i][3][0], questions[i][3][1]], [questions[i][4][0], questions[i][4][1]], [questions[i][5][0], questions[i][5][1]], [questions[i][6][0], questions[i][6][1]]);
    
}

questions.sort(function () {return 0.5 - random();});
}

/**********************************
| Buttons and Variables for Scenes |
***********************************/
//Menu Scene
{
var gameTitle = new Text("THE KHAN QUIZ:", "THE KHAN QUIZ:", width/2, 19/80 * height);
var gameDescription = new Text ("TV SHOWS AND MOVIES", "Series y Películas", width/2, 29/80 * height);

var playButton = new Button ({
    x: 3/40 * width,
    y: 47/80 * height,
    width: 2/5 * width,
    text: ["Play", "Jugar"],
    color: color(121, 255, 54),
    stroke: color(111, 181, 92),
    textColor: color(17, 79, 0),
    mouseOnButtonColor: color(122, 255, 126),
    action: function () {currentScene = "selectQuestion";
    framesPassed = frameCount;
    }
});

var rulesButton = new Button ({
    x: 21/40 * width,
    width: 2/5 * width,
    y: 31/40 * height,
    text: ["How To Play", "Cómo Jugar"],
    color: color(121, 255, 54),
    stroke: color(111, 181, 92),
    textColor: color(17, 79, 0),
    mouseOnButtonColor: color(122, 255, 126),
    action: function () {currentScene = "rules";}
});

var addQuestionSceneButton = new Button ({
    y: 31/40 * height,
    x: 3/40 * width,
    width: 2/5 * width,
    text: ["Add Question", "Agregar Pregunta"],
    color: color(121, 255, 54),
    stroke: color(111, 181, 92),
    textColor: color(17, 79, 0),
    mouseOnButtonColor: color(122, 255, 126),
    action: function () {currentScene = "addQuestion";}
});

var languageButton = new Button ({
    y: 47/80 * height,
    x: 21/40 * width,
    width: 2/5 * width,
    text: ["Language", "Idioma"],
    color: color(121, 255, 54),
    stroke: color(111, 181, 92),
    textColor: color(17, 79, 0),
    mouseOnButtonColor: color(122, 255, 126)
});

var englishButton = new Button ({
    text: ["English", "Inglés"],
    action: function () {currentLanguage = 0;}
});

var spanishButton = new Button ({
    text: ["Spanish", "Español"],
    action: function () {currentLanguage = 1;}
});

var languageMenu = new ButtonMenu ({
    startingButton: languageButton,
    thingsToDraw: [englishButton, spanishButton]
});

languageButton.action = function () {languageMenu.beingDrawn = true;};

}

//Add Question Scene
{
var alphabet = [" ", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "*", "+", "-", ".", "/", ",", "-", ".","'"];

var shiftCharacters = [['=', "0"], ['!', "1"], ['"', "2"], ['#', "3"], ['$', "4"], ['%', "5"], ['&', "6"], ['/', "7"], ['(', "8"], [')', "9"], ["_", "-"], [':', '.'], [';', ',']];

var accentCharacters = [["á", "a"], ["é", "e"], ["í", "i"], ["ó", "o"], ["ú", "u"]];

var shiftIndexes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 43, 44, 42];

var accentIndexes = [11, 15, 19, 25, 31];

var capsLockOn = false;
var shiftOn = false;
var accentOn = false;
var diaeresisOn = false;

var keyCodes = [32, 188, 190, 107, 106, 109, 110, 219, 111, 189];

for (var i = 0; i < 10; i++) {
    keyCodes.push(48 + i);
}

for (var i = 0; i < 26; i++) {
    keyCodes.push(65 + i);
}

keyCodes.sort(function (a,b) {return a - b;});

var fieldToUpdate = null;
var questionVariables = [];

var question = ["", ""];
var correctAnswer = ["", ""];
var answer1 = ["", ""];
var answer2 = ["", ""];
var answer3 = ["", ""];
var subject = [];

var resetQuestionVariables = function () {
    for (var i = 0; i < questionVariables.length; i++) {
        questionVariables[i] = ["", ""];
    }
    subject = [];
};

var stringToPrint = new Text ("You must add the question first.", "Primero debes agregar la pregunta.");

var areasNotCompleteNote = new Text ("You must complete all areas first.", "Primero debes completar todas las áreas.");

questionVariables.push(question, correctAnswer, answer1, answer2, answer3);

var questionStrings = [["Subject: ", "Tema: "], ["Question: ", "Pregunta: "], ["Correct Answer: ", "Respuesta Correcta: "], ["Wrong Answer 1: ", "Respuesta Incorrecta 1: "], ["Wrong Answer 2: ", "Respuesta Incorrecta 2: "], ["Wrong Answer 3: ", "Respuesta Incorrecta 3:"]];

var questionButtons = [];

for (var i = 0; i < questionStrings.length; i++) {
    questionButtons.push(new Button ({
        x: width/40,
        y: (7/40 + i * 3/40) * height,
        width: 19/20 * width,
        height: 3/40 * height,
        color: color(242, 242, 242),
        stroke: color(94, 94, 94),
        text: [questionStrings[i][0], questionStrings[i][1]],
        textColor: color(0, 0, 0),
        textAlign: LEFT,
        textSize: 15,
        mouseOnButtonColor: color(217, 217, 217)
    }));
}

var subjectButton = questionButtons.shift();

questionStrings.shift();

{
questionButtons[0].action = function () {fieldToUpdate = 0;};
questionButtons[1].action = function () {fieldToUpdate = 1;};
questionButtons[2].action = function () {fieldToUpdate = 2;};
questionButtons[3].action = function () {fieldToUpdate = 3;};
questionButtons[4].action = function () {fieldToUpdate = 4;};
}

var explanationParagraph = new Text ("The question mark will be automaticaly added when the string\nis turned into a question. To print a question, press the\nAdd Question button and then the Print one. If you want to\nprint multiple questions, just write the first one, press\nthe Add Question button, repeat the process with the others\nand finally press the Print button. After printing, copy the\nline and paste it in the Tips and Thanks.\nThank you very much for your help!", "Los signos de pregunta serán agregados automáticamente\ncuando la línea se convierta en una pregunta. Para imprimir una\npregunta, presiona el botón de Agregar Pregunta y luego el\nde Imprimir. Si quieres imprimir más de una pregunta, escribe\nla primera, agrégala, repite el proceso con las demás preguntas\ny finalmente presiona el botón de Imprimir. Luego de imprimir la\npregunta, cópiala y pégala en la\npantalla de sugerencias y agradecimientos.\n¡Muchas gracias por tu ayuda!", width/2, 13/16 * height);

var backToMenuButton1 = new Button ({
    x: width/80,
    y: 9/10 * height,
    width: width/8,
    height: 3/40 * height,
    color: color(163, 163, 163),
    mouseOnButtonColor: color(168, 168, 168),
    text: ["Back to\nmenu", "Volver al\nmenú"],
    textAlign: CENTER,
    stroke: color(0, 0, 0),
    action: function () {currentScene = "menu";
    stringToPrint = new Text ("You must add the question first.", "Primero debes agregar la pregunta.");
    resetQuestionVariables();
    },
    textSize: 11
});

var printQuestionButton = new Button ({
    x: 3/80 * width,
    y: 3/80 * height,
    width: 7/16 * width,
    textSize: 15,
    height: height/10,
    text: ["PRINT", "IMPRIMIR"],
    color: color(163, 163, 163),
    stroke: color(0, 0, 0),
    action: function () {if (stringToPrint instanceof Text) {
        println(stringToPrint.languages[currentLanguage]);
    }
    
    else {
        println(stringToPrint);
    }
    },
    mouseOnButtonColor: color(168, 168, 168)
});

var addQuestionButton = new Button ({
    x: 21/40 * width,
    y: 3/80 * height,
    width: 7/16 * width,
    textSize: 15,
    height: height/10,
    text: ["ADD QUESTION", "AGREGAR PREGUNTA"],
    color: color(163, 163, 163),
    stroke: color(0, 0, 0),
    mouseOnButtonColor: color(168, 168, 168),
    action: function () {
        if (checkForCompleteArrayOfArrays(questionVariables) && subject.length !== 0) {
            if (stringToPrint instanceof Text){
                stringToPrint = "[".concat("[", addQuoteSigns(subject[1].english), ", ", addQuoteSigns(subject[1].spanish), "]", ", ", "[", addQuoteSigns(subject[0][0]), ", ", addQuoteSigns(subject[0][1]), "]", ", ", "[", addQuoteSigns(questionVariables[0][0]), ", ", addQuoteSigns(questionVariables[0][1]), "]", ", ", "[", addQuoteSigns(questionVariables[1][0]), ", ", addQuoteSigns(questionVariables[1][1]), "]", ", ", "[", addQuoteSigns(questionVariables[2][0]), ", ", addQuoteSigns(questionVariables[2][1]), "]", ", ", "[", addQuoteSigns(questionVariables[3][0]), ", ", addQuoteSigns(questionVariables[3][1]), "]", ", ", "[", addQuoteSigns(questionVariables[4][0]), ", ", addQuoteSigns(questionVariables[4][1]), "]", "]");
            }
            
            else {
                stringToPrint = stringToPrint.concat(", ", "[", "[", addQuoteSigns(subject[1].english), ", ", addQuoteSigns(subject[1].spanish), "]", ", ", "[", addQuoteSigns(subject[0][0]), ", ", addQuoteSigns(subject[0][1]), "]", ", ", "[", addQuoteSigns(questionVariables[0][0]), ", ", addQuoteSigns(questionVariables[0][1]), "]", ", ", "[", addQuoteSigns(questionVariables[1][0]), ", ", addQuoteSigns(questionVariables[1][1]), "]", ", ", "[", addQuoteSigns(questionVariables[2][0]), ", ", addQuoteSigns(questionVariables[2][1]), "]", ", ", "[", addQuoteSigns(questionVariables[3][0]), ", ", addQuoteSigns(questionVariables[3][1]), "]", ", ", "[", addQuoteSigns(questionVariables[4][0]), ", ", addQuoteSigns(questionVariables[4][1]), "]", "]");
            }
        
            resetQuestionVariables();
        }
        
        else {
            println(areasNotCompleteNote.languages[currentLanguage]);
        }
    }
});

var description1 = new Rect ({
    text: ["TV Shows:", "Series de Televisión"]
});

var description2 = new Rect ({
    text: ["Movies:", "Películas"]
});

var flashButton = new Button ({
    action: function () {subject = [["tvshows", "flash"], new Text ("TV Shows: Flash", "Series de Televisión: Flash", subjectButton.x + subjectButton.text.languages[currentLanguage].length * (width/40), subjectButton.y + (17/400 * height))];
    },
    text: ["Flash", "Flash"]
});

var starWarsButton = new Button ({
    action: function () {subject = [["movies", "starwars"], new Text ("Movies: Star Wars", "Películas: Star Wars", subjectButton.x + subjectButton.text.languages[currentLanguage].length * (width/40), subjectButton.y + (17/400 * height))];},
    text: ["Star Wars", "Star Wars"]
});

var xMenButton = new Button ({
    action: function () {subject = [["movies", "xmen"], new Text ("Movies: X-Men", "Películas: X-Men", subjectButton.x + subjectButton.text.languages[currentLanguage].length * (width/40), subjectButton.y + (17/400 * height))];},
    text: ["X-Men", "X-Men"]
});

var arrowButton = new Button ({
    action: function () {subject = [["tvshows", "arrow"], new Text ("TV Shows: Arrow", "Series de Televisión: Arrow", subjectButton.x + subjectButton.text.languages[currentLanguage].length * (width/40), subjectButton.y + (17/400 * height))];},
    text: ["Arrow", "Arrow"]
});

var supernaturalButton = new Button ({
    action: function () {subject = [["tvshows", "supernatural"], new Text ("TV Shows: Supernatural", "Series de Televisión: Supernatural", subjectButton.x + subjectButton.text.languages[currentLanguage].length * (width/40), subjectButton.y + (17/400 * height))];},
    text: ["Supernatural", "Supernatural"]
});

var ouatButton = new Button ({
    action: function () {subject = [["tvshows", "ouat"], new Text ("TV Shows: Once Upon a Time", "Series de Televisión: Once Upon a Time", subjectButton.x + subjectButton.text.languages[currentLanguage].length * (width/40), subjectButton.y + (17/400 * height))];},
    text: ["Once Upon a Time", "Once Upon a Time"]
});

var subjectMenu = new ButtonMenu ({
    startingButton: subjectButton,
    thingsToDraw: [description1, flashButton, arrowButton, supernaturalButton, ouatButton, description2, starWarsButton, xMenButton]
});

subjectButton.action = function () {subjectMenu.beingDrawn = true;};
}

//After Answer Scenes
{
var congratulationsText = new Text ("Congratulations.\nYour answer is correct.", "Felicitaciones.\nTu respuesta es correcta.", width/2, height/4);
var wrongAnswerText = new Text ("Your answer was wrong.\nCorrect Answer:\n", "Tu respuesta fue incorrecta.\nRespuesta Correcta:\n", width/2, height/4);
var pointsText = new Text ("Points: 0", "Puntos: 0", width/2, height/2);
var errorsText = new Text ("Errors: 0", "Errores: 0", width/2, 27/40 * height);
var youLostText = new Text ("You Lost!\nCorrect Answer:\n", "¡Perdiste!\nRespuesta Correcta:\n", width/2, height/4);

var resetGame = function () {
    points = 0;
    errors = 0;
    youLostText = new Text ("You Lost!\nCorrect Answer:\n", "¡Perdiste!\nRespuesta Correcta:\n", 200, 100);
    errorsText = new Text ("Errors: 0", "Errores: 0", width/2, 27/40 * height);
    pointsText = new Text ("Points: 0", "Puntos: 0", width/2, height/2);
    wrongAnswerText = new Text ("Your answer was wrong.\nCorrect Answer:\n", "Tu respuesta fue incorrecta.\nRespuesta Correcta:\n", width/2, height/4);
};
var backToMenuButton2 = new Button ({
    text: ["Back To Menu", "Volver al menú"],
    x: width/16,
    width: 3/8 * width,
    height: height/8,
    color: color(168, 168, 168),
    y: 13/16 * height,
    textFont: impact,
    textColor: color(255, 255, 255),
    textSize: 21,
    mouseOnButtonColor: color(176, 176, 176),
    action: function () {currentScene = "menu";
    resetGame();
    }
});

var playAgainButton = new Button ({
    text: ["Play Again", "Volver a Jugar"],
    width: 3/8 * width,
    height: height/8,
    color: color(168, 168, 168),
    y: 13/16 * height,
    textFont: impact,
    textColor: color(255, 255, 255),
    textSize: 21,
    mouseOnButtonColor: color(176, 176, 176),
    x: 9/16 * width,
    action: function () {currentScene = "selectQuestion";
    framesPassed = frameCount;
    resetGame();
    }
});
var nextQuestionButton = new Button ({
    x: 11/40 * width,
    width: 9/20 * width,
    y: 159/200 * height,
    text: ["Next Question", "Siguiente Pregunta"],
    textColor: color(255, 255, 255),
    textFont: impact,
    color: color(168, 168, 168),
    textSize: 20,
    mouseOnButtonColor: color(176, 176, 176),
    action: function () {currentScene = "selectQuestion";
    framesPassed = frameCount;
    }
});
}

//Play Scene
{
var nextScene;
var dontKnowThisButton = new Button ({
    text: ["I haven't seen this", "No he visto esto"],
    x: 3/8 * width,
    y: 69/80 * height,
    textSize: 11,
    width: width/4,
    stroke: color(166, 166, 166),
    color: color(255, 255, 255),
    height: 7/80 * height,
    action: function () {
        unseenShows.push(currentQuestion.subject[1]);
        if (unseenShows.length < 6) {
            for (var i = 0; i < questions.length; i++) {
                if (questions[i].subject[1] === unseenShows[unseenShows.length - 1]) {
                    questionsToErase.push(i);
                }
            }
        
            if (questionsToErase.length > 0) {
                for (var i = 0; i < questionsToErase.length; i++) {
                    delete questions[questionsToErase[i]];
                }
            }
            questions = removeEmptyElementsInArray(questions);
            questionsToErase = [];
        }
        
        else {
            println("You can't erase any more questions.");
        }
        
        currentScene = "selectQuestion";
        framesPassed = frameCount;

    },
    mouseOnButtonColor: color(219, 219, 219)
});

var answers = [];

for (var i = 0; i < 4; i++) {
    answers.push(new Button({
        text: [],
        y: (43/80 + i * 3/40) * height,
        textSize: 11,
        width: 19/20 * width,
        height: height/20,
        color: color(255, 255, 255),
        x: width/40,
        stroke: color(166, 166, 166),
        mouseOnButtonColor: color(219, 219, 219)
    }));
}

answers[0].colorWhenPressed = color(77, 184, 48);
answers[0].action = function () {
    answerGiven = true;
    framesPassed = frameCount;
    nextScene = "correctAnswer";
    points++;
    pointsText.replace(points - 1, points);
};

answers[1].colorWhenPressed = color(255, 0, 0);
answers[1].action = function () {
    errors++;
    if (errors === 3) {
        nextScene = "youLost";
        pointsText = new Text ("Final Points: " + points, "Puntuación Final: " + points, width/2, 13/20 * height);
        youLostText.languages[0] = youLostText.languages[0].concat(currentQuestion.correctAnswer[0]);
        youLostText.languages[1] = youLostText.languages[1].concat(currentQuestion.correctAnswer[1]);
        var highscores = loadStrings("https://rawgit.com/Larpee/The-Khan-Quiz/master/highscores.txt");
        
        var biggestMatch = findBiggestMatch(highscores, points);
        
        if (biggestMatch !== false) {
            if (biggestMatch === highscores.length - 1) {
                highscores[highscores.length - 1] = points.toStr();
            }
            
            else {
                highscores.splice(biggestMatch, 0, points.toStr());
                highscores.pop();
            }
            
            saveStrings("https://rawgit.com/Larpee/The-Khan-Quiz/master/highscores.txt", highscores);
        }
    }
    
    else {
        if (errors === 1) {
            wrongAnswerText.languages[0] = wrongAnswerText.languages[0].concat(currentQuestion.correctAnswer[0]);
            wrongAnswerText.languages[1] = wrongAnswerText.languages[1].concat(currentQuestion.correctAnswer[1]);
        }
    
        else {
            wrongAnswerText.languages[0] = wrongAnswerText.languages[0].replace(usedQuestions[usedQuestions.length - 2].correctAnswer[0], currentQuestion.correctAnswer[0]);
            wrongAnswerText.languages[1] = wrongAnswerText.languages[1].replace(usedQuestions[usedQuestions.length - 2].correctAnswer[1], currentQuestion.correctAnswer[1]);
        }
        nextScene = "wrongAnswer";
        errorsText.replace(errors - 1, errors);
    }
    framesPassed = frameCount;
    answerGiven = true;
};

answers[2].colorWhenPressed = color(255, 0, 0);
answers[2].action = function () {
    errors++;
    if (errors === 3) {
        nextScene = "youLost";
        pointsText = new Text ("Final Points: " + points, "Puntuación Final: " + points, width/2, 13/40 * height);
        youLostText.languages[0] = youLostText.languages[0].concat(currentQuestion.correctAnswer[0]);
        youLostText.languages[1] = youLostText.languages[1].concat(currentQuestion.correctAnswer[1]);
        if (biggestMatch !== false) {
            if (biggestMatch === highscores.length - 1) {
                highscores[highscores.length - 1] = points.toStr();
            }
            
            else {
                highscores.splice(biggestMatch, 0, points.toStr());
                highscores.pop();
            }
            
            saveStrings("https://rawgit.com/Larpee/The-Khan-Quiz/master/highscores.txt", highscores);
        }
    }
    
    else {
        if (errors === 1) {
            wrongAnswerText.languages[0] = wrongAnswerText.languages[0].concat(currentQuestion.correctAnswer[0]);
            wrongAnswerText.languages[1] = wrongAnswerText.languages[1].concat(currentQuestion.correctAnswer[1]);
        }
    
        else {
            wrongAnswerText.languages[0] = wrongAnswerText.languages[0].replace(usedQuestions[usedQuestions.length - 2].correctAnswer[0], currentQuestion.correctAnswer[0]);
            wrongAnswerText.languages[1] = wrongAnswerText.languages[1].replace(usedQuestions[usedQuestions.length - 2].correctAnswer[1], currentQuestion.correctAnswer[1]);
        }
        nextScene = "wrongAnswer";
        errorsText.replace(errors - 1, errors);
    }
    framesPassed = frameCount;
    answerGiven = true;

};

answers[3].colorWhenPressed = color(255, 0, 0);
answers[3].action = function () {
    errors++;
    if (errors === 3) {
        nextScene = "youLost";
        pointsText = new Text ("Final Points: " + points, "Puntuación Final: " + points, width/2, 13/40 * height);
        youLostText.languages[0] = youLostText.languages[0].concat(currentQuestion.correctAnswer[0]);
        youLostText.languages[1] = youLostText.languages[1].concat(currentQuestion.correctAnswer[1]);
        if (biggestMatch !== false) {
            if (biggestMatch === highscores.length - 1) {
                highscores[highscores.length - 1] = points.toStr();
            }
            
            else {
                highscores.splice(biggestMatch, 0, points.toStr());
                highscores.pop();
            }
            
            saveStrings("https://rawgit.com/Larpee/The-Khan-Quiz/master/highscores.txt", highscores);
        }
    }
    
    else {
        if (errors === 1) {
            wrongAnswerText.languages[0] = wrongAnswerText.languages[0].concat(currentQuestion.correctAnswer[0]);
            wrongAnswerText.languages[1] = wrongAnswerText.languages[1].concat(currentQuestion.correctAnswer[1]);
        }
    
        else {
            wrongAnswerText.languages[0] = wrongAnswerText.languages[0].replace(usedQuestions[usedQuestions.length - 2].correctAnswer[0], currentQuestion.correctAnswer[0]);
            wrongAnswerText.languages[1] = wrongAnswerText.languages[1].replace(usedQuestions[usedQuestions.length - 2].correctAnswer[1], currentQuestion.correctAnswer[1]);
        }
        nextScene = "wrongAnswer";
        errorsText.replace(errors - 1, errors);
    }
    framesPassed = frameCount;
    answerGiven = true;
};
}

//Select Question Scene
{
var selectingQuestionMessage = new Text ("Selecting question.\nPlease wait.", "Seleccionando pregunta.\nPor favor espera.", width/2, height/2);
}

//Rules Scene
{
var rulesTitleText = new Text ("HOW TO PLAY", "CÓMO JUGAR", width/2, height/8);
var rulesText = new Text ("The goal of the game is to get as many\npoints as possible. You get a point\nevery time you answer a question\ncorrectly. You lose once you've made\nthree mistakes.\n\nIf you don't know the subject of\na question, just press the button that\nsays 'I haven't seen this'.", "El objetivo del juego es obtener tantos\npuntos como puedas. Obtienes un\npunto cada vez que respondes una\npregunta correctamente. Pierdes\ncuando cometes tres errores.\n\nSi no conoces el tema de una\npregunta, presiona el botón que\ndice 'No he visto esto'.", width/2, height/2);
var backToMenuButton3 = new Button ({
    text: ["Back To Menu", "Volver al Menú"],
    x: 11/40 * width,
    width: 17/40 * width,
    y: 67/80 * height,
    height: height/10,
    color: color(129, 139, 230),
    mouseOnButtonColor: color(139, 149, 230),
    textSize: 17,
    textColor: color(255, 255, 255),
    action: function () {currentScene = "menu";}
});
}
/*********
| Scenes |
*********/
var scenes = ({
    selectQuestion: function () {
        background(163, 163, 163);
        textAlign(CENTER, CENTER);
        textFont(sansSerif, 17);
        fill(255, 255, 255);
        selectingQuestionMessage.draw();
        
        
        if (questions.length === 0) {
            questions = usedQuestions;
        }
        
        if (!questionSelected) {
            currentQuestionIndex = floor(random(0, questions.length));
            currentQuestion = questions[currentQuestionIndex];
            questions.splice(currentQuestionIndex, 1);
            usedQuestions.push(currentQuestion);
            answers.sort(function () {return 0.5 > random();});
            for (var i = 0; i < answers.length; i++) {
                if (answers[i].colorWhenPressed !== -65536) {
                    answers[i].text = new Text (currentQuestion.correctAnswer[0], currentQuestion.correctAnswer[1]);
                }
                
                else {
                    answers[i].text = new Text (currentQuestion.answers[currentQuestion.possibleIndexes[0]][0], currentQuestion.answers[currentQuestion.possibleIndexes[0]][1]);
                    currentQuestion.possibleIndexes.shift();
                }
                answers[i].y = (43/80 + i * 3/40) * height;
            }
            
            questionSelected = true;
        }
        
        else if (frameCount-framesPassed > 30) {
            currentScene = "play";
            questionSelected = false;
            currentQuestion.possibleIndexes = [0, 1, 2];
            currentQuestion.answers.sort(function () {return 0.5 < random();});
            
        }
    },
    play: function () {
        noLoop();
        currentQuestion.draw();
        for (var i = 0; i < answers.length; i++) {
            answers[i].draw();
            if (!answerGiven) {
                answers[i].mouseOnButton();
            }
        }
        dontKnowThisButton.draw();
        
        if (answerGiven) {
            if (frameCount - framesPassed > 30) {
                answerGiven = false;
                for (var i = 0; i < answers.length; i++) {
                   answers[i].color = color(255, 255, 255);
                    answers[i].colorToDraw = color(255, 255, 255);
                }
                
                currentScene = nextScene;
            }
        }
        
        else {
            dontKnowThisButton.mouseOnButton();
        }
        
        loop();
    },
    menu: function () {
        noLoop();
        background(187, 255, 173);
        fill(44, 122, 27); 
        textSize(33/800 * (width + height));
        textAlign(CENTER, CENTER);
        gameTitle.draw();
        textSize(27/800 * (width + height));
        gameDescription.draw();
        playButton.draw();
        rulesButton.draw();
        addQuestionSceneButton.draw();
        languageButton.draw();
        stroke(60, 158, 38);
        strokeWeight(2);
        loop();
        
        if (languageMenu.beingDrawn) {
            languageMenu.draw();
            languageMenu.mouseOnButton();
        }
        
        else {
            addQuestionSceneButton.mouseOnButton();
            playButton.mouseOnButton();
            rulesButton.mouseOnButton();
            languageButton.mouseOnButton();
        }
    },
    addQuestion: function () {
        background(235, 235, 235);
        fill(0, 0, 0);
    
        subjectButton.draw();
    
        addQuestionButton.draw();
        printQuestionButton.draw();
        backToMenuButton1.draw();
        textAlign(CENTER, CENTER);
        textSize(13);
        explanationParagraph.draw();
        
        for (var i = 0; i < questionVariables.length; i++) {
            questionButtons[i].draw();
            textSize(10);
            if (questionVariables[i][currentLanguage].length * 4 > questionButtons[i].width - questionStrings[i][currentLanguage].length * 6) {
                questionVariables[i][currentLanguage] = questionVariables[i][currentLanguage].substring(0, questionVariables[i][currentLanguage].length - 1);
            }
            textAlign(LEFT, LEFT);
            text(questionVariables[i][currentLanguage], questionButtons[i].x + questionStrings[i][currentLanguage].length * (7.5/400 * width), questionButtons[i].y + (17/400 * height));
        }
        
        if (subject[1] !== undefined) {
            subject[1].draw();   
        }
        
        if (subjectMenu.beingDrawn) {
            subjectMenu.draw();
            subjectMenu.mouseOnButton();
        } 
    
        else {
            addQuestionButton.mouseOnButton();
            printQuestionButton.mouseOnButton();
            backToMenuButton1.mouseOnButton();
        }
    },
    correctAnswer: function () {
        background(199, 199, 199);
        textFont(impact, 35);
        textAlign(CENTER, CENTER);
        fill(255, 255, 255);
        congratulationsText.draw();
        pointsText.draw();
        errorsText.draw();
        nextQuestionButton.draw();
        nextQuestionButton.mouseOnButton();
    },
    wrongAnswer: function () {
        background(199, 199, 199);
        textFont(impact, 32);
        textAlign(CENTER, CENTER);
        fill(255, 255, 255);
        pointsText.draw();
        errorsText.draw();
        wrongAnswerText.draw();
        nextQuestionButton.draw();
        nextQuestionButton.mouseOnButton();
    },
    youLost: function () {
        background(199, 199, 199);
        textFont(impact, 32);
        textAlign(CENTER, CENTER);
        fill(255, 255, 255);
        pointsText.draw();
        youLostText.draw();
        stroke(168, 168, 168);
        strokeWeight(3);
        line(0, 200, 400, 200);
        backToMenuButton2.draw();
        backToMenuButton2.mouseOnButton();
        playAgainButton.draw();
        playAgainButton.mouseOnButton();
    },
    rules: function () {
        background(159, 169, 230);
        textAlign(CENTER, CENTER);
        textFont(sansSerif, 34);
        fill(255, 255, 255);
        rulesTitleText.draw();
        textSize(22);
        rulesText.draw();
        backToMenuButton3.draw();
        backToMenuButton3.mouseOnButton();
    }
});

draw = function () {
    switch (currentScene) {
        case "menu":
            scenes.menu();
        break;
        
        case "selectQuestion":
            scenes.selectQuestion();
        break;
        
        case "addQuestion":
            scenes.addQuestion();
        break;
        
        case "play":
            scenes.play();
        break;
        
        case "correctAnswer":
            scenes.correctAnswer();
        break;
        
        case "wrongAnswer":
            scenes.wrongAnswer();
        break;
        
        case "youLost":
            scenes.youLost();
        break;
        
        case "rules":
            scenes.rules();
        break;
        
    }
    
    
};
mouseClicked = function () {
    switch (currentScene) {
        case "menu":
            if (languageMenu.beingDrawn) {
                languageMenu.handleMouseClick();
            }
            
            else {
                playButton.handleMouseClick();
                rulesButton.handleMouseClick();
                addQuestionSceneButton.handleMouseClick();
                languageButton.handleMouseClick();
            }
            
        break;
        
        case "addQuestion":
            if (subjectMenu.beingDrawn) {
                subjectMenu.handleMouseClick();
            }
        
            else {
                for (var i = 0; i < questionButtons.length; i++) {
                    questionButtons[i].handleMouseClick();
                }
                
                printQuestionButton.handleMouseClick();
                addQuestionButton.handleMouseClick();
                subjectButton.handleMouseClick();
                backToMenuButton1.handleMouseClick();
            }
        break;
        
        case "play":
            if (!answerGiven) {
                for (var i = 0; i < answers.length; i++) {
                    answers[i].handleMouseClick();   
                }
                
                dontKnowThisButton.handleMouseClick();
            }
        break;
        
        case "correctAnswer":
            nextQuestionButton.handleMouseClick();
        break;
        
        case "wrongAnswer":
            nextQuestionButton.handleMouseClick();
        break;
        
        case "youLost":
            backToMenuButton2.handleMouseClick();
            playAgainButton.handleMouseClick();
        break;
        
        case "rules":
            backToMenuButton3.handleMouseClick();
        break;
    }
    
    
};
keyPressed = function () {
    if (currentScene === "addQuestion") {
        if (!subjectMenu.beingDrawn) {
            capsLockOn = searchForSpecialKey(capsLockOn, 20);
            shiftOn = searchForSpecialKey(shiftOn, 16);
            accentOn = searchForSpecialKey(accentOn, 186);
    
            if (capsLockOn) {
                for (var i = 0; i < alphabet.length; i++) {
                    alphabet[i] = alphabet[i].toUpperCase();
                }
            }
    
            else {
                for (var i = 0; i < alphabet.length; i++) {
                    alphabet[i] = alphabet[i].toLowerCase();
                }
            }
    
            if (shiftOn) {
                for (var i = 0; i < shiftIndexes.length; i++) {
                    alphabet[shiftIndexes[i]] = shiftCharacters[i][0];
                }
                
                if (keyCode === 186) {
                    diaeresisOn = !diaeresisOn;
                }
            }
    
            else {
                for (var  i = 0; i < shiftIndexes.length; i++) {
                    alphabet[shiftIndexes[i]] = shiftCharacters[i][1];
                }
            }
            
            if (accentOn && !diaeresisOn) {
                for (var i = 0; i < accentIndexes.length; i++) {
                    alphabet[accentIndexes[i]] = accentCharacters[i][0];
                }
                
            }
            
            else {
                if (capsLockOn) {
                    for (var i = 0; i < accentIndexes.length; i++) {
                        alphabet[accentIndexes[i]] = capitalize(accentCharacters[i][1]);
                    }
                }
                
                else {
                    for (var i = 0; i < accentIndexes.length; i++) {
                        alphabet[accentIndexes[i]] = accentCharacters[i][1];
                    }
                }
            }
            
            if (diaeresisOn) {
                alphabet[31] = "ü";
            }
            
            else {
                if (capsLockOn) {
                    alphabet[31] = "U";
                }
                
                else {
                    alphabet[31] = "u";
                }
            }
    
            if (keyCode === 8) {
                questionVariables[fieldToUpdate][currentLanguage] = questionVariables[fieldToUpdate][currentLanguage].slice(0, questionVariables[fieldToUpdate][currentLanguage].length - 1);
            }
        
            else {
                for (var i = 0; i < alphabet.length; i++) {
                    if (keyCode === keyCodes[i]) {
                        questionVariables[fieldToUpdate][currentLanguage] += alphabet[i];
                        questionVariables[fieldToUpdate][currentLanguage] = capitalize(questionVariables[fieldToUpdate][currentLanguage]);
                    }
                }
            }
            
            if (diaeresisOn && keyCode === 85) {
                diaeresisOn = false;
            }
        }
    }
};
}
