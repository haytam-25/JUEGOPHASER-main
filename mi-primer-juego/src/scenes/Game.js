import { Scene } from 'phaser';

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    preload ()
    {
        this.load.setPath('assets');
        
        this.load.image('background', 'bg.png');
        this.load.image('logo', 'logo.png');

        this.load.image('sky', 'sky.png');
        this.load.image('ground', 'platform.png');
        this.load.image('star', 'star.png');
        this.load.image('bomb', 'bomb.png');
        
        this.load.spritesheet('dude', 'dude.png', { frameWidth: 32, frameHeight: 48 });


        // this.load.spritesheet('cr7sprite', 'cr7spritesheet.png', { frameWidth: 80, frameHeight: 155 });

        // mas espacios
        
    }

    create ()
    {
       
        this.add.image(400, 300, 'sky');

        this.suelos=this.physics.add.staticGroup();

        this.suelos.create(400, 568, 'ground').setScale(2).refreshBody();
        
        this.suelos.create(600, 400, 'ground');
        this.suelos.create(50, 250, 'ground');
        this.suelos.create(750, 220, 'ground');


        //this.player = this.physics.add.sprite(100, 450, 'cr7sprite');

        this.player = this.physics.add.sprite(100, 450, 'dude');

        this.player.setBounce(0.6);
        this.player.setCollideWorldBounds(true);


        // gravedad del personaje

        this.player.body.setGravityY(30);

        // animaciones

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 20
        });
        
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.physics.add.collider(this.player, this.suelos);

        //activa el teclado

        this.cursors = this.input.keyboard.createCursorKeys();

    }

    update(){

        if (this.cursors.left.isDown)
            {
                this.player.setVelocityX(-160);
            
                this.player.anims.play('left', true);
            }
            else if (this.cursors.right.isDown)
            {
                this.player.setVelocityX(160);
            
                this.player.anims.play('right', true);
            }
            else
            {
                this.player.setVelocityX(0);
            
                this.player.anims.play('turn');
            }
            
            if (this.cursors.up.isDown && this.player.body.touching.down)
            {
                this.player.setVelocityY(-330);
            }


    }
}
