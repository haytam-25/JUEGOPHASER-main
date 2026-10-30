import { NivelBase } from './NivelBase';

export class Game extends NivelBase
{
    constructor ()
    {
        super('Game', {
            fondo: { clave: 'fondojugar', archivo: 'cielopixelç.jpg' },
            mapa: {
                clave: 'mapa1',
                archivo: 'tilemaps/mapatierra.json',
                capaTierra: 'Tierra',
                capaColisiones: 'coltierra'
            },
            titulo: 'NIVEL 1',
            colorTexto: '#FFE9A8'
        });
    }

    alRecogerTodosLosFajos ()
    {
        this.cambiarDeNivel('Nivel2');
    }
}
