import { Scene } from 'phaser';
import { ANCHO, ALTO, FUENTE_TITULO, FUENTE_TEXTO } from '../medidas.js';
import { COLORES, pixelar, crearBoton, crearVineta } from '../ui.js';

export class EscenaMenu extends Scene {
    constructor() {
        super('EscenaMenu');
    }

    preload() {
        this.load.setPath('assets');
        this.load.image('fondoini', 'fondoinicio.jpg');
    }

    create() {
        pixelar(this, ['fondoini']);

        // Fondo agrandado hasta cubrir toda la ventana, sin deformarlo
        const fondo = this.add.image(ANCHO / 2, ALTO / 2, 'fondoini');
        fondo.setScale(Math.max(ANCHO / fondo.width, ALTO / fondo.height));

        crearVineta(this, 0.7);

        const titulo = this.add.text(ANCHO / 2, 140, 'EL BANDIDO', {
            fontSize: '86px',
            fill: '#FFD700',
            fontFamily: FUENTE_TITULO,
            stroke: COLORES.sombra,
            strokeThickness: 12,
            shadow: { offsetX: 0, offsetY: 8, color: '#000000', blur: 12, fill: true, stroke: true }
        }).setOrigin(0.5);

        // El titulo flota arriba y abajo muy despacio
        this.tweens.add({
            targets: titulo,
            y: titulo.y - 10,
            duration: 1600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.add.text(ANCHO / 2, 220, 'Recoge todos los diamantes y esquiva los pinchos', {
            fontSize: '22px',
            fill: '#fff3d6',
            fontFamily: FUENTE_TEXTO,
            stroke: COLORES.sombra,
            strokeThickness: 4
        }).setOrigin(0.5);

        crearBoton(this, ANCHO / 2, 340, 'JUGAR', () => this.scene.start('Game'),
            { color: '#7CFC00', tamano: 44, ancho: 300, alto: 78 });
        crearBoton(this, ANCHO / 2, 440, 'CONTROLES', () => this.scene.start('EscenaControles'),
            { color: '#ff7b5c', tamano: 32, ancho: 300, alto: 64 });

        this.cameras.main.fadeIn(400, 0, 0, 0);
    }
}
