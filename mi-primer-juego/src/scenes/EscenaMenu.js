import { Scene } from 'phaser';

export class EscenaMenu extends Scene {
    constructor() {
        super('EscenaMenu');
    }

    preload() {
        this.load.setPath('assets');
        this.load.image('fondoini', 'fondoinicio.jpg');
    }

    create() {
        this.add.image(400, 300, 'fondoini');
        this.add.text(200, 180, 'EL BANDIDO', { fontSize: '64px', fill: '#FFD700',fontFamily: '"Archivo Black", sans-serif'});
        
        this.add.text(300, 400, 'CONTROLES', { fontSize: '30PX', fill: '#f00', fontFamily: '"Archivo Black", sans-serif' })
        .setInteractive()
        .on('pointerdown', () => {
            this.scene.start('EscenaControles');
        });


        this.add.text(320, 300, 'JUGAR', { fontSize: '40px', fill: '#0f0', fontFamily: '"Archivo Black", sans-serif' })
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('Game');
            });
    }
}
