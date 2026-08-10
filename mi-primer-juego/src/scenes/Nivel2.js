import { NivelBase } from './NivelBase';

export class Nivel2 extends NivelBase
{
    constructor ()
    {
        super('Nivel2', {
            fondo: { clave: 'fondojugar2', archivo: 'cielopixel2.png' },
            mapa: {
                clave: 'mapa2',
                archivo: 'tilemaps/mapatierranivel2.json',
                capaTierra: 'Tierranivel2',
                capaColisiones: 'ColTierranivel2'
            },
            titulo: 'NIVEL 2',
            colorTexto: '#000'
        });
    }

    alRecogerTodosLosFajos ()
    {
        this.scene.start('Nivel3');
    }
}
