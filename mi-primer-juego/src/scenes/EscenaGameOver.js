import { Scene } from 'phaser';
import { ANCHO, ALTO, FUENTE_TITULO, FUENTE_TEXTO } from '../medidas.js';

export class EscenaGameOver extends Scene {
    constructor() {
        super('EscenaGameOver');
    }

    create() {
        this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, 0x000000, 0.75);

        this.add.text(ANCHO / 2, 230, '¡HAS MUERTO!', {
            fontSize: '62px',
            fill: '#ff3333',
            fontFamily: FUENTE_TITULO,
            stroke: '#3b1d05',
            strokeThickness: 9
        }).setOrigin(0.5);

        const boton = this.add.text(ANCHO / 2, 380, 'Volver al menú', {
            fontSize: '32px',
            fill: '#FFD700',
            fontFamily: FUENTE_TEXTO
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        boton.on('pointerover', () => boton.setScale(1.12));
        boton.on('pointerout', () => boton.setScale(1));
        boton.on('pointerdown', () => this.scene.start('EscenaMenu'));
    }
}
