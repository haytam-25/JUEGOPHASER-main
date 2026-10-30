import { Scene } from 'phaser';
import { ANCHO, ALTO, FUENTE_TITULO } from '../medidas.js';
import { COLORES, crearPanel, crearBoton } from '../ui.js';

export class EscenaPausa extends Scene {
    constructor() {
        super('EscenaPausa');
    }

    create() {
        this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, 0x000000, 0.6);

        crearPanel(this, ANCHO / 2, 305, 440, 400, 0.92);

        this.add.text(ANCHO / 2, 160, 'PAUSA', {
            fontSize: '54px',
            fill: '#FFD700',
            fontFamily: FUENTE_TITULO,
            stroke: COLORES.sombra,
            strokeThickness: 8
        }).setOrigin(0.5);

        this.crearOpcion(260, 'Continuar', '#7CFC00', nivel => {
            this.scene.stop();
            this.scene.resume(nivel);
        });

        this.crearOpcion(340, 'Reiniciar', '#ff7b5c', nivel => {
            this.scene.stop('EscenaPausa');
            this.scene.stop(nivel);
            this.scene.start(nivel);
        });

        this.crearOpcion(420, 'Volver al Menú', '#FFD700', nivel => {
            this.scene.stop('EscenaPausa');
            this.scene.stop(nivel);
            this.scene.start('EscenaMenu');
        });
    }

    /**
     * Crea un boton del menu de pausa. Antes de ejecutar la accion busca
     * el nivel que quedo pausado y se lo pasa como parametro.
     */
    crearOpcion(y, texto, color, accion) {
        crearBoton(this, ANCHO / 2, y, texto, () => {
            const nivel = this.buscarNivelPausado();

            if (!nivel) {
                console.error('❌ No se encontró una escena pausada.');
                return;
            }

            accion(nivel);
        }, { color, tamano: 28, ancho: 340, alto: 60 });
    }

    // Devuelve la clave de la escena que esta pausada por detras (el nivel en curso)
    buscarNivelPausado() {
        const escena = this.scene.manager.scenes.find(
            s => s.scene.key !== 'EscenaPausa' && s.scene.isPaused()
        );

        return escena ? escena.scene.key : null;
    }
}
