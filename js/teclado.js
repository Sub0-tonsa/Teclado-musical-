const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Tabela de frequências expandida para 4 oitavas
// As chaves devem ser iguais aos atributos data-nota no seu HTML
const frequencias = {
    // Oitava 1 (Grave)
    "c1": 130.81, "cs1": 138.59, "d1": 146.83, "ds1": 155.56, "e1": 164.81, "f1": 174.61,
    "fs1": 185.00, "g1": 196.00, "gs1": 207.65, "a1": 220.00, "as1": 233.08, "b1": 246.94,

    // Oitava 2 (Médio-Grave)
    "c2": 261.63, "cs2": 277.18, "d2": 293.66, "ds2": 311.13, "e2": 329.63, "f2": 349.23,
    "fs2": 369.99, "g2": 392.00, "gs2": 415.30, "a2": 440.00, "as2": 466.16, "b2": 493.88,

    // Oitava 3 (Médio-Agudo)
    "c3": 523.25, "cs3": 554.37, "d3": 587.33, "ds3": 622.25, "e3": 659.25, "f3": 698.46,
    "fs3": 739.99, "g3": 783.99, "gs3": 830.61, "a3": 880.00, "as3": 932.33, "b3": 987.77,

    // Oitava 4 (Agudo)
    "c4": 1046.50, "cs4": 1108.73, "d4": 1174.66, "ds4": 1244.51, "e4": 1318.51, "f4": 1396.91,
    "fs4": 1479.98, "g4": 1567.98, "gs4": 1661.22, "a4": 1760.00, "as4": 1864.66, "b4": 1975.53
};

const osciladoresAtivos = {};
const teclas = document.querySelectorAll(".oitava > div");

function tocarNota(nota, elementoHTML) {
    if (!frequencias[nota] || osciladoresAtivos[nota]) return;

    elementoHTML.classList.add("selecionada");

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = "triangle"; // 'triangle' soa mais parecido com um piano/flauta que o 'sine'
    osc.frequency.value = frequencias[nota];

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

    osc.start();
    osciladoresAtivos[nota] = { osc, gainNode };
}

function pararNota(nota, elementoHTML) {
    if (!osciladoresAtivos[nota]) return;

    elementoHTML.classList.remove("selecionada");

    const { osc, gainNode } = osciladoresAtivos[nota];

    // Suaviza o desligamento para não dar "estalo" no som
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);
    osc.stop(audioCtx.currentTime + 0.1);

    delete osciladoresAtivos[nota];
}

// Eventos de Mouse
teclas.forEach(function (tecla) {
    // Pegamos a nota do atributo data-nota (ex: c1, cs1...)
    const nota = tecla.getAttribute("data-nota");

    tecla.onmousedown = () => {
        if (audioCtx.state === 'suspended') audioCtx.resume(); // Chrome exige interação para iniciar som
        tocarNota(nota, tecla);
    };
    tecla.onmouseup = () => pararNota(nota, tecla);
    tecla.onmouseleave = () => pararNota(nota, tecla);
});

// Eventos de Teclado
document.addEventListener("keydown", (evento) => {
    if (evento.repeat) return; // Evita que a nota fique reiniciando se segurar a tecla
    const teclaHTML = document.querySelector(`[data-tecla="${evento.key.toLowerCase()}"]`);
    if (teclaHTML) {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const nota = teclaHTML.getAttribute("data-nota");
        tocarNota(nota, teclaHTML);
    }
});

document.addEventListener("keyup", (evento) => {
    const teclaHTML = document.querySelector(`[data-tecla="${evento.key.toLowerCase()}"]`);
    if (teclaHTML) {
        const nota = teclaHTML.getAttribute("data-nota");
        pararNota(nota, teclaHTML);
    }
});

window.onload = function () {
    const elementoAno = document.getElementById("ano-atual");
    if (elementoAno) {
        elementoAno.textContent = new Date().getFullYear();
    }
};