import { Scene } from 'phaser';
import { ANCHO, ALTO, FUENTE_TITULO } from '../medidas.js';

export class EscenaMenu extends Scene {
    constructor() {
        super('EscenaMenu');
    }

    preload() {
        this.load.setPath('assets');
        this.load.image('fondoini', 'fondoinicio.jpg');
    }

    create() {
        // Fondo agrandado hasta cubrir toda la ventana, sin deformarlo
        const fondo = this.add.image(ANCHO / 2, ALTO / 2, 'fondoini');
        fondo.setScale(Math.max(ANCHO / fondo.width, ALTO / fondo.height));

        this.add.text(ANCHO / 2, 130, 'EL BANDIDO', {
            fontSize: '78px',
            fill: '#FFD700',
            fontFamily: FUENTE_TITULO,
            stroke: '#3b1d05',
            strokeThickness: 10
        }).setOrigin(0.5);

        this.crearBoton(350, 'JUGAR', '#7CFC00', 46, () => this.scene.start('Game'));
        this.crearBoton(450, 'CONTROLES', '#ff5555', 34, () => this.scene.start('EscenaControles'));
    }

    /** Boton de texto centrado que se agranda al pasar el raton por encima */
    crearBoton(y, texto, color, tamano, accion) {
        const boton = this.add.text(ANCHO / 2, y, texto, {
            fontSize: tamano + 'px',
            fill: color,
            fontFamily: FUENTE_TITULO,
            stroke: '#3b1d05',
            strokeThickness: 6
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        boton.on('pointerover', () => boton.setScale(1.12));
        boton.on('pointerout', () => boton.setScale(1));
        boton.on('pointerdown', accion);

        return boton;
    }
}
