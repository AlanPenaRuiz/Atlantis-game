var AMOUNT_DIAMONDS = 30;
//objeto
GamePlayManager = {
    //inicializar variables
    init: function() {
        //Responsive
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        //Alinea horizontal y vertical
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        this.flagFirstMouseDown = false;
        this.amountDiamondsCaught = 0;
        this.endGame = false;

    },
    //Carga de recursos
    preload: function() {
        console.log('preload');
        //asignamos nombre, ruta del recurso
        game.load.image('background', 'assets/images/temp4.jpg ');
        game.load.spritesheet('horse', 'assets/images/horse.png', 84, 156, 2); //ancho, alto, numero imagenes
        game.load.spritesheet('diamonds', 'assets/images/diamonds.png', 81, 84, 4);
        game.load.image('explosion', 'assets/images/explosion.png');
        game.load.image('shark', 'assets/images/shark.png');
        game.load.image('fishes', 'assets/images/fishes.png');
        game.load.image('mollusk', 'assets/images/mollusk.png');
    },
    //Utilizar recursos
    create: function() {
        console.log('create');
        //BACKGROUND RESPONSIVE
        bg = game.add.sprite(160, 32, 'background');
        bg.x = 0;
        bg.y = 0;
        bg.height = game.height;
        bg.width = game.width;
        //Imagenes fondo
        this.mollusk = game.add.sprite(500, 150, 'mollusk');
        this.mollusk.scale.setTo(0.25, 0.25);

        this.shark = game.add.sprite(500, 20, 'shark');
        this.fishes = game.add.sprite(100, 550, 'fishes');
        //Player
        this.horse = game.add.sprite(0, 0, 'horse');
        this.horse.frame = 0; //cambiamos el valor 0 o 1 para cambiar frame
        //posicionamos la imagen en mitad de la pantalla x,y
        this.horse.x = game.width / 2;
        this.horse.y = game.height / 2;
        //asigar punto referencia imagen al medio
        this.horse.anchor.setTo(0.5, 0.5);

        //Caputra el primer clic en pantalla y llama la funcion onTap
        game.input.onDown.add(this.onTap, this);
        //Angulo
        //this.horse.angle = 20;

        //Escalado imagen (ancho, alto)
        //this.background.scale.setTo(0.25, 0.25);
        //this.horse.scale.setTo(1, 1);
        //Transparencia
        //this.horse.alpha = 0.8;
        this.diamonds = []; //Array diamantes
        for (i = 0; i < AMOUNT_DIAMONDS; i++) {
            //Creamos el diamante
            var diamond = game.add.sprite(100, 100, 'diamonds');
            diamond.frame = game.rnd.integerInRange(0, 3); //seleccion de diamante random
            diamond.scale.setTo(0.30 + game.rnd.frac()); //Tamaño random
            diamond.anchor.setTo(0.5); //Punto referencia imagen
            diamond.x = game.rnd.integerInRange(50, 1050);
            diamond.y = game.rnd.integerInRange(50, 600);
            //Guardamos diamante en el array
            this.diamonds[i] = diamond;
            //Tomamos los limites del diamante creado con getBoundsDiamond
            var rectCurrenDiamond = this.getBoundsDiamond(diamond);
            var rectHorse = this.getBoundsDiamond(this.horse); //Limites caballo
            //Reposicionamos si se superponen
            while (this.isOverlapingOtherDiamond(i, rectCurrenDiamond) || this.isRectanglesOverlapping(rectHorse, rectCurrenDiamond)) {
                diamond.x = game.rnd.integerInRange(50, 1050);
                diamond.y = game.rnd.integerInRange(50, 600);
                rectCurrenDiamond = this.getBoundsDiamond(diamond);
            }
        }
        //Grupo explosiones 10 desactivadas
        this.explosionGroup = game.add.group();
        for (var i = 0; i < 10; i++) {
            this.explosion = this.explosionGroup.create(100, 100, 'explosion');
            //tween anima un sprite
            this.explosion.tweenScale = game.add.tween(this.explosion.scale).to({
                x: [0.4, 0.8, 0.4], //Animacion explosion
                y: [0.4, 0.8, 0.4]
                    //milisegundos, tipo de easing,autostart,delay,repeticion,yo-yo animacion
            }, 600, Phaser.Easing.Exponential.Out, false, 0, 0, false);
            this.explosion.tweenAlpha = game.add.tween(this.explosion).to({
                alpha: [1, 0.5, 0]
            }, 600, Phaser.Easing.Exponential.Out, false, 0, 0, false);
            this.explosion.anchor.setTo(0.5);
            this.explosion.kill();
        }
        //SCORE
        this.currentScore = 0;
        var style = {
            font: 'bold 30pt Arial',
            fill: '#FFFFFF',
            align: 'center'
        }

        this.scoreText = game.add.text(game.width / 2, 40, '0', style);
        this.scoreText.anchor.setTo(0.5);
        //TIMER
        this.totalTime = 20;
        this.timerText = game.add.text(1000, 40, this.totalTime + '', style);
        this.timerText.anchor.setTo(0.5);

        this.timerGameOver = game.time.events.loop(Phaser.Timer.SECOND, function() {
            if (this.flagFirstMouseDown) {
                this.totalTime--;
                this.timerText.text = this.totalTime + '';
                if (this.totalTime <= 0) {
                    game.time.events.remove(this.timerGameOver);
                    this.endGame = true;
                    this.showFinalMessage('GAME OVER');
                }
            }
        }, this);
    },
    increaseScore: function() {
        this.countSmile = 0;
        this.horse.frame = 1;
        this.currentScore += 100;
        this.scoreText.text = this.currentScore;

        this.amountDiamondsCaught += 1;
        if (this.amountDiamondsCaught >= AMOUNT_DIAMONDS) {
            game.time.events.remove(this.timerGameOver);
            this.endGame = true;
            this.showFinalMessage('CONGRATULATIONS');
            setTimeout(function() {
                location.reload();
            }, 5000);
        }
    },
    showFinalMessage: function(msg) {
        var bgAlpha = game.add.bitmapData(game.width, game.height);
        bgAlpha.ctx.fillStyle = '#000000';
        bgAlpha.ctx.fillRect(0, 0, game.width, game.height);

        var bg = game.add.sprite(0, 0, bgAlpha);
        bg.alpha = 0.5;

        var style = {
            font: 'bold 60pt Arial',
            fill: '#FFFFFF',
            align: 'center'
        }

        this.textFieldFinalMsg = game.add.text(game.width / 2, game.height / 2, msg, style);
        this.textFieldFinalMsg.anchor.setTo(0.5);
    },
    //Ativador al hacer primer clic en pantalla
    onTap: function() {
        //Tween de medusa con easing y yoyo
        if (!this.flagFirstMouseDown) {
            this.tweenMollusk = game.add.tween(this.mollusk.position).to({ y: -0.001 }, 5800, Phaser.Easing.Cubic.InOut, true, 0, 1000, true).loop(true);
        }
        this.flagFirstMouseDown = true;
    },
    //Devuelve LIMITES de las imagenes
    getBoundsDiamond: function(currentDiamond) {
        return new Phaser.Rectangle(currentDiamond.left, currentDiamond.top, currentDiamond.width, currentDiamond.height);
    },

    //Superposicion rectangulos
    isRectanglesOverlapping: function(rect1, rect2) {
        if (rect1.x > rect2.x + rect2.width || rect2.x > rect1.x + rect1.width) {
            return false;
        }
        if (rect1.y > rect2.y + rect2.height || rect2.y > rect1.y + rect1.height) {
            return false;
        }
        return true;
    },
    //Check nuevo diamante con los anteriores
    isOverlapingOtherDiamond: function(index, rect2) {
        for (var i = 0; i < index; i++) {
            var rect1 = this.getBoundsDiamond(this.diamonds[i]);
            if (this.isRectanglesOverlapping(rect1, rect2)) {
                return true;
            }
        }
        return false;
    },
    //Tomamos rectangulo caballo (x, y, with, height)
    getBoundsHorse: function() {
        var x0 = this.horse.x - Math.abs(this.horse.width) / 2; //Math.abs devuelve el numero positivo siempre
        var width = Math.abs(this.horse.width);
        var y0 = this.horse.y - Math.abs(this.horse.height) / 2;
        var height = this.horse.height;

        return new Phaser.Rectangle(x0, y0, width, height);
    },
    //render visualiza los rectangulos de los sprites
    /* render: function() {
        game.debug.spriteBounds(this.horse);
        for (var i = 0; i < AMOUNT_DIAMONDS; i++) {
            game.debug.spriteBounds(this.diamonds[i]);
        }
    }, */
    //Update
    update: function() {
        if (this.flagFirstMouseDown && !this.endGame) {
            //Animacion caballo
            if (this.countSmile >= 0) {
                this.countSmile++;
                if (this.countSmile > 50) {
                    this.countSmile = -1;
                    this.horse.frame = 0;
                }
            }
            //Animaciones ambientales
            this.shark.x--;
            if (this.shark.x < -300) {
                this.shark.x = 1300;
            }

            this.fishes.x += 0.3;
            if (this.fishes.x > 1300) {
                this.fishes.x = -300;
            }
            //this.horse.angle += 1; //Rotacion
            var pointerX = game.input.x;
            var pointerY = game.input.y;
            /* console.log('x:' + pointerX);
            console.log('y:' + pointerY); */ //Coordenadas del mouse en consola
            //Orientacion del caballo respecto al puntero
            var distX = pointerX - this.horse.x;
            var distY = pointerY - this.horse.y;
            if (distX > 0) {
                this.horse.scale.setTo(1, 1);
            } else {
                this.horse.scale.setTo(-1, 1);
            }

            //Seguimiento imagen al puntero con retardo
            this.horse.x += distX * 0.02;
            this.horse.y += distY * 0.02;
        }
        //Detector colision caballo-diamante
        for (var i = 0; i < AMOUNT_DIAMONDS; i++) {
            var rectHorse = this.getBoundsHorse();
            var rectDiamond =
                this.getBoundsDiamond(this.diamonds[i]);
            //Animacion explosion    
            if (this.diamonds[i].visible && this.isRectanglesOverlapping(rectHorse, rectDiamond)) {
                //console.log("COLLISION");
                this.increaseScore();
                this.diamonds[i].visible = false;

                var explosion = this.explosionGroup.getFirstDead();
                if (explosion != null) {
                    explosion.reset(this.diamonds[i].x, this.diamonds[i].y);
                    explosion.tweenScale.start();
                    explosion.tweenAlpha.start();

                    explosion.tweenAlpha.onComplete.add(function(currentTarget, currentTween) {
                        currentTarget.kill();
                    }, this);
                }
            }
        }
    }
}

var game = new Phaser.Game(1136, 640, Phaser.AUTO); //(width,height,metedo renderizado)

//añadir estado(nombre, objeto)
game.state.add('gameplay', GamePlayManager);

//start
game.state.start('gameplay');