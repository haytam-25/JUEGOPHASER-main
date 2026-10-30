import { Math as MathPhaser } from 'phaser';
import { NivelBase } from './NivelBase';
import { ANCHO, ALTO, FUENTE_TEXTO } from '../medidas.js';
import { COLORES, crearPanel } from '../ui.js';

// Ajustes de las bolas de fuego
const BOLA = {
    radio: 18,
    tamanoTextura: 48,
    xSalida: -40,          // fuera de pantalla por la izquierda
    alturaMinima: 100,
    alturaMaxima: ALTO - 100,
    velocidadMinima: 140,
    velocidadMaxima: 220,
    velocidadPorRonda: 15, // cada vuelta completa las bolas van un poco mas rapido
    giro: 180
};

export class Nivel3 extends NivelBase
{
    constructor ()
    {
        super('Nivel3', {
            fondo: { clave: 'fondojugar3', archivo: 'fondonivel3.png' },
            mapa: {
                clave: 'mapa3',
                archivo: 'tilemaps/mapatierranivel3.json',
                capaTierra: 'Tierranivel3',
                capaColisiones: 'ColTierranivel3'
            },
            titulo: 'NIVEL FINAL',
            colorTexto: '#FFD700'
        });
    }

    alCrear ()
    {
        this.crearTexturaBolaFuego();

        // ronda = cuantas veces se han recogido todos los fajos
        this.ronda = 0;

        this.bolasFuego = this.physics.add.group({ allowGravity: false });

        // Segundo panel debajo de la puntuacion
        crearPanel(this, 151, 88, 270, 44, 0.6).setDepth(10);

        this.bolasText = this.add.text(151, 88, 'Bolas de fuego: 0', {
            fontSize: '22px',
            fill: this.ajustes.colorTexto,
            fontFamily: FUENTE_TEXTO,
            stroke: COLORES.sombra,
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(11);

        this.physics.add.overlap(this.player, this.bolasFuego, this.morirJugador, null, this);
    }

    // A diferencia de los otros niveles, aqui los fajos vuelven a salir
    // y cada vuelta completa anade una bola de fuego mas
    alRecogerTodosLosFajos ()
    {
        this.reaparecerFajos();

        this.ronda++;
        this.lanzarBolaFuego();
        this.bolasText.setText('Bolas de fuego: ' + this.ronda);

        this.cameras.main.shake(200, 0.006);
    }

    alActualizar ()
    {
        // Cuando una bola se sale por la derecha vuelve a entrar por la izquierda a otra altura
        this.bolasFuego.getChildren().forEach(bola => {
            if (bola.active && bola.x > ANCHO + 40)
            {
                this.reiniciarBolaFuego(bola);
            }
        });
    }

    // Dibuja la textura del fuego con graficos, asi no hace falta ninguna imagen nueva
    crearTexturaBolaFuego ()
    {
        if (this.textures.exists('bolafuego'))
        {
            return;
        }

        const centro = BOLA.tamanoTextura / 2;
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        g.fillStyle(0xff2200, 0.35);   // halo rojo exterior
        g.fillCircle(centro, centro, 24);

        g.fillStyle(0xff6600, 1);      // cuerpo naranja
        g.fillCircle(centro, centro, 18);

        g.fillStyle(0xffcc00, 1);      // nucleo amarillo
        g.fillCircle(centro, centro, 12);

        g.fillStyle(0xfffbe6, 1);      // brillo del centro
        g.fillCircle(centro, centro, 6);

        g.generateTexture('bolafuego', BOLA.tamanoTextura, BOLA.tamanoTextura);
        g.destroy();
    }

    // Crea una bola nueva y la lanza desde la izquierda
    lanzarBolaFuego ()
    {
        const bola = this.bolasFuego.create(BOLA.xSalida, 0, 'bolafuego');

        bola.body.setAllowGravity(false);

        // Hitbox redonda centrada en la textura, mas justa que la caja cuadrada por defecto
        const desfase = (BOLA.tamanoTextura / 2) - BOLA.radio;
        bola.setCircle(BOLA.radio, desfase, desfase);
        bola.setDepth(5);

        // Estela de chispas que sigue a la bola
        this.add.particles(0, 0, 'chispa', {
            follow: bola,
            frequency: 25,
            speed: { min: 5, max: 30 },
            scale: { start: 1.4, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 450,
            tint: [ 0xffcc00, 0xff6600, 0xff2200 ],
            blendMode: 'ADD'
        }).setDepth(4);

        this.reiniciarBolaFuego(bola);
    }

    // Coloca la bola en el borde izquierdo a una altura aleatoria y la manda hacia la derecha
    reiniciarBolaFuego (bola)
    {
        const altura = MathPhaser.Between(BOLA.alturaMinima, BOLA.alturaMaxima);
        const velocidad = MathPhaser.Between(BOLA.velocidadMinima, BOLA.velocidadMaxima)
            + (this.ronda * BOLA.velocidadPorRonda);

        bola.enableBody(true, BOLA.xSalida, altura, true, true);
        bola.setVelocityY(0);
        bola.setVelocityX(velocidad);
        bola.setAngularVelocity(BOLA.giro);
    }
}
