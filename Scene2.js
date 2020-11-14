class Scene2 extends Phaser.Scene {
    constructor() {
        super("playGame");
    }

    create() {

        this.background = this.add.tileSprite(0, 0, config.width, config.height, "background");
        this.background.setOrigin(0, 0);

        this.ship1 = this.add.sprite(config.width / 2 - 50, config.height / 2, "ship");
        this.ship2 = this.add.sprite(config.width / 2, config.height / 2, "ship2");
        this.ship3 = this.add.sprite(config.width / 2 + 50, config.height / 2, "ship3");

        this.enemies = this.physics.add.group();
        this.enemies.add(this.ship1);
        this.enemies.add(this.ship2);
        this.enemies.add(this.ship3);

        this.ship1.play("ship1_anim");
        this.ship2.play("ship2_anim");
        this.ship3.play("ship3_anim");

        this.ship1.setInteractive();
        this.ship2.setInteractive();
        this.ship3.setInteractive();

        this.input.on('gameobjectdown', this.destroyShip, this);

        this.physics.world.setBoundsCollision();

        this.powerUps = this.physics.add.group();

        var maxObjects = 4;
        for (var i = 0; i <= maxObjects; i++) {
            var powerUp = this.physics.add.sprite(16, 16, "power-up");
            this.powerUps.add(powerUp);
            powerUp.setRandomPosition(0, 0, game.config.width, game.config.height);

            if (Math.random() > 0.5) {
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

        this.physics.add.collider(this.projectiles, this.powerUps, function(projectiles, powerUp) {
            projectiles.destroy();
        });

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
        this.scoreLable = this.add.bitmapText(10, 5, "pixelFont", "SCORE", 16);
        this.score = 0;
    }

    pickPowerUp(player, powerUp) {
        powerUp.disableBody(true, true);
    };

    hurtPlayer(player, enemy) {
        if (enemy.texture.key != "explosion") {
            player.setTexture("explosion");
            player.play("explode");
            player.on('animationcomplete', () => {
                player.setTexture("player");
                player.x = config.width / 2 - 8;
                player.y = config.height - 64;
            });
            this.resetShipPos(enemy);
        }
        //add lives and reset points also add powerups
    };

    hitEnemy(projectile, enemy) {
        projectile.destroy();
        this.resetShipPos(enemy);
        this.score += 1;
        this.scoreLable.text = "SCORE: " + this.zeroPad(this.score, 6);
    };

    update() {

        this.moveShip(this.ship1, gameSettings.ship1Speed);
        this.moveShip(this.ship2, gameSettings.ship2Speed);
        this.moveShip(this.ship3, gameSettings.ship3Speed);

        this.background.tilePositionY -= 0.5;

        this.movePlayerManager();

        if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
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
        var beam = new Beam(this);
    }

    zeroPad(number, size) {
        var stringNumber = String(number);
        while (stringNumber.length < (size || 2)) {
            stringNumber = "0" + stringNumber;
        }
        return stringNumber;
    }

}