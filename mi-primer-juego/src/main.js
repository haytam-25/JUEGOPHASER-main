import { Game as EscenarioPrincipal } from './scenes/Game';
import { AUTO, Scale,Game } from 'phaser';
import { EscenaMenu as Menu } from './scenes/EscenaMenu.js';
import { EscenaPausa as Pausa} from './scenes/EscenaPausa.js';
import { Nivel2 as Nivelazo2 } from './scenes/Nivel2.js';
import { Nivel3 as Nivelazo3 } from './scenes/Nivel3.js';
import { EscenaGameOver  as Muerte } from './scenes/EscenaGameOver.js';
import { EscenaControles as Controles } from './scenes/EscenaControles.js';


//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    // backgroundColor: '#028af8',
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
        Menu,EscenarioPrincipal,Pausa, Nivelazo2,Nivelazo3,Muerte,Controles
    ]
};

export default new Game(config);
