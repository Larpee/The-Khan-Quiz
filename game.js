var currentScene = "menu";
var points = 0;
var errors = 0;
var questions = [];
var usedQuestions = [];
var questionSelected = false;
var finishedQuestions = [];

size(400, 400, 0);
var sortArray = function (array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

var Rect = function (config) {
    this.x = config.x || width/2;
    this.y = config.y;
    this.width = config.width || 35/40 * width;
    this.height = config.height || 50;
    this.stroke = config.stroke || color(0, 0, 0);
    this.fill = config.fill || color(255, 255, 255);
    this.text = config.text;
    this.textColor = config.textColor || color(0, 0, 0);
    this.textSize = config.textSize || 16/800 * (width + height);
};

Rect.prototype.draw = function() {
    strokeWeight(1.9/800 * (width+height));
    stroke(this.stroke);
    fill(this.fill);
    rectMode(CENTER);
    
    rect(this.x, this.y, this.width, this.height, 15);
    
    fill(this.textColor);
    textAlign(CENTER, CENTER);
    textSize(this.textSize);
    
    text(this.text, this.x - this.width/2, this.y - this.height/2 - (width + height)/160, this.width, this.height);
    
    
};

var Button = function (config) {
    Rect.call(this, config);
    
    this.onButtonAction = config.onButtonAction || function () {
        this.width -= 3/40 * width;
        this.textSize -= 3/800 * (width + height);
    };
    
    this.buttonOutAction = config.buttonOutAction || function () {
        this.width += 3/40 * width;
        this.textSize += 3/800 * (width + height);
    };
    
    this.mouseWasIn = false;
    
    this.action = config.action || function () {println(1);};
};

Button.prototype = Object.create(Rect.prototype);

Button.prototype.isMouseInside = function () {
    return mouseX > this.x - this.width/2 && mouseX < this.x + this.width/2 && mouseY > this.y - this.height/2 && mouseY < this.y + this.height/2;
};

Button.prototype.onButton = function () {
    if (this.isMouseInside()) {
        if (!this.mouseWasIn) {
            this.onButtonAction();
            this.mouseWasIn = true;
        }
    }
    
    else if (this.mouseWasIn) {
        this.buttonOutAction();
        this.mouseWasIn = false;
    }
};

Button.prototype.handleClick = function () {
    if (this.isMouseInside()) {
        this.action();
    }
};

var Question = function (question, correctAnswer, answer1, answer2, answer3) {
    this.question = question;
    this.correctAnswer = correctAnswer;
    this.wrongAnswers = [answer1, answer2, answer3];
    this.answers = [correctAnswer, answer1, answer2, answer3];
    
    this.correctAction = function () {
        points++;
        currentScene = "correctAnswer";
        finishedQuestions.push(questions[0]);
        questions.splice(0, 1);
        
        if (questions.length === 0 && usedQuestions.length === 0) {
            currentScene = "youWon";
        }
    };
    
    this.incorrectAction = function () {
        errors++;
        
        if (errors === 3) {
            currentScene = "youLost";
        }
        
        else {
            currentScene = "wrongAnswer";
        }
        
        usedQuestions.push(questions[0]);
        questions.splice(0, 1);
    };
};

Question.prototype.prepare = function (buttons, questionRect) {
    this.answers = sortArray(this.answers);
    for (var i = 0; i < this.answers.length; i++) {
        buttons[i].text = this.answers[i];
        
        if (this.answers[i] !== this.correctAnswer) {
            buttons[i].action = this.incorrectAction;
        }
        
        else {
            buttons[i].action = this.correctAction;
        }
    }
    
    questionRect.text = this.question;
};

Question.make = function (question) {
    var newQuestion = new Question (question[0], question[1], question[2], question[3], question[4]);
    
    return newQuestion;
};

questions = [["¿Quiénes conforman el Big Four?", "Federer, Murray, Nadal y Djokovic", "Federer, Nadal, Djokovic y Wawrinka", "Wawrinka, Murray, Federer y Djokovic", "Djokovic, Del Potro, Nadal y Federer"], ["¿Cuántos Grand Slams ganó Roger Federer?", "18", "16", "17", "15"], ["¿Cuál de los cuatro Grand Slams se creó primero?", "Wimbledon", "Roland Garros", "Australian Open", "US Open"], ["¿Cuál fue el primer argentino que logró ganar un Grand Slam?", "Guillermo Vilas", "José Luis Clerc", "Martín Jaite", "Juan Martín del Potro"], ["¿Qué país ganó más ediciones de la Copa Davis?", "Estados Unidos", "Francia", "Inglaterra", "España"], ["¿A qué país le ganó Argentina la final de la Copa Davis en 2016?", "Croacia", "Italia", "Serbia", "Suiza"], ["¿Cuántas veces ganó Federer el Roland Garros?", "1", "3", "4", "Ninguna opción es correcta"],  ["¿En qué ciudad se juega actualmente el ATP World Tour Finals?", "Londres", "Zurich", "Tokio", "Ninguna opción es correcta"], ["¿Cómo apodaban a Juan Ignacio Chela?", "El flaco", "El gordo", "La torre", "Ninguna opción es correcta"], ["¿En qué año Rafael Nadal ganó por primera vez Wimbledon?", "2008", "2006", "2007", "Ninguna opción es correcta"], ["¿Qué Grand Slam tiene el estadio de tenis más grande del mundo?", "US Open", "Australian Open", "Wimbledon", "Ninguna opción es correcta"], ["¿Con qué equipo Argentina logró vencer a Croacia en la final de la Copa Davis 2016?", "Del Potro, Delbonis, Pella y Mayer", "Del Potro, Delbonis, Olivo y Mayer", "Del Potro, Monaco, Berlocq y Olivo", "Ninguna opción es correcta"], ["¿Quién declaró que Rafael Nadal, luego de perder un partido en Buenos Aires, rompió siete raquetas?", "Gastón Gaudio", "Guillermo Coria", "David Ferrer", "Ninguna opción es correcta"], ["¿Qué jugadores consiguieron llegar a la cima del ranking ATP tanto en singles como en dobles?", "John McEnroe y Stefan Edberg", "Mike y Bob Brian", "Andre Agassi y Pete Sampras", "Ninguna opción es correcta"], ["¿Cuánto duró el partido de tenis más largo de la historia (John Isner y Nicolás Mahut en Wimbledon)?", "11h 5m", "12h 5m", "13h 5m", "Ninguna opción es correcta"], ["¿Quién es el único tenista que logró ser el N°1 del mundo, pero no consiguió ganar ningún Grand Slam?", "Marcelo Ríos", "Manolo Santana", "Iván Lendl", "Ninguna opción es correcta"]];

questions = sortArray(questions);
/******************
| Vars for Scenes |
******************/
// Function to quickly draw background
var back = function () {
    background(255, 162, 0);
};


// Made for arrays of buttons. Contains shorthand functions for the three button methods
var buttonActions = {
    draw: function (buttons) {
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].draw();
        }
    },
    
    mouseOn: function (buttons) {
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].onButton();
        }
    },
    
    handleClick: function (buttons) {
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].handleClick();
        }
    }
};

// Menu
{
var framesPassed;

var helpButton = new Button ({
    y: 67/80 * height, text: "Help"
});
}

// Play
{
var correctAnswer;
var answerButtons = [];

for (var i = 0; i < 4; i++) {
    answerButtons.push(new Button ({
        y: 21/40 * height + i * height/8,
        height: 9/80 * height
    }));
}

var questionRect = new Rect ({
    y: 19/80 * height,
    height: height/3,
    textSize: 16/800 * (width + height)
});

}

// After answer scenes
{
var reset = function () {
    points = 0;
    errors = 0;
    for (var i = 0; i < finishedQuestions.length; i++) {
        questions.push(finishedQuestions[i]);
    }
    
    for (var i = 0;i < usedQuestions.length; i++) {
        questions.push(usedQuestions[i]);
    }
    usedQuestions = [];
    finishedQuestions = [];
    questions = sortArray(questions);
};
}

// Final Scenes


var scenes = {
    menu: {
        buttons: [
            new Button ({y: 27/40 * height, text: "Jugar", action: function () {
                currentScene = "selectQuestion";
            }}),
            new Button ({y: 17/20 * height, text: "Ayuda", action: function () {currentScene = "help" ;}})
        ],
        
        draw: function () {
            back();
            buttonActions.draw(this.buttons);
            textSize((width + height)/15);
            fill(0, 0, 0);
            textAlign(CENTER, CENTER);
            text("TST Quiz", width/2, 3/10*height);
        },
        
        mouseMoved: function () {
            buttonActions.mouseOn(this.buttons);
        },
        
        mouseClicked: function () {
            buttonActions.handleClick(this.buttons);
        }
    },
    selectQuestion: {
        draw: function () {
            back();
            textAlign(CENTER, CENTER);
            textSize((width+height)/35);
            fill(0, 0, 0);
            text("Seleccionando pregunta...", width/2, height/2);
            
            if (!questionSelected) {
                if (questions.length === 0) {
                    questions = usedQuestions;
                    usedQuestions = [];
                    questions = sortArray(questions);
                }
                
                if (!(questions[0] instanceof Question)) {
                    questions[0] = Question.make(questions[0]);
                }
                
                questions[0].prepare(answerButtons, questionRect);
                questionSelected = true;
                framesPassed = frameCount;
            }
            
            if (questionSelected && (frameCount - framesPassed) > 50) {
                currentScene = "play";
                questionSelected = false;
            }
        },
        mouseMoved: function () {},
        mouseClicked: function () {}
    },
    play: {
        draw: function() {
            back();
            buttonActions.draw(answerButtons);
            questionRect.draw();
        },
        
        mouseClicked: function () {
            buttonActions.handleClick(answerButtons);
        },
        
        mouseMoved: function () {
            buttonActions.mouseOn(answerButtons);
        }
    },
    correctAnswer: {
        buttons: [new Button ({ y: 7/8* height, text: "Siguiente pregunta", action: function () {currentScene = "selectQuestion";}})],
        draw: function () {
            back();
            buttonActions.draw(this.buttons);
            
            textAlign(CENTER, CENTER);
            textSize((width + height) * 9/200);
            fill(0, 0, 0);
            text("¡Respuesta Correcta!", width/2, 7/40 * height);
            
            textSize((width + height) * 3/80);
            text("Puntos: " + points, width/2, 7/16 * height);
            text("Errores: " + errors, width/2, 49/80 * height);
        },
        mouseMoved: function () {
            buttonActions.mouseOn(this.buttons);
        },
        mouseClicked: function () {
            buttonActions.handleClick(this.buttons);
        }
    },
    wrongAnswer: {
        buttons: [new Button ({ y: 7/8* height, text: "Siguiente pregunta", action: function () {currentScene = "selectQuestion";}})],
        draw: function () {
            back();
            buttonActions.draw(this.buttons);
            
            textAlign(CENTER, CENTER);
            textSize(33/800 * (width + height));
            text("¡Respuesta Incorrecta!", width/2, 7/40 * height);
            
            textSize(12/400 * (width + height));
            text("Puntos: " + points, width/2, 35/80 * height);
            text("Errores: " + errors, width/2, 3/5 * height);
        },
        mouseMoved: function () {
            buttonActions.mouseOn(this.buttons);
        },
        mouseClicked: function () {
            buttonActions.handleClick(this.buttons);
        }
    },
    youLost: {
        buttons: [
            new Button ({
                text: "Volver al menú",
                y: 9/10 * height,
                action: function () {
                    reset();
                    currentScene = "menu";
                }
            }),
            new Button ({
                text: "Volver a Jugar",
                y: 3/4 * height,
                action: function () {
                    reset();
                    currentScene = "selectQuestion";
                }
            })
        ],
        
        draw: function () {
            back();
            buttonActions.draw(this.buttons);
            
            textAlign(CENTER, CENTER);
            textSize(1/20 * (width + height));
            text("¡Perdiste!", width/2, 3/16 * height);
            
            textSize(1/26 * (width + height));
            text("Puntos: " + points, width/2, 9/20 * height);
            
        },
        mouseMoved: function () {
            buttonActions.mouseOn(this.buttons);
        },
        mouseClicked: function () {
            buttonActions.handleClick(this.buttons);
        }
    },
    help: {
        buttons: [new Button ({
            text: "Volver al Menú",
            y: 71/80 * height,
            action: function () {currentScene = "menu";}
        })],
        
        draw: function () {
            back();
            buttonActions.draw(this.buttons);
            
            textAlign(CENTER, CENTER);
            textSize(25);
            fill(0, 0, 0);
            
            text("El objetivo del juego es acumular\ntodos los puntos que puedas.\nGanás un punto por cada\npregunta que respondas\ncorrectamente.\n\nPerdés cuando te equivocás\ntres veces.", width/2, 165);
        },
        mouseMoved: function () {
            buttonActions.mouseOn(this.buttons);
        },
        mouseClicked: function () {
            buttonActions.handleClick(this.buttons);
        }
    },
    youWon: {
        buttons: [new Button ({
                text: "Volver a Jugar",
                y: 3/4 * height,
                action: function () {
                    reset();
                    currentScene = "selectQuestion";
                }
            })],
        draw: function () {
            back();
            buttonActions.draw(this.buttons);
            textAlign(CENTER, CENTER);
            textSize(20);
            fill(0, 0, 0);
            text("¡Felicitaciones!\n¡Ganaste!", width/2, height/4);
        },
        mouseMoved: function () {
            buttonActions.mouseOn(this.buttons);
        },
        mouseClicked: function () {
            buttonActions.handleClick(this.buttons);
        }
    }
};


draw = function() {
    scenes[currentScene].draw();
};

mouseMoved = function () {
    scenes[currentScene].mouseMoved();
};

mouseClicked = function () {
    scenes[currentScene].mouseClicked();
};

