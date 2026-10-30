import { Scene, Math as MathPhaser, Input, Cameras } from 'phaser';
import { ANCHO, ALTO, DESPLAZAMIENTO_X, FUENTE_TITULO, FUENTE_TEXTO } from '../medidas.js';
import { ControlesTactiles, esDispositivoTactil } from '../controlesTactiles.js';
import { COLORES, pixelar, crearPanel, crearVineta, crearTexturaChispa } from '../ui.js';

// Ajustes del jugador, iguales en los tres niveles.
// La x es relativa al mapa: luego se le suma DESPLAZAMIENTO_X.
const JUGADOR = {
    x: 100,
    y: 450,
    rebote: 0.1,
    gravedad: 10,
    velocidad: 160,
    salto: -270,
    // Hitbox mas estrecha que el dibujo (41x63): sin ella el jugador se quedaba
    // "colgado" del borde de las plataformas por la punta de la pistola
    anchoCuerpo: 24,
    altoCuerpo: 56
};

// Ajustes de los fajos, iguales en los tres niveles
const FAJOS = {
    cantidad: 11,
    margenIzquierdo: 12,
    separacion: 70,
    puntos: 10
};

// En la imagen "objetos tierra" las columnas 0 a 6 son bloques de tierra (suelo firme)
// y las de la derecha son decoracion (arbustos, arboles...) que se puede atravesar
const COLUMNAS_SUELO = 7;

// Pixeles de diferencia que se permiten al juntar tiles en un mismo bloque de colision
const TOLERANCIA = 6;

// Margen que se le quita a la hitbox de los pinchos, para que no maten con solo rozarlos
const MARGEN_PINCHOS = 3;

// Lo que ocupa el dibujo de cada tile (sin la parte transparente). Se guarda por
// textura para no tener que volver a leer los pixeles al reiniciar un nivel.
const contornosPorTextura = new Map();

/**
 * Clase base con todo lo que comparten los tres niveles: fondo, mapa, jugador,
 * animaciones, marcador, controles, fajos y pinchos.
 *
 * Cada nivel solo pasa sus ajustes al constructor y decide que ocurre
 * cuando se recogen todos los fajos (metodo alRecogerTodosLosFajos).
 */
export class NivelBase extends Scene {

    /**
     * @param {string} clave    nombre de la escena
     * @param {object} ajustes  fondo, mapa, titulo y color del nivel
     */
    constructor (clave, ajustes)
    {
        super(clave);
        this.ajustes = ajustes;
    }

    preload ()
    {
        this.load.setPath('assets');

        this.load.image(this.ajustes.fondo.clave, this.ajustes.fondo.archivo);
        this.load.image('fajo', 'diamante.png');
        this.load.image('tiles', 'tilesets/objetos tierra.png');
        this.load.image('pinchos', 'tilesets/pinchos.png');

        this.load.spritesheet('pana', 'imagenfinal.png', { frameWidth: 41, frameHeight: 63 });

        this.load.tilemapTiledJSON(this.ajustes.mapa.clave, this.ajustes.mapa.archivo);
    }

    create ()
    {
        // El jugador ni ha muerto ni esta pasando de nivel (se reinicia al volver a entrar)
        this.terminado = false;

        pixelar(this, [ this.ajustes.fondo.clave, 'fajo', 'tiles', 'pinchos', 'pana' ]);
        crearTexturaChispa(this);

        this.crearFondo();
        this.crearMapa();
        this.crearAnimaciones();
        this.crearJugador();
        this.crearFajos();
        this.crearPinchos();
        this.crearEfectos();
        this.crearControles();
        this.crearMarcador();

        this.alCrear();

        this.cameras.main.fadeIn(400, 0, 0, 0);
        this.mostrarCartelNivel();
    }

    // Agranda el fondo hasta cubrir toda la ventana, sin deformarlo
    crearFondo ()
    {
        const fondo = this.add.image(ANCHO / 2, ALTO / 2, this.ajustes.fondo.clave);
        const escala = Math.max(ANCHO / fondo.width, ALTO / fondo.height);

        fondo.setScale(escala);

        crearVineta(this, 0.35);
    }

    crearMapa ()
    {
        this.mapa = this.make.tilemap({ key: this.ajustes.mapa.clave });

        // Cada tileset del mapa usa la imagen de "objetos tierra" o la de "pinchos",
        // segun su nombre. Hay que registrarlos todos para que Phaser sepa dibujar
        // cualquier tile pintado en Tiled, sea del tipo que sea.
        this.tilesets = this.mapa.tilesets.map(ts => {
            const claveImagen = ts.name.toLowerCase().includes('pincho') ? 'pinchos' : 'tiles';
            return this.mapa.addTilesetImage(ts.name, claveImagen);
        });

        this.tilesetPinchos = this.tilesets.find(ts => ts.name.toLowerCase().includes('pincho'));

        this.capaTierra = this.mapa.createLayer(this.ajustes.mapa.capaTierra, this.tilesets, DESPLAZAMIENTO_X, 0);

        this.crearBordesSuelo();

        this.colTierraObjects = this.physics.add.staticGroup();
        this.plataformas = this.physics.add.staticGroup();

        this.crearColisionesTierra();
        this.crearColisionesExtra();
    }

    /**
     * El mapa mide 960 px y la ventana 1138, asi que a cada lado quedan 89 px
     * sin dibujar. Se rellenan copiando las filas de suelo que llegan hasta el
     * borde del mapa, para que el suelo ocupe toda la pantalla.
     */
    crearBordesSuelo ()
    {
        const columnas = Math.ceil(DESPLAZAMIENTO_X / this.mapa.tileWidth);
        const anchoBorde = columnas * this.mapa.tileWidth;
        const ultima = this.mapa.width - 1;

        const izquierda = this.mapa.createBlankLayer('bordeIzquierdo', this.tilesets,
            DESPLAZAMIENTO_X - anchoBorde, 0, columnas, this.mapa.height);
        const derecha = this.mapa.createBlankLayer('bordeDerecho', this.tilesets,
            DESPLAZAMIENTO_X + this.mapa.widthInPixels, 0, columnas, this.mapa.height);

        for (let fila = 0; fila < this.mapa.height; fila++)
        {
            // Solo se copian filas de suelo macizo (dos tiles seguidos que llenan
            // su casilla entera), nunca el trozo de una plataforma o un arbusto
            if (this.esSueloMacizo(0, fila) && this.esSueloMacizo(1, fila))
            {
                izquierda.fill(this.capaTierra.getTileAt(0, fila).index, 0, fila, columnas, 1);
            }

            if (this.esSueloMacizo(ultima, fila) && this.esSueloMacizo(ultima - 1, fila))
            {
                derecha.fill(this.capaTierra.getTileAt(ultima, fila).index, 0, fila, columnas, 1);
            }
        }
    }

    esSueloMacizo (columna, fila)
    {
        const contorno = this.contornoSuelo(this.capaTierra.getTileAt(columna, fila));
        const t = this.mapa.tileWidth;

        return contorno !== null && contorno.izquierda === 0 && contorno.derecha === t
            && contorno.arriba === 0 && contorno.abajo === t;
    }

    /**
     * Crea las colisiones del suelo a partir del propio dibujo de los tiles, en
     * vez de con rectangulos hechos a mano: asi el jugador pisa justo la hierba
     * y llega hasta el borde de cada plataforma. Al pintar un bloque nuevo en
     * Tiled ya tiene colision, no hace falta dibujar nada mas.
     *
     * Primero se juntan los tiles seguidos de cada fila en tramos, y luego los
     * tramos de filas consecutivas que tienen el mismo ancho en un solo bloque.
     */
    crearColisionesTierra ()
    {
        const bloques = [];
        let filaAnterior = [];

        for (let fila = 0; fila < this.mapa.height; fila++)
        {
            const tramos = this.tramosDeFila(fila);

            filaAnterior = tramos.map(tramo => {
                const encima = filaAnterior.find(b => b.abajo === tramo.arriba
                    && Math.abs(b.izquierda - tramo.izquierda) <= TOLERANCIA
                    && Math.abs(b.derecha - tramo.derecha) <= TOLERANCIA);

                if (encima)
                {
                    encima.abajo = tramo.abajo;
                    return encima;
                }

                bloques.push(tramo);
                return tramo;
            });
        }

        const apoyados = this.bloquesApoyados(bloques);

        bloques.forEach(b => {
            // El suelo de abajo del todo se alarga por los dos lados hasta el borde de la pantalla
            if (b.abajo === this.mapa.heightInPixels)
            {
                if (b.izquierda === 0) { b.izquierda = -DESPLAZAMIENTO_X; }
                if (b.derecha === this.mapa.widthInPixels) { b.derecha += DESPLAZAMIENTO_X; }
            }

            // Lo que esta apoyado en el suelo es macizo (hace de pared). Las plataformas
            // que flotan se atraviesan desde abajo: si no, en los huecos estrechos el
            // jugador se daba con la cabeza y no cabia para subir.
            const grupo = apoyados.has(b) ? this.colTierraObjects : this.plataformas;

            this.anadirColision(b.izquierda, b.arriba, b.derecha - b.izquierda, b.abajo - b.arriba, grupo);
        });
    }

    /**
     * Devuelve los bloques que se sostienen sobre el suelo del mapa, directamente
     * o encima de otro bloque que ya lo esta (por ejemplo, las torres de dos piezas).
     */
    bloquesApoyados (bloques)
    {
        const apoyados = new Set(bloques.filter(b => b.abajo === this.mapa.heightInPixels));
        let hayNuevos = true;

        while (hayNuevos)
        {
            hayNuevos = false;

            bloques.forEach(b => {
                const sobreOtro = [ ...apoyados ].some(debajo => Math.abs(b.abajo - debajo.arriba) <= 2
                    && b.izquierda < debajo.derecha && b.derecha > debajo.izquierda);

                if (!apoyados.has(b) && sobreOtro)
                {
                    apoyados.add(b);
                    hayNuevos = true;
                }
            });
        }

        return apoyados;
    }

    /**
     * Para las plataformas que se atraviesan: solo chocan si el jugador viene
     * cayendo y en el paso anterior tenia los pies por encima de ellas.
     */
    pisaPorEncima (jugador, plataforma)
    {
        const cuerpo = jugador.body;

        return cuerpo.velocity.y >= 0 && cuerpo.prev.y + cuerpo.height <= plataforma.body.y + 1;
    }

    // Junta los tiles de suelo que se tocan en una fila. Devuelve rectangulos en pixeles del mapa.
    tramosDeFila (fila)
    {
        const tramos = [];
        let actual = null;

        for (let columna = 0; columna < this.mapa.width; columna++)
        {
            const tile = this.capaTierra.getTileAt(columna, fila);
            const contorno = this.contornoSuelo(tile);

            if (!contorno)
            {
                actual = null;
                continue;
            }

            const rect = {
                izquierda: tile.pixelX + contorno.izquierda,
                derecha: tile.pixelX + contorno.derecha,
                arriba: tile.pixelY + contorno.arriba,
                abajo: tile.pixelY + contorno.abajo
            };

            // Sigue el mismo tramo si el dibujo continua sin hueco y a la misma altura
            const pegado = actual && actual.derecha === rect.izquierda
                && Math.abs(actual.arriba - rect.arriba) <= TOLERANCIA;

            if (pegado)
            {
                actual.derecha = rect.derecha;
                actual.arriba = Math.min(actual.arriba, rect.arriba);
                actual.abajo = Math.max(actual.abajo, rect.abajo);
            }
            else
            {
                actual = rect;
                tramos.push(actual);
            }
        }

        return tramos;
    }

    /**
     * Si el tile es un bloque de tierra devuelve lo que ocupa su dibujo dentro
     * de la casilla ({ izquierda, derecha, arriba, abajo }), si no, null.
     */
    contornoSuelo (tile)
    {
        if (!tile || tile.index < 0 || tile.tileset.image.key !== 'tiles')
        {
            return null;
        }

        const id = tile.index - tile.tileset.firstgid;

        if (id % tile.tileset.columns >= COLUMNAS_SUELO)
        {
            return null;
        }

        return this.contornosTiles('tiles', tile.tileset.tileWidth, tile.tileset.tileHeight)[id];
    }

    /**
     * Lee los pixeles de una imagen dividida en tiles y calcula, para cada tile,
     * el rectangulo que ocupa su dibujo (null si esta vacio).
     */
    contornosTiles (clave, anchoTile, altoTile)
    {
        if (contornosPorTextura.has(clave))
        {
            return contornosPorTextura.get(clave);
        }

        const imagen = this.textures.get(clave).getSourceImage();
        const lienzo = document.createElement('canvas');
        const ctx = lienzo.getContext('2d', { willReadFrequently: true });

        lienzo.width = imagen.width;
        lienzo.height = imagen.height;
        ctx.drawImage(imagen, 0, 0);

        const pixeles = ctx.getImageData(0, 0, imagen.width, imagen.height).data;
        const columnas = Math.floor(imagen.width / anchoTile);
        const filas = Math.floor(imagen.height / altoTile);
        const contornos = [];

        for (let id = 0; id < columnas * filas; id++)
        {
            const x0 = (id % columnas) * anchoTile;
            const y0 = Math.floor(id / columnas) * altoTile;
            let contorno = null;

            for (let y = 0; y < altoTile; y++)
            {
                for (let x = 0; x < anchoTile; x++)
                {
                    // Canal alfa: por encima de 128 el pixel se ve
                    if (pixeles[((y0 + y) * imagen.width + x0 + x) * 4 + 3] > 128)
                    {
                        contorno ??= { izquierda: x, derecha: x + 1, arriba: y, abajo: y + 1 };
                        contorno.izquierda = Math.min(contorno.izquierda, x);
                        contorno.derecha = Math.max(contorno.derecha, x + 1);
                        contorno.abajo = y + 1;
                    }
                }
            }

            contornos.push(contorno);
        }

        contornosPorTextura.set(clave, contornos);

        return contornos;
    }

    // Obstaculos que no son bloques de tierra (troncos de arbol...), dibujados a mano en Tiled
    crearColisionesExtra ()
    {
        const capa = this.mapa.getObjectLayer(this.ajustes.mapa.capaColisiones);

        if (!capa)
        {
            return;
        }

        capa.objects.forEach(obj => this.anadirColision(obj.x, obj.y, obj.width, obj.height));
    }

    // Rectangulo de colision invisible, con x e y en pixeles del mapa (esquina de arriba a la izquierda)
    anadirColision (x, y, ancho, alto, grupo = this.colTierraObjects)
    {
        const zona = this.add.zone(x + DESPLAZAMIENTO_X, y, ancho, alto).setOrigin(0);

        grupo.add(zona);
    }

    crearAnimaciones ()
    {
        // El gestor de animaciones es global, si ya se crearon en otro nivel no hay que repetirlas
        if (this.anims.exists('turn'))
        {
            return;
        }

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('pana', { start: 0, end: 2 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [ { key: 'pana', frame: 3 } ],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('pana', { start: 4, end: 6 }),
            frameRate: 10,
            repeat: -1
        });
    }

    crearJugador ()
    {
        this.player = this.physics.add.sprite(JUGADOR.x + DESPLAZAMIENTO_X, JUGADOR.y, 'pana');

        this.player.setBounce(JUGADOR.rebote);
        this.player.body.setGravityY(JUGADOR.gravedad);
        this.player.setDepth(5);

        // Hitbox centrada y apoyada en los pies del dibujo
        this.player.body.setSize(JUGADOR.anchoCuerpo, JUGADOR.altoCuerpo);
        this.player.body.setOffset(
            (this.player.width - JUGADOR.anchoCuerpo) / 2,
            this.player.height - JUGADOR.altoCuerpo
        );

        // Los bordes de la pantalla hacen de pared: el jugador no se puede salir por los lados
        this.player.setCollideWorldBounds(true);

        this.physics.add.collider(this.player, this.colTierraObjects);
        this.physics.add.collider(this.player, this.plataformas, null, this.pisaPorEncima, this);

        this.enElSuelo = true;
    }

    crearFajos ()
    {
        this.fajos = this.physics.add.group();

        for (let i = 0; i < FAJOS.cantidad; i++)
        {
            const x = FAJOS.margenIzquierdo + (i * FAJOS.separacion) + DESPLAZAMIENTO_X;
            const fajo = this.fajos.create(x, 0, 'fajo');

            fajo.setBounceY(MathPhaser.FloatBetween(0.4, 0.8));
            fajo.setDepth(4);
        }

        // Brillo que va y viene, para que se vean de lejos
        this.tweens.add({
            targets: this.fajos.getChildren(),
            alpha: 0.65,
            duration: 700,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: this.tweens.stagger(90)
        });

        this.physics.add.collider(this.fajos, [ this.colTierraObjects, this.plataformas ]);
        this.physics.add.overlap(this.player, this.fajos, this.recogerFajo, null, this);
    }

    /**
     * Un pincho por cada tile del tileset "pinchos" pintado en la capa de tierra:
     * basta con pintarlo en Tiled, no hace falta marcar nada mas a mano.
     *
     * El dibujo del pincho no llega al borde de abajo de su casilla, asi que si
     * esta encima de un bloque se baja hasta que toque la hierba (si no, flota).
     */
    crearPinchos ()
    {
        this.pinchos = this.physics.add.staticGroup();

        const t = this.mapa.tileWidth;
        const dibujo = this.contornosTiles('pinchos', t, t)[0];
        const tiles = this.capaTierra.filterTiles(tile => tile.index === this.tilesetPinchos.firstgid);

        tiles.forEach(tile => {
            const debajo = this.contornoSuelo(this.capaTierra.getTileAt(tile.x, tile.y + 1));
            const bajada = debajo ? t + debajo.arriba - dibujo.abajo : 0;

            // El tile se quita del mapa y se pone una imagen en su lugar, ya bajada
            this.capaTierra.removeTileAt(tile.x, tile.y);

            const x = tile.pixelX + DESPLAZAMIENTO_X;
            const y = tile.pixelY + bajada;

            this.add.image(x, y, 'pinchos').setOrigin(0).setDepth(3);

            const hitbox = this.add.zone(
                x + dibujo.izquierda + MARGEN_PINCHOS,
                y + dibujo.arriba + MARGEN_PINCHOS,
                (dibujo.derecha - dibujo.izquierda) - (MARGEN_PINCHOS * 2),
                (dibujo.abajo - dibujo.arriba) - MARGEN_PINCHOS
            ).setOrigin(0);

            this.pinchos.add(hitbox);
        });

        this.physics.add.overlap(this.player, this.pinchos, this.morirJugador, null, this);
    }

    // Emisores de particulas: destellos al coger un fajo y polvo al saltar o caer
    crearEfectos ()
    {
        this.destellos = this.add.particles(0, 0, 'chispa', {
            emitting: false,
            speed: { min: 60, max: 180 },
            scale: { start: 0.8, end: 0 },
            lifespan: 450,
            tint: [ 0xffffff, 0x9ff3ff, 0xffd700 ],
            blendMode: 'ADD'
        }).setDepth(6);

        this.polvo = this.add.particles(0, 0, 'chispa', {
            emitting: false,
            speedX: { min: -70, max: 70 },
            speedY: { min: -40, max: -5 },
            scale: { start: 0.9, end: 0.2 },
            alpha: { start: 0.6, end: 0 },
            lifespan: 350,
            tint: 0xd8c3a0
        }).setDepth(4);
    }

    crearControles ()
    {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.escapeKey = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.ESC);
        this.controlesTactiles = new ControlesTactiles(this);
    }

    crearMarcador ()
    {
        const color = this.ajustes.colorTexto;
        const estilo = {
            fontSize: '24px',
            fill: color,
            fontFamily: FUENTE_TEXTO,
            stroke: COLORES.sombra,
            strokeThickness: 4
        };

        this.puntos = 0;

        // Paneles oscuros detras de los textos: se leen bien sobre cualquier fondo
        crearPanel(this, 151, 34, 270, 48, 0.6).setDepth(10);

        this.add.image(38, 34, 'fajo').setDepth(10);

        this.puntosText = this.add.text(58, 34, 'Puntuacion: 0', estilo).setOrigin(0, 0.5);

        this.nivelText = this.add.text(ANCHO / 2, 14, this.ajustes.titulo, {
            fontSize: '32px',
            fill: color,
            fontFamily: FUENTE_TITULO,
            stroke: COLORES.sombra,
            strokeThickness: 7
        }).setOrigin(0.5, 0);

        // En movil no hay tecla ESC, asi que el propio rotulo hace de boton de pausa
        const enTactil = esDispositivoTactil();

        crearPanel(this, ANCHO - 100, 34, 168, 48, 0.6).setDepth(10);

        this.controlesText = this.add.text(ANCHO - 100, 34, enTactil ? '|| Pausa' : 'Menu: ESC', estilo).setOrigin(0.5);

        if (enTactil)
        {
            // Area de pulsacion mas grande que el texto, para acertar con el dedo
            this.controlesText
                .setInteractive({ useHandCursor: true })
                .input.hitArea.setTo(-20, -14, this.controlesText.width + 40, this.controlesText.height + 28);

            this.controlesText.on('pointerdown', () => this.pausarJuego());
        }

        // El marcador siempre por encima del jugador y de los objetos
        [ this.puntosText, this.nivelText, this.controlesText ].forEach(texto => texto.setDepth(11));
    }

    // Cartel grande con el nombre del nivel que aparece al empezar y se desvanece
    mostrarCartelNivel ()
    {
        const cartel = this.add.text(ANCHO / 2, ALTO / 2 - 40, this.ajustes.titulo, {
            fontSize: '72px',
            fill: '#FFD700',
            fontFamily: FUENTE_TITULO,
            stroke: COLORES.sombra,
            strokeThickness: 12
        }).setOrigin(0.5).setDepth(12).setScale(0.6).setAlpha(0);

        this.tweens.chain({
            targets: cartel,
            tweens: [
                { scale: 1, alpha: 1, duration: 450, ease: 'Back.easeOut' },
                { alpha: 0, y: cartel.y - 30, duration: 500, delay: 700, ease: 'Quad.easeIn' }
            ],
            onComplete: () => cartel.destroy()
        });
    }

    recogerFajo (player, fajo)
    {
        fajo.disableBody(true, true);

        this.puntos += FAJOS.puntos;
        this.puntosText.setText('Puntuacion: ' + this.puntos);

        this.destellos.explode(14, fajo.x, fajo.y);
        this.mostrarPuntosFlotantes(fajo.x, fajo.y);

        // Pequeño salto del marcador para que se note que ha sumado
        this.tweens.add({ targets: this.puntosText, scale: 1.15, duration: 90, yoyo: true });

        if (this.fajos.countActive(true) === 0)
        {
            this.alRecogerTodosLosFajos();
        }
    }

    mostrarPuntosFlotantes (x, y)
    {
        const texto = this.add.text(x, y - 10, '+' + FAJOS.puntos, {
            fontSize: '22px',
            fill: '#FFD700',
            fontFamily: FUENTE_TITULO,
            stroke: COLORES.sombra,
            strokeThickness: 5
        }).setOrigin(0.5).setDepth(12);

        this.tweens.add({
            targets: texto,
            y: y - 50,
            alpha: 0,
            duration: 700,
            ease: 'Quad.easeOut',
            onComplete: () => texto.destroy()
        });
    }

    // Vuelve a activar los 11 fajos en su sitio, cada uno cayendo desde arriba
    reaparecerFajos ()
    {
        this.fajos.getChildren().forEach(fajo => {
            fajo.enableBody(true, fajo.x, 0, true, true);
        });
    }

    /** Funde a negro y pasa a otro nivel */
    cambiarDeNivel (clave)
    {
        if (this.terminado)
        {
            return;
        }

        this.terminado = true;
        this.controlesTactiles.reiniciarEstado();

        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start(clave));
    }

    morirJugador ()
    {
        if (this.terminado)
        {
            return;
        }

        this.terminado = true;
        this.controlesTactiles.reiniciarEstado();

        // Se congela todo un momento con el jugador en rojo antes de la pantalla de muerte
        this.physics.pause();
        this.player.anims.stop();
        this.player.setTint(0xff4444);
        this.cameras.main.shake(250, 0.012);
        this.cameras.main.flash(200, 160, 0, 0);

        this.time.delayedCall(700, () => {
            this.scene.launch('EscenaGameOver', { nivel: this.scene.key });
            this.scene.pause();
        });
    }

    update ()
    {
        if (this.terminado)
        {
            return;
        }

        if (Input.Keyboard.JustDown(this.escapeKey))
        {
            this.pausarJuego();
        }

        this.moverJugador();
        this.alActualizar();
    }

    pausarJuego ()
    {
        if (this.terminado)
        {
            return;
        }

        // Se sueltan los controles tactiles antes de pausar, para que el jugador
        // no siga moviendose solo al continuar
        this.controlesTactiles.reiniciarEstado();

        this.scene.pause();
        this.scene.launch('EscenaPausa');
        this.scene.bringToTop('EscenaPausa');
    }

    moverJugador ()
    {
        const izquierda = this.cursors.left.isDown || this.controlesTactiles.izquierda;
        const derecha = this.cursors.right.isDown || this.controlesTactiles.derecha;
        const salto = this.cursors.up.isDown || this.controlesTactiles.saltando;
        const enElSuelo = this.player.body.touching.down || this.player.body.blocked.down;

        if (izquierda)
        {
            this.player.setVelocityX(-JUGADOR.velocidad);
            this.player.anims.play('left', true);
        }
        else if (derecha)
        {
            this.player.setVelocityX(JUGADOR.velocidad);
            this.player.anims.play('right', true);
        }
        else
        {
            this.player.setVelocityX(0);
            this.player.anims.play('turn');
        }

        // Nube de polvo en los pies al aterrizar
        if (enElSuelo && !this.enElSuelo)
        {
            this.polvo.explode(6, this.player.x, this.player.body.bottom);
        }

        if (salto && enElSuelo)
        {
            this.player.setVelocityY(JUGADOR.salto);
            this.polvo.explode(4, this.player.x, this.player.body.bottom);
        }

        this.enElSuelo = enElSuelo;
    }

    // ---- Puntos de extension que cada nivel sobreescribe si los necesita ----

    /** Se llama al final de create(), para lo propio de cada nivel. */
    alCrear () {}

    /** Se llama en cada frame, para lo propio de cada nivel. */
    alActualizar () {}

    /** Que pasa cuando no queda ningun fajo. Obligatorio en cada nivel. */
    alRecogerTodosLosFajos () {}
}
