import { Scene } from 'phaser';
import { ANCHO, ALTO, FUENTE_TITULO, FUENTE_TEXTO } from '../medidas.js';
import { esDispositivoTactil } from '../controlesTactiles.js';
import { COLORES, pixelar, crearPanel, crearBoton, crearVineta } from '../ui.js';

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
        // Se reutiliza el fondo del menu (ya cargado alli), oscurecido
        pixelar(this, ['fondoini']);

        const fondo = this.add.image(ANCHO / 2, ALTO / 2, 'fondoini');
        fondo.setScale(Math.max(ANCHO / fondo.width, ALTO / fondo.height));

        this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, 0x000000, 0.45);
        crearVineta(this, 0.7);

        crearPanel(this, ANCHO / 2, 300, 620, 420, 0.92);

        this.add.text(ANCHO / 2, 140, 'CONTROLES', {
            fontSize: '54px',
            fill: '#FFD700',
            fontFamily: FUENTE_TITULO,
            stroke: COLORES.sombra,
            strokeThickness: 8
        }).setOrigin(0.5);

        const controles = esDispositivoTactil() ? CONTROLES_TACTILES : CONTROLES_TECLADO;

        controles.forEach((linea, i) => {
            this.add.text(ANCHO / 2, 230 + (i * 52), linea, {
                fontSize: '26px',
                fill: '#ffffff',
                fontFamily: FUENTE_TEXTO
            }).setOrigin(0.5);
        });

        crearBoton(this, ANCHO / 2, 560, 'Volver al menú', () => this.scene.start('EscenaMenu'),
            { color: '#7CFC00', tamano: 28, ancho: 340, alto: 60 });

        this.cameras.main.fadeIn(300, 0, 0, 0);
    }
}
