class Scene4 extends Phaser.Scene {
    constructor() {
        super("GameOver");
    }
    init(data) {
        this.score = data.score;
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

        this.cursorKeys = this.input.keyboard.createCursorKeys();

        this.shift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

        this.projectiles = this.add.group();

        var graphics = this.add.renderTexture(0, 0, config.width, 20);
        graphics.fill(0x000000);

        this.scoreLable = this.add.bitmapText(10, 5, "pixelFont", "SCORE: " + this.zeroPad(this.score, 6), 16);
        this.livesLable = this.add.bitmapText(config.width - 100, 5, "pixelFont", "Lives: ", 16);

        this.live1 = this.add.image(config.width - 60, 10, "live").setAlpha(0.15);
        this.live2 = this.add.image(config.width - 48, 10, "live").setAlpha(0.15);
        this.live3 = this.add.image(config.width - 36, 10, "live").setAlpha(0.15);

        let overlay = this.add.renderTexture(0, 0, config.width, config.height);
        overlay.fill(0x000000);
        overlay.setAlpha(0.5);

        this.youDied = this.add.bitmapText(config.width * 1 / 4 + 25, config.height / 2 - 40, "pixelFont", "You DIED", 24);
        this.finalScore = this.add.bitmapText(config.width * 1 / 4 + 5, config.height / 2, "pixelFont", "FINAL SCORE: " + this.zeroPad(this.score, 6), 16);
        this.next = this.add.bitmapText(config.width * 1 / 4 - 15, config.height / 2 + 18, "pixelFont", "PRESS SHIFT TO CONTINUE...", 16);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.shift)) {
            this.scene.start('readyToPlay');
        }
    }

    zeroPad(number, size) {
        var stringNumber = String(number);
        while (stringNumber.length < (size || 2)) {
            stringNumber = "0" + stringNumber;
        }
        return stringNumber;
    }

}