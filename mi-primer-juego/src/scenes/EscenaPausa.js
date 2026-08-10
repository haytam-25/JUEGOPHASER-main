import { Scene } from 'phaser';
import { ANCHO, ALTO, FUENTE_TITULO, FUENTE_TEXTO } from '../medidas.js';

export class EscenaPausa extends Scene {
    constructor() {
        super('EscenaPausa');
    }

    create() {
        this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, 0x000000, 0.6);

        this.add.text(ANCHO / 2, 160, 'PAUSA', {
            fontSize: '54px',
            fill: '#FFD700',
            fontFamily: FUENTE_TITULO,
            stroke: '#3b1d05',
            strokeThickness: 8
        }).setOrigin(0.5);

        this.crearOpcion(290, 'Continuar', '#7CFC00', nivel => {
            this.scene.stop();
            this.scene.resume(nivel);
        });

        this.crearOpcion(360, 'Reiniciar', '#ff5555', nivel => {
            this.scene.stop('EscenaPausa');
            this.scene.stop(nivel);
            this.scene.start(nivel);
        });

        this.crearOpcion(430, 'Volver al Menú', '#FFD700', nivel => {
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
        const boton = this.add.text(ANCHO / 2, y, texto, {
            fontSize: '30px',
            fill: color,
            fontFamily: FUENTE_TEXTO
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        boton.on('pointerover', () => boton.setScale(1.12));
        boton.on('pointerout', () => boton.setScale(1));

        boton.on('pointerdown', () => {
            const nivel = this.buscarNivelPausado();

            if (!nivel) {
                console.error('❌ No se encontró una escena pausada.');
                return;
            }

            accion(nivel);
        });
    }

    // Devuelve la clave de la escena que esta pausada por detras (el nivel en curso)
    buscarNivelPausado() {
        const escena = this.scene.manager.scenes.find(
            s => s.scene.key !== 'EscenaPausa' && s.scene.isPaused()
        );

        return escena ? escena.scene.key : null;
    }
}
