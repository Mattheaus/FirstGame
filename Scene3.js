class Scene3 extends Phaser.Scene {
    constructor() {
        super("playGame");
    }

    create() {

        this.background = this.add.tileSprite(0, 0, config.width, config.height, "background");
        this.background.setOrigin(0, 0);

        this.ship1 = this.add.sprite(config.width / 2 - 50, 0, "ship");
        this.ship2 = this.add.sprite(config.width / 2, 0, "ship2");
        this.ship3 = this.add.sprite(config.width / 2 + 50, 0, "ship3");

        this.enemies = this.physics.add.group();
        this.enemies.add(this.ship1);
        this.enemies.add(this.ship2);
        this.enemies.add(this.ship3);

        this.ship1.play("ship1_anim");
        this.ship2.play("ship2_anim");
        this.ship3.play("ship3_anim");

        this.physics.world.setBoundsCollision();

        this.powerUps = this.physics.add.group();

        for (var i = 0; i <= gameSettings.maxObjects; i++) {
            var powerUp = this.physics.add.sprite(16, 16, "power-up").setScale(.75);
            this.powerUps.add(powerUp);
            powerUp.setRandomPosition(0, 0, game.config.width, game.config.height * 1 / 4);

            if (Math.random() > 0.2) {
                powerUp.play("red");
            } else {
                powerUp.play("gray");
            }

            powerUp.setVelocity(100, 100);
            powerUp.setCollideWorldBounds(true);
            powerUp.setBounce(1);

        }

        this.player = this.physics.add.sprite(config.width / 2 - 8, config.height - 64, "player");
        this.player.play("thrust", true);
        this.cursorKeys = this.input.keyboard.createCursorKeys();
        this.player.setCollideWorldBounds(true);

        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.projectiles = this.add.group();

        //this.physics.add.collider(this.projectiles, this.powerUps, function(projectiles, powerUp) {
        //    projectiles.destroy();
        //});

        this.physics.add.overlap(this.player, this.powerUps, this.pickPowerUp, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.hurtPlayer, null, this);
        this.physics.add.overlap(this.projectiles, this.enemies, this.hitEnemy, null, this);

        var graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 1);
        graphics.beginPath();
        graphics.moveTo(0, 0);
        graphics.lineTo(config.width, 0);
        graphics.lineTo(config.width, 20);
        graphics.lineTo(0, 20);
        graphics.lineTo(0, 0);
        graphics.closePath();
        graphics.fillPath();
        this.score = 0;
        this.lives = 3;
        this.scoreLable = this.add.bitmapText(10, 5, "pixelFont", "SCORE: 000000", 16);
        this.livesLable = this.add.bitmapText(config.width - 100, 5, "pixelFont", "Lives: ", 16);

        this.live1 = this.add.image(config.width - 60, 10, "live");
        this.live2 = this.add.image(config.width - 48, 10, "live");
        this.live3 = this.add.image(config.width - 36, 10, "live");
    }

    pickPowerUp(player, powerUp) {
        if (player.texture.key == "player") {
            powerUp.disableBody(true, true);
            if (powerUp.anims.currentAnim.key == "gray") {
                player.setTexture("grayPlayer");
                player.play("gPowerUp");
                gameSettings.ship1Speed = 2;
                gameSettings.ship2Speed = 4;
                gameSettings.ship3Speed = 6;
                var timer = this.time.delayedCall(7000, this.resetPlayer, [false, powerUp], this);
            } else {
                player.setTexture("redPlayer");
                player.play("rPowerUp");
                gameSettings.ship1Speed = 0.5;
                gameSettings.ship2Speed = 0.75;
                gameSettings.ship3Speed = 1;
                var timer = this.time.delayedCall(10000, this.resetPlayer, [false, powerUp], this);
            }
        }
    };

    resetPlayer(died, powerUp) {
        gameSettings.ship1Speed = 1;
        gameSettings.ship2Speed = 2;
        gameSettings.ship3Speed = 3;
        if (died) {
            this.player.setTexture("invulnerable");
            this.player.play("blink");
            this.player.on('animationcomplete', () => {
                this.player.setTexture("player");
                this.player.play("thrust");
            });
        } else {
            this.player.setTexture("player");
            this.player.play("thrust");
        }

        if (typeof powerUp != "undefined") {
            powerUp.enableBody(true, 0, 0, true, true);
            if (Math.random() > 0.2) {
                powerUp.play("red");
            } else {
                powerUp.play("gray");
            }
            powerUp.setRandomPosition(0, 0, game.config.width, game.config.height * 1 / 3);
            powerUp.setVelocity(100, 100);
        }

    }

    hurtPlayer(player, enemy) {
        if (enemy.texture.key != "explosion" && player.texture.key != "grayPlayer" && player.texture.key != "invulnerable") {
            player.setTexture("explosion");
            player.play("explode");
            player.on('animationcomplete', () => {
                this.resetPlayer(true);
            });
            if (this.lives > 0) {
                this["live" + this.lives].setAlpha(0.15);
                this.lives--;
            } else {
                this.scene.start('GameOver', { score: this.score });
            }
            this.resetShipPos(enemy);
        }
    };

    hitEnemy(projectile, enemy) {
        if (enemy.texture.key != "explosion") {
            this.score += 3;
            if (projectile.texture.key == "beam") {
                projectile.destroy();
                this.score -= 2;
            }
            this.resetShipPos(enemy);
            this.scoreLable.text = "SCORE: " + this.zeroPad(this.score, 6);
        }
    };

    update() {

        this.moveShip(this.ship1, gameSettings.ship1Speed);
        this.moveShip(this.ship2, gameSettings.ship2Speed);
        this.moveShip(this.ship3, gameSettings.ship3Speed);

        this.background.tilePositionY -= 0.5;

        this.movePlayerManager();

        if (Phaser.Input.Keyboard.JustDown(this.spacebar) && (this.player.texture.key == "player" || this.player.texture.key == "invulnerable")) {
            this.shootBeam();
        }

        for (var i = 0; i < this.projectiles.getChildren().length; i++) {
            var beam = this.projectiles.getChildren()[i];
            beam.update();
        }
    }

    moveShip(ship, speed) {
        ship.y += speed;
        if (ship.y > config.height) {
            ship.y = 0;
            ship.x = Phaser.Math.Between(0, config.width);
        }
    }

    resetShipPos(ship) {
        let randomint = Phaser.Math.Between(0, 2);
        let texture = "ship3";
        if (randomint == 0) { texture = "ship" } else if (randomint == 1) { texture = "ship2" }
        ship.setTexture("explosion");
        ship.play("explode");
        ship.on('animationcomplete', () => {
            ship.setTexture(texture);
            ship.y = 0;
            ship.x = Phaser.Math.Between(0, config.width);
        });
    }

    destroyShip(pointer, gameObject) {
        gameObject.setTexture("explosion");
        gameObject.play("explode");
    }

    movePlayerManager() {

        this.player.setVelocity(0);
        //move ship left or right
        if (this.cursorKeys.left.isDown) {
            this.player.setVelocityX(-gameSettings.playerSpeed);
            if (this.cursorKeys.right.isDown) {
                this.player.setVelocityX(0);

            }

        } else if (this.cursorKeys.right.isDown) {
            this.player.setVelocityX(gameSettings.playerSpeed);
            if (this.cursorKeys.left.isDown) {
                this.player.setVelocityX(0);

            }
        }
        //move ship up and down
        if (this.cursorKeys.up.isDown) {
            this.player.setVelocityY(-gameSettings.playerSpeed);
            if (this.cursorKeys.down.isDown) {
                this.player.setVelocityY(0);

            }

        } else if (this.cursorKeys.down.isDown) {
            this.player.setVelocityY(gameSettings.playerSpeed);
            if (this.cursorKeys.up.isDown) {
                this.player.setVelocityY(0);

            }
        }

    }

    shootBeam() {
        if (this.player.texture.key != "grayPlayer") {
            var beam = new Beam(this);
        } else { var superBeam = new SuperBeam(this); }
    }

    zeroPad(number, size) {
        var stringNumber = String(number);
        while (stringNumber.length < (size || 2)) {
            stringNumber = "0" + stringNumber;
        }
        return stringNumber;
    }

}