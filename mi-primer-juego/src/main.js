import { AUTO, Scale, Game } from 'phaser';
import { ANCHO, ALTO } from './medidas.js';
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

    new Game(config);
}

iniciarJuego();
