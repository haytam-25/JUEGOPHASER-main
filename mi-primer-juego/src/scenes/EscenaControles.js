import { Scene } from 'phaser';
import { ANCHO, ALTO, FUENTE_TITULO, FUENTE_TEXTO } from '../medidas.js';
import { esDispositivoTactil } from '../controlesTactiles.js';

const CONTROLES_TECLADO = [
    '←   Mover a la izquierda',
    '→   Mover a la derecha',
    '↑   Saltar',
    'ESC  Pausa'
];

// En movil no hay teclado: se juega con el joystick y el boton de la pantalla
const CONTROLES_TACTILES = [
    'Joystick (abajo izq.)  Moverte',
    'Boton ▲ (abajo dcha.)  Saltar',
    '|| Pausa (arriba dcha.)  Pausa'
];

export class EscenaControles extends Scene {
    constructor() {
        super('EscenaControles');
    }

    create() {
        this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, 0x000000, 0.85);

        this.add.text(ANCHO / 2, 110, 'CONTROLES', {
            fontSize: '54px',
            fill: '#FFD700',
            fontFamily: FUENTE_TITULO,
            stroke: '#3b1d05',
            strokeThickness: 8
        }).setOrigin(0.5);

        const controles = esDispositivoTactil() ? CONTROLES_TACTILES : CONTROLES_TECLADO;

        controles.forEach((linea, i) => {
            this.add.text(ANCHO / 2, 230 + (i * 55), linea, {
                fontSize: '26px',
                fill: '#ffffff',
                fontFamily: FUENTE_TEXTO
            }).setOrigin(0.5);
        });

        const boton = this.add.text(ANCHO / 2, 500, 'Volver al menú', {
            fontSize: '30px',
            fill: '#7CFC00',
            fontFamily: FUENTE_TEXTO
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        boton.on('pointerover', () => boton.setScale(1.12));
        boton.on('pointerout', () => boton.setScale(1));
        boton.on('pointerdown', () => this.scene.start('EscenaMenu'));
    }
}
