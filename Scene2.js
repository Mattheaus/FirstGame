class Scene2 extends Phaser.Scene {
    constructor() {
        super("readyToPlay");
    }

    create() {

        this.background = this.add.tileSprite(0, 0, config.width, config.height, "background");
        this.background.setOrigin(0, 0);

        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.projectiles = this.add.group();

        var graphics = this.add.renderTexture(0, 0, config.width, 20);
        graphics.fill(0x000000);

        this.scoreLable = this.add.bitmapText(10, 5, "pixelFont", "SCORE: 000000", 16);
        this.livesLable = this.add.bitmapText(config.width - 100, 5, "pixelFont", "Lives: ", 16);

        this.live1 = this.add.image(config.width - 60, 10, "live");
        this.live2 = this.add.image(config.width - 48, 10, "live");
        this.live3 = this.add.image(config.width - 36, 10, "live");

        let overlay = this.add.renderTexture(0, 0, config.width, config.height);
        overlay.fill(0x000000);
        overlay.setAlpha(0.5);

        this.next = this.add.bitmapText(config.width * 1 / 4 - 20, config.height / 2 - 20, "pixelFont", "PRESS SPACE TO START", 20);

        var opacity = 0.8;
        this.next = this.add.bitmapText(30, config.height / 2 + 24, "pixelFont", "Power Ups:", 16).setAlpha(opacity * 1.2);
        this.red = this.physics.add.sprite(110, config.height / 2 + 30, "power-up").setAlpha(opacity);
        this.gray = this.physics.add.sprite(135, config.height / 2 + 30, "power-up").setAlpha(opacity);

        this.next = this.add.bitmapText(30, config.height / 2 + 60, "pixelFont", "Enemies:", 16).setAlpha(opacity * 1.2);
        this.ship1 = this.add.sprite(95, config.height / 2 + 65, "ship").setAlpha(opacity);
        this.ship2 = this.add.sprite(130, config.height / 2 + 65, "ship2").setAlpha(opacity);
        this.ship3 = this.add.sprite(165, config.height / 2 + 60, "ship3").setAlpha(opacity);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
            this.scene.start('playGame');
        }
    }



}