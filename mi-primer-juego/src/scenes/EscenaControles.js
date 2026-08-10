import { Scene } from 'phaser';

export class EscenaControles extends Scene {
    constructor() {
        super('EscenaControles');
    }

    create() {
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);

        this.add.text(220, 100, 'Controles del Juego', {
            fontSize: '32px',
            fill: '#fff',
            fontFamily: '"Archivo Black", sans-serif'
        });

        this.add.text(100, 200, '← : Mover a la izquierda', { fontSize: '20px', fill: '#FFD700' });
        this.add.text(100, 240, '→ : Mover a la derecha', { fontSize: '20px', fill: '#FFD700' });
        this.add.text(100, 280, '↑ : Saltar', { fontSize: '20px', fill: '#FFD700' });
        this.add.text(100, 320, 'ESC: Pausa', { fontSize: '20px', fill: '#FFD700' });

        this.add.text(280, 420, ' VOLVER  MENÚ ', {
            fontSize: '22px',
            fill: '#0f0'
        })
        .setInteractive()
        .on('pointerdown', () => {
            this.scene.start('EscenaMenu');
        });
    }
}
