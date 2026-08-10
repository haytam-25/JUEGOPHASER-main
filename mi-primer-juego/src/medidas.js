/*
 * Medidas y tipografias del juego, en un solo sitio para no repetir numeros sueltos.
 */

// 1138x640 es formato 16:9, asi llena las pantallas panoramicas sin barras negras
export const ANCHO = 1138;
export const ALTO = 640;

// Los mapas hechos en Tiled miden 960x640, se colocan centrados dentro de la ventana
export const MAPA_ANCHO = 960;

// Cuanto hay que correr el mapa hacia la derecha para que quede centrado (89 px)
export const DESPLAZAMIENTO_X = (ANCHO - MAPA_ANCHO) / 2;

// Tipografias (los @font-face estan en public/style.css)
export const FUENTE_TITULO = '"Rye", serif';       // carteles del oeste
export const FUENTE_TEXTO = '"Special Elite", monospace'; // maquina de escribir
