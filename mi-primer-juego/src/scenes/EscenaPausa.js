import { Scene } from 'phaser';

const FUENTE = '"Press Start 2P", sans-serif';

export class EscenaPausa extends Scene {
    constructor() {
        super('EscenaPausa');
    }

    create() {
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.5); // fondo oscuro semitransparente
        this.add.text(300, 200, 'Pausa', { fontSize: '32px', fill: '#fff', fontFamily: FUENTE });

        this.crearOpcion(260, 'Continuar', '#0f0', nivel => {
            this.scene.stop();
            this.scene.resume(nivel);
        });

        this.crearOpcion(310, 'Reiniciar', '#f00', nivel => {
            this.scene.stop('EscenaPausa');
            this.scene.stop(nivel);
            this.scene.start(nivel);
        });

        this.crearOpcion(360, 'Volver al Menú', '#ff0', nivel => {
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
        this.add.text(290, y, texto, { fontSize: '26px', fill: color, fontFamily: FUENTE })
            .setInteractive()
            .on('pointerdown', () => {
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
