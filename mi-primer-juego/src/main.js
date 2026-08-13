import { AUTO, Scale, Game } from 'phaser';
import { ANCHO, ALTO } from './medidas.js';
import { esDispositivoTactil } from './controlesTactiles.js';
import { EscenaMenu as Menu } from './scenes/EscenaMenu.js';
import { Game as EscenarioPrincipal } from './scenes/Game.js';
import { EscenaPausa as Pausa } from './scenes/EscenaPausa.js';
import { Nivel2 as Nivelazo2 } from './scenes/Nivel2.js';
import { Nivel3 as Nivelazo3 } from './scenes/Nivel3.js';
import { EscenaGameOver as Muerte } from './scenes/EscenaGameOver.js';
import { EscenaControles as Controles } from './scenes/EscenaControles.js';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: AUTO,
    width: ANCHO,
    height: ALTO,
    parent: 'game-container',

    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH
    },

    // Permite mantener pulsado el joystick y el boton de salto a la vez en pantallas tactiles
    input: {
        activePointers: 2
    },

    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },

    scene: [
        Menu, EscenarioPrincipal, Pausa, Nivelazo2, Nivelazo3, Muerte, Controles
    ]
};

/*
 * Phaser dibuja los textos sobre un canvas: si el juego arranca antes de que
 * las fuentes esten listas, los titulos se quedan con la letra por defecto del
 * navegador. Por eso esperamos a que carguen antes de crear el juego.
 */
async function iniciarJuego ()
{
    try
    {
        await Promise.all([
            document.fonts.load('16px "Rye"'),
            document.fonts.load('16px "Special Elite"')
        ]);
    }
    catch (error)
    {
        console.warn('No se pudieron cargar las fuentes, se usaran las del sistema.', error);
    }

    vigilarOrientacion(new Game(config));
}

/**
 * Si el movil se pone en vertical durante una partida, el aviso de "gira el
 * dispositivo" tapa la pantalla. Pausamos el nivel para que el jugador no se
 * quede corriendo a ciegas y muera sin verlo.
 */
function vigilarOrientacion (juego)
{
    const vertical = window.matchMedia('(orientation: portrait)');

    vertical.addEventListener('change', () => {
        if (!vertical.matches || !esDispositivoTactil())
        {
            return;
        }

        // getScenes(true) devuelve solo las escenas activas, nunca una ya pausada.
        // Los niveles son los unicos que tienen pausarJuego(), asi que este filtro
        // deja fuera los menus (que no hay que pausar).
        juego.scene.getScenes(true)
            .filter(escena => typeof escena.pausarJuego === 'function')
            .forEach(escena => escena.pausarJuego());
    });
}

iniciarJuego();
