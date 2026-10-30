import { Textures } from 'phaser';
import { ANCHO, ALTO, FUENTE_TITULO } from './medidas.js';

/*
 * Piezas visuales que comparten los menus y los niveles: paneles de madera,
 * botones, la vineta oscura de los bordes y las texturas de las particulas.
 */

export const COLORES = {
    madera: 0x2b1405,
    borde: 0xffd700,
    sombra: '#3b1d05'
};

/**
 * Las imagenes pixel art se ven borrosas si Phaser las suaviza al escalarlas.
 * Con el filtro NEAREST cada pixel se queda nitido. No se pone en toda la
 * configuracion (pixelArt: true) porque entonces los textos salen dentados.
 */
export function pixelar (scene, claves)
{
    claves.forEach(clave => {
        if (scene.textures.exists(clave))
        {
            scene.textures.get(clave).setFilter(Textures.FilterMode.NEAREST);
        }
    });
}

/** Rectangulo redondeado oscuro con borde dorado, centrado en (x, y) */
export function crearPanel (scene, x, y, ancho, alto, alfa = 0.85)
{
    const panel = scene.add.graphics({ x, y });

    panel.fillStyle(COLORES.madera, alfa);
    panel.fillRoundedRect(-ancho / 2, -alto / 2, ancho, alto, 14);
    panel.lineStyle(3, COLORES.borde, 0.8);
    panel.strokeRoundedRect(-ancho / 2, -alto / 2, ancho, alto, 14);

    return panel;
}

/**
 * Boton con panel de fondo que crece al pasar el raton (o el dedo) por encima.
 * Devuelve la zona interactiva por si hace falta engancharle mas eventos.
 */
export function crearBoton (scene, x, y, texto, accion, { color = '#FFD700', tamano = 32, ancho = 320, alto = 64 } = {})
{
    const panel = crearPanel(scene, x, y, ancho, alto, 0.8);

    const etiqueta = scene.add.text(x, y, texto, {
        fontSize: tamano + 'px',
        fill: color,
        fontFamily: FUENTE_TITULO,
        stroke: COLORES.sombra,
        strokeThickness: 6
    }).setOrigin(0.5);

    const zona = scene.add.zone(x, y, ancho, alto).setInteractive({ useHandCursor: true });

    const escalar = escala => scene.tweens.add({
        targets: [ panel, etiqueta ],
        scale: escala,
        duration: 120,
        ease: 'Quad.easeOut'
    });

    zona.on('pointerover', () => escalar(1.08));
    zona.on('pointerout', () => escalar(1));
    zona.on('pointerdown', accion);

    return zona;
}

/** Oscurece suavemente los bordes de la pantalla para centrar la mirada en el juego */
export function crearVineta (scene, intensidad = 0.55)
{
    const clave = 'vineta';

    if (!scene.textures.exists(clave))
    {
        const lienzo = scene.textures.createCanvas(clave, ANCHO, ALTO);
        const ctx = lienzo.getContext();
        const degradado = ctx.createRadialGradient(ANCHO / 2, ALTO / 2, ALTO * 0.35, ANCHO / 2, ALTO / 2, ANCHO * 0.7);

        degradado.addColorStop(0, 'rgba(0, 0, 0, 0)');
        degradado.addColorStop(1, 'rgba(0, 0, 0, 1)');

        ctx.fillStyle = degradado;
        ctx.fillRect(0, 0, ANCHO, ALTO);
        lienzo.refresh();
    }

    return scene.add.image(ANCHO / 2, ALTO / 2, clave).setAlpha(intensidad);
}

/** Circulo blanco difuminado que sirve para chispas, polvo y fuego (se tinta al usarlo) */
export function crearTexturaChispa (scene)
{
    if (scene.textures.exists('chispa'))
    {
        return;
    }

    const g = scene.make.graphics({ x: 0, y: 0, add: false });

    g.fillStyle(0xffffff, 0.3);
    g.fillCircle(8, 8, 8);
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(8, 8, 5);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(8, 8, 3);

    g.generateTexture('chispa', 16, 16);
    g.destroy();
}
