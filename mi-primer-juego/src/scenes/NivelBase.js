import { Scene, Math as MathPhaser, Input } from 'phaser';

// Medidas del juego (las mismas que la config de main.js)
export const ANCHO = 800;
export const ALTO = 600;

// Ajustes del jugador, iguales en los tres niveles
const JUGADOR = {
    x: 100,
    y: 450,
    rebote: 0.1,
    gravedad: 10,
    velocidad: 160,
    salto: -270
};

// Ajustes de los fajos, iguales en los tres niveles
const FAJOS = {
    cantidad: 11,
    margenIzquierdo: 12,
    separacion: 70,
    puntos: 10
};

/**
 * Clase base con todo lo que comparten los tres niveles: mapa, jugador,
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
        this.add.image(ANCHO / 2, ALTO / 2, this.ajustes.fondo.clave);

        this.crearMapa();
        this.crearAnimaciones();
        this.crearJugador();
        this.crearFajos();
        this.crearPinchos();
        this.crearControles();
        this.crearMarcador();

        this.alCrear();
    }

    crearMapa ()
    {
        this.mapa = this.make.tilemap({ key: this.ajustes.mapa.clave });

        const tileset = this.mapa.addTilesetImage('objetos tierra', 'tiles');
        this.mapa.createLayer(this.ajustes.mapa.capaTierra, tileset, 0, 0);

        // Colisiones invisibles dibujadas a mano en Tiled
        this.colTierraObjects = this.physics.add.staticGroup();

        this.mapa.getObjectLayer(this.ajustes.mapa.capaColisiones).objects.forEach(obj => {
            const colision = this.colTierraObjects.create(obj.x, obj.y, null);
            colision.setSize(obj.width, obj.height);
            colision.setVisible(false);
            colision.body.setOffset(10, 20);
        });
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
        this.player = this.physics.add.sprite(JUGADOR.x, JUGADOR.y, 'pana');

        this.player.setBounce(JUGADOR.rebote);
        this.player.setCollideWorldBounds(false);
        this.player.body.setGravityY(JUGADOR.gravedad);

        this.physics.add.collider(this.player, this.colTierraObjects);
    }

    crearFajos ()
    {
        this.fajos = this.physics.add.group();

        for (let i = 0; i < FAJOS.cantidad; i++)
        {
            const fajo = this.fajos.create(FAJOS.margenIzquierdo + (i * FAJOS.separacion), 0, 'fajo');
            fajo.setBounceY(MathPhaser.FloatBetween(0.4, 0.8));
        }

        this.physics.add.collider(this.fajos, this.colTierraObjects);
        this.physics.add.overlap(this.player, this.fajos, this.recogerFajo, null, this);
    }

    crearPinchos ()
    {
        this.pinchos = this.physics.add.staticGroup();

        this.mapa.getObjectLayer('pinchos').objects.forEach(obj => {
            const pincho = this.pinchos.create(obj.x, obj.y - obj.height, 'pinchos').setOrigin(0);
            pincho.body.setOffset(20, 15);
        });

        this.physics.add.overlap(this.player, this.pinchos, this.morirJugador, null, this);
    }

    crearControles ()
    {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.escapeKey = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.ESC);
    }

    crearMarcador ()
    {
        const estilo = {
            fontSize: '27px',
            fill: this.ajustes.colorTexto,
            fontFamily: '"Archivo Black", sans-serif'
        };

        this.puntos = 0;
        this.puntosText = this.add.text(16, 16, 'Puntuacion: 0', estilo);
        this.nivelText = this.add.text(340, 16, this.ajustes.titulo, estilo);
        this.controlesText = this.add.text(600, 16, 'Menu: ESC ', { fontSize: '27px', fill: this.ajustes.colorTexto });

        // El marcador siempre por encima del jugador y de los objetos
        [ this.puntosText, this.nivelText, this.controlesText ].forEach(texto => texto.setDepth(10));
    }

    recogerFajo (player, fajo)
    {
        fajo.disableBody(true, true);

        this.puntos += FAJOS.puntos;
        this.puntosText.setText('Puntuacion: ' + this.puntos);

        if (this.fajos.countActive(true) === 0)
        {
            this.alRecogerTodosLosFajos();
        }
    }

    // Vuelve a activar los 11 fajos en su sitio, cada uno cayendo desde arriba
    reaparecerFajos ()
    {
        this.fajos.getChildren().forEach(fajo => {
            fajo.enableBody(true, fajo.x, 0, true, true);
        });
    }

    morirJugador ()
    {
        this.scene.stop();
        this.scene.start('EscenaGameOver');
    }

    update ()
    {
        if (Input.Keyboard.JustDown(this.escapeKey))
        {
            this.scene.pause();
            this.scene.launch('EscenaPausa');
            this.scene.bringToTop('EscenaPausa');
        }

        this.moverJugador();
        this.alActualizar();
    }

    moverJugador ()
    {
        if (this.cursors.left.isDown)
        {
            this.player.setVelocityX(-JUGADOR.velocidad);
            this.player.anims.play('left', true);
        }
        else if (this.cursors.right.isDown)
        {
            this.player.setVelocityX(JUGADOR.velocidad);
            this.player.anims.play('right', true);
        }
        else
        {
            this.player.setVelocityX(0);
            this.player.anims.play('turn');
        }

        if (this.cursors.up.isDown && this.player.body.touching.down)
        {
            this.player.setVelocityY(JUGADOR.salto);
        }
    }

    // ---- Puntos de extension que cada nivel sobreescribe si los necesita ----

    /** Se llama al final de create(), para lo propio de cada nivel. */
    alCrear () {}

    /** Se llama en cada frame, para lo propio de cada nivel. */
    alActualizar () {}

    /** Que pasa cuando no queda ningun fajo. Obligatorio en cada nivel. */
    alRecogerTodosLosFajos () {}
}
