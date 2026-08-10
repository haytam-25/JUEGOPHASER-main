import { Scene } from 'phaser';

export class EscenaGameOver extends Scene {
    constructor() {
        super('EscenaGameOver');
    }

    create() {
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.5);
        this.add.text(270, 200, '¡Has muerto!', { fontSize: '32px', fill: '#fff' });

        this.add.text(270, 300, 'Volver al menú', { fontSize: '28px', fill: '#ff0' })
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('EscenaMenu');
            });
    }
}
