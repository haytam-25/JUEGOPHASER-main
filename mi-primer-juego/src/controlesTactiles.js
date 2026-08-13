import { Math as MathPhaser } from 'phaser';

/**
 * Decide si hay que mostrar los controles tactiles.
 *
 * No usamos el device.input.touch de Phaser porque ese valor se calcula una
 * sola vez al cargar la libreria, y en la emulacion movil de Chrome (F12) se
 * queda en false. Aqui se comprueba en el momento y con varias señales:
 *
 *  - (pointer: coarse) es la buena: true en moviles y tablets, y tambien en la
 *    emulacion de Chrome, pero false en un ordenador con raton.
 *  - maxTouchPoints y ontouchstart cubren navegadores mas antiguos.
 *
 * Ademas se puede forzar desde la URL para poder probarlo o enseñarlo:
 *  ?tactil=1  fuerza que salgan     ?tactil=0  fuerza que no salgan
 */
export function esDispositivoTactil ()
{
    const forzado = new URLSearchParams(window.location.search).get('tactil');

    if (forzado === '1') { return true; }
    if (forzado === '0') { return false; }

    return window.matchMedia('(pointer: coarse)').matches
        || navigator.maxTouchPoints > 0
        || 'ontouchstart' in window;
}

// Ajustes visuales del joystick y el boton de salto
const JOYSTICK = {
    radioBase: 90,
    radioStick: 28,
    margenX: 100,
    margenY: 100,
    zonaMuerta: 12
};

const BOTON_SALTO = {
    radio: 55,
    margenX: 90,
    margenY: 100
};

/**
 * Controles tactiles (joystick + boton de salto) para jugar sin teclado
 * desde un movil o una tablet. Solo se crean si el dispositivo tiene pantalla
 * tactil; en ordenadores con teclado no aparecen.
 *
 * Expone this.izquierda / this.derecha / this.saltando, que NivelBase combina
 * con las teclas de cursor en moverJugador().
 */
export class ControlesTactiles {

    constructor (scene)
    {
        this.scene = scene;
        this.activo = esDispositivoTactil();

        this.izquierda = false;
        this.derecha = false;
        this.saltando = false;

        this.punteroJoystick = null;

        if (this.activo)
        {
            this.crearJoystick();
            this.crearBotonSalto();
        }
    }

    crearJoystick ()
    {
        const { scene } = this;
        const x = JOYSTICK.margenX;
        const y = scene.scale.height - JOYSTICK.margenY;

        this.origenJoystick = { x, y };

        this.baseJoystick = scene.add.circle(x, y, JOYSTICK.radioBase, 0xffffff, 0.25)
            .setStrokeStyle(3, 0xffffff, 0.5)
            .setScrollFactor(0)
            .setDepth(20)
            .setInteractive();

        this.stickJoystick = scene.add.circle(x, y, JOYSTICK.radioStick, 0xffffff, 0.55)
            .setScrollFactor(0)
            .setDepth(21);

        this.baseJoystick.on('pointerdown', pointer => {
            this.punteroJoystick = pointer.id;
            this.moverStick(pointer);
        });

        scene.input.on('pointermove', pointer => {
            if (pointer.id === this.punteroJoystick)
            {
                this.moverStick(pointer);
            }
        });

        scene.input.on('pointerup', pointer => this.soltarJoystick(pointer));
        scene.input.on('pointerupoutside', pointer => this.soltarJoystick(pointer));
    }

    moverStick (pointer)
    {
        const origen = this.origenJoystick;
        const distancia = MathPhaser.Distance.Between(origen.x, origen.y, pointer.x, pointer.y);
        const angulo = MathPhaser.Angle.Between(origen.x, origen.y, pointer.x, pointer.y);
        const radio = Math.min(distancia, JOYSTICK.radioBase);

        this.stickJoystick.x = origen.x + Math.cos(angulo) * radio;
        this.stickJoystick.y = origen.y + Math.sin(angulo) * radio;

        const desplazamientoX = this.stickJoystick.x - origen.x;

        this.izquierda = desplazamientoX < -JOYSTICK.zonaMuerta;
        this.derecha = desplazamientoX > JOYSTICK.zonaMuerta;
    }

    // Solo suelta el joystick si el dedo que se levanta es el que lo estaba
    // moviendo, no el que esta pulsando el boton de salto
    soltarJoystick (pointer)
    {
        if (pointer.id === this.punteroJoystick)
        {
            this.centrarStick();
        }
    }

    centrarStick ()
    {
        this.punteroJoystick = null;
        this.izquierda = false;
        this.derecha = false;

        if (this.stickJoystick)
        {
            this.stickJoystick.x = this.origenJoystick.x;
            this.stickJoystick.y = this.origenJoystick.y;
        }
    }

    /**
     * Suelta todos los controles. Se llama al pausar: si no, el dedo se queda
     * "pegado" al joystick y el personaje sigue corriendo solo al continuar.
     */
    reiniciarEstado ()
    {
        this.centrarStick();
        this.saltando = false;
    }

    crearBotonSalto ()
    {
        const { scene } = this;
        const x = scene.scale.width - BOTON_SALTO.margenX;
        const y = scene.scale.height - BOTON_SALTO.margenY;

        this.botonSalto = scene.add.circle(x, y, BOTON_SALTO.radio, 0xffd700, 0.35)
            .setStrokeStyle(3, 0xffd700, 0.7)
            .setScrollFactor(0)
            .setDepth(20)
            .setInteractive();

        scene.add.text(x, y, '▲', {
            fontSize: '30px',
            fill: '#ffffff'
        })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(21);

        this.botonSalto.on('pointerdown', () => { this.saltando = true; });
        this.botonSalto.on('pointerup', () => { this.saltando = false; });
        this.botonSalto.on('pointerout', () => { this.saltando = false; });
        this.botonSalto.on('pointerupoutside', () => { this.saltando = false; });
    }
}
