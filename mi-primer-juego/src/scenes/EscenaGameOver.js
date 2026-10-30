import { Scene } from 'phaser';
import { ANCHO, ALTO, FUENTE_TITULO } from '../medidas.js';
import { COLORES, crearPanel, crearBoton } from '../ui.js';

/**
 * Se abre encima del nivel, que se queda congelado por detras.
 * Recibe { nivel } con la clave del nivel en el que se ha muerto.
 */
export class EscenaGameOver extends Scene {
    constructor() {
        super('EscenaGameOver');
    }

    init(datos) {
        this.nivel = datos.nivel;
    }

    create() {
        this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, 0x000000, 0.65);

        const panel = crearPanel(this, ANCHO / 2, 320, 520, 380, 0.92);

        const titulo = this.add.text(ANCHO / 2, 210, '¡HAS MUERTO!', {
            fontSize: '52px',
            fill: '#ff3333',
            fontFamily: FUENTE_TITULO,
            stroke: COLORES.sombra,
            strokeThickness: 9
        }).setOrigin(0.5);

        // Entrada con un pequeño golpe
        this.tweens.add({ targets: [ panel, titulo ], scale: { from: 0.7, to: 1 }, duration: 350, ease: 'Back.easeOut' });

        crearBoton(this, ANCHO / 2, 330, 'Reintentar', () => {
            this.scene.stop(this.nivel);
            this.scene.start(this.nivel);
        }, { color: '#7CFC00', tamano: 30, ancho: 340, alto: 64 });

        crearBoton(this, ANCHO / 2, 420, 'Volver al menú', () => {
            this.scene.stop(this.nivel);
            this.scene.start('EscenaMenu');
        }, { color: '#FFD700', tamano: 30, ancho: 340, alto: 64 });
    }
}
