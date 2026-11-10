// Tela do jogo. Você não precisa mexer neste arquivo:
// ele só desenha o que a API devolve e manda as trocas de regra de alvo.
import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';

const TICK_MS = 100;

const NOMES_TORRE = { CANHAO: 'Canhão', GELO: 'Torre de Gelo', LASER: 'Laser' };
const CORES_TORRE = { CANHAO: 0xc8553d, GELO: 0x4f9dc9, LASER: 0x8a4fbf };
const REGRAS = [
    ['PROXIMO', 'Mais próximo da torre'],
    ['FORTE', 'Mais forte (mais vida)'],
    ['AVANCADO', 'Mais avançado no caminho'],
];

// ---------------------------------------------------------------- cena

const container = document.getElementById('cena');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9fb38a);
scene.fog = new THREE.Fog(0x9fb38a, 40, 70);

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(1, 24, 19);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0.5);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI * 0.42;
controls.minDistance = 12;
controls.maxDistance = 45;
controls.update();

scene.add(new THREE.HemisphereLight(0xfff4dd, 0x5a6b45, 1.4));
const sol = new THREE.DirectionalLight(0xffffff, 2.2);
sol.position.set(-10, 20, 8);
sol.castShadow = true;
sol.shadow.mapSize.set(2048, 2048);
Object.assign(sol.shadow.camera, { left: -18, right: 18, top: 14, bottom: -14, near: 1, far: 60 });
scene.add(sol);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function material(cor, extra = {}) {
    return new THREE.MeshStandardMaterial({ color: cor, roughness: 0.85, flatShading: true, ...extra });
}

function sombra(obj) {
    obj.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    return obj;
}

// ---------------------------------------------------------------- tabuleiro

function montarTabuleiro(caminho) {
    const chao = new THREE.Mesh(new THREE.BoxGeometry(28, 0.6, 18), material(0x7f9a62));
    chao.position.y = -0.3;
    chao.receiveShadow = true;
    scene.add(chao);

    const borda = new THREE.Mesh(new THREE.BoxGeometry(28.6, 0.5, 18.6), material(0x6b5440));
    borda.position.y = -0.45;
    scene.add(borda);

    const pedra = material(0xd9c39a);
    for (let i = 1; i < caminho.length; i++) {
        const a = caminho[i - 1], b = caminho[i];
        const dx = b.x - a.x, dz = b.z - a.z;
        const largura = Math.abs(dx) + 1.6, profundidade = Math.abs(dz) + 1.6;
        const trecho = new THREE.Mesh(new THREE.BoxGeometry(largura, 0.08, profundidade), pedra);
        trecho.position.set((a.x + b.x) / 2, 0.04, (a.z + b.z) / 2);
        trecho.receiveShadow = true;
        scene.add(trecho);
    }

    // portão de entrada
    const inicio = caminho[0];
    const madeira = material(0x7a5a3c);
    for (const lado of [-1, 1]) {
        const poste = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.6, 0.3), madeira);
        poste.position.set(inicio.x + 0.3, 0.8, inicio.z + lado * 0.95);
        scene.add(sombra(poste));
    }
    const viga = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 2.3), madeira);
    viga.position.set(inicio.x + 0.3, 1.6, inicio.z);
    scene.add(sombra(viga));

    // base que os inimigos querem alcançar
    const fim = caminho[caminho.length - 1];
    const fortaleza = new THREE.Group();
    const parede = material(0xbfb6a8);
    const corpo = new THREE.Mesh(new THREE.BoxGeometry(2, 1.2, 2.4), parede);
    corpo.position.y = 0.6;
    fortaleza.add(corpo);
    for (const [x, z] of [[-1, -1.2], [1, -1.2], [-1, 1.2], [1, 1.2]]) {
        const torreta = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 1.7, 8), parede);
        torreta.position.set(x, 0.85, z);
        fortaleza.add(torreta);
    }
    const mastro = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4), madeira);
    mastro.position.set(0, 1.9, 0);
    fortaleza.add(mastro);
    const bandeira = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 0.03), material(0xe0b53f));
    bandeira.position.set(0.3, 2.4, 0);
    fortaleza.add(bandeira);
    fortaleza.position.set(fim.x + 1.4, 0, fim.z);
    scene.add(sombra(fortaleza));
    base.grupo = fortaleza;
    base.corpo = corpo;
    base.ponto = fim;

    // algumas árvores e pedras longe do caminho e das torres
    let semente = 7;
    const aleatorio = () => (semente = (semente * 9301 + 49297) % 233280) / 233280;
    const longeDoCaminho = (x, z) => {
        for (let i = 1; i < caminho.length; i++) {
            const a = caminho[i - 1], b = caminho[i];
            const minX = Math.min(a.x, b.x) - 1.8, maxX = Math.max(a.x, b.x) + 1.8;
            const minZ = Math.min(a.z, b.z) - 1.8, maxZ = Math.max(a.z, b.z) + 1.8;
            if (x > minX && x < maxX && z > minZ && z < maxZ) return false;
        }
        return Math.hypot(x - fim.x - 1.4, z - fim.z) > 3;
    };
    let colocadas = 0;
    while (colocadas < 26) {
        const x = -13 + aleatorio() * 26, z = -8 + aleatorio() * 16;
        if (!longeDoCaminho(x, z) || pontosOcupados.some(p => Math.hypot(p.x - x, p.z - z) < 1.6)) continue;
        scene.add(aleatorio() < 0.7 ? arvore(x, z, 0.7 + aleatorio() * 0.6) : rocha(x, z, aleatorio()));
        colocadas++;
    }
}

function arvore(x, z, escala) {
    const g = new THREE.Group();
    const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.5, 6), material(0x6b4a2f));
    tronco.position.y = 0.25;
    const copa = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.2, 7), material(0x4f7a3a));
    copa.position.y = 1;
    g.add(tronco, copa);
    g.scale.setScalar(escala);
    g.position.set(x, 0, z);
    return sombra(g);
}

function rocha(x, z, giro) {
    const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35, 0), material(0x9a958c));
    r.position.set(x, 0.15, z);
    r.rotation.set(giro * 3, giro * 5, 0);
    r.scale.y = 0.6;
    return sombra(r);
}

// ---------------------------------------------------------------- torres

const base = {};
const pontosOcupados = [];
const torresNaCena = new Map();

function criarTorre(t) {
    const g = new THREE.Group();
    const cor = CORES_TORRE[t.tipo];

    const pe = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.8, 0.7, 8), material(0x9c9488));
    pe.position.y = 0.35;
    g.add(pe);

    const cabeca = new THREE.Group();
    cabeca.position.y = 0.95;
    g.add(cabeca);

    let alturaDisparo = 1.0;
    if (t.tipo === 'CANHAO') {
        const bola = new THREE.Mesh(new THREE.SphereGeometry(0.45, 10, 8), material(cor));
        const cano = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.9, 8), material(0x3b3632));
        cano.rotation.z = Math.PI / 2;
        cano.position.x = 0.55;
        cabeca.add(bola, cano);
    } else if (t.tipo === 'GELO') {
        const cristal = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0),
            material(cor, { emissive: 0x2a6a99, emissiveIntensity: 0.35 }));
        cristal.scale.y = 1.4;
        cristal.position.y = 0.2;
        const bico = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.5, 6), material(0xdff0fa));
        bico.rotation.z = -Math.PI / 2;
        bico.position.set(0.5, 0.15, 0);
        cabeca.add(cristal, bico);
        g.userData.cristal = cristal;
        alturaDisparo = 1.15;
    } else {
        const haste = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 1.0, 6), material(0x4a4250));
        haste.position.y = 0.4;
        const lente = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8),
            material(cor, { emissive: cor, emissiveIntensity: 0.6 }));
        lente.position.set(0.15, 0.95, 0);
        cabeca.add(haste, lente);
        alturaDisparo = 1.9;
    }

    const anel = new THREE.Mesh(
        new THREE.RingGeometry(t.alcance - 0.06, t.alcance, 64),
        new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
    anel.rotation.x = -Math.PI / 2;
    anel.position.y = 0.1;
    g.add(anel);

    g.position.set(t.x, 0, t.z);
    scene.add(sombra(g));
    anel.castShadow = false;

    const rotulo = document.createElement('div');
    rotulo.className = 'rotulo-torre';
    rotulo.textContent = `${t.id} · ${NOMES_TORRE[t.tipo] ?? t.tipo}`;
    document.getElementById('rotulos').appendChild(rotulo);

    torresNaCena.set(t.id, { grupo: g, cabeca, anel, rotulo, alturaDisparo, tipo: t.tipo });
    pontosOcupados.push({ x: t.x, z: t.z });
}

function bocaDaTorre(id) {
    const t = torresNaCena.get(id);
    const ang = -t.cabeca.rotation.y;
    return new THREE.Vector3(
        t.grupo.position.x + Math.cos(ang) * 0.8,
        t.alturaDisparo,
        t.grupo.position.z + Math.sin(ang) * 0.8);
}

// ---------------------------------------------------------------- inimigos

const inimigosNaCena = new Map();

function criarInimigo(i) {
    const g = new THREE.Group();
    const corpo = new THREE.Group();
    g.add(corpo);
    const materiais = [];
    const m = (cor) => { const mat = material(cor); materiais.push(mat); return mat; };

    if (i.tipo === 'BATEDOR') {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.7, 6), m(0xe8c547));
        cone.rotation.z = -Math.PI / 2;
        cone.position.y = 0.35;
        corpo.add(cone);
    } else if (i.tipo === 'BLINDADO') {
        const casco = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.45, 0.75), m(0x5d5f63));
        casco.position.y = 0.35;
        const topo = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.5), m(0x46484c));
        topo.position.y = 0.7;
        for (const lado of [-1, 1]) {
            const esteira = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.22, 0.18), m(0x2f2f2f));
            esteira.position.set(0, 0.13, lado * 0.42);
            corpo.add(esteira);
        }
        corpo.add(casco, topo);
    } else {
        const tronco = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 0.3, 4, 8), m(0xd9822b));
        tronco.position.y = 0.5;
        const capacete = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), m(0x7a4a1f));
        capacete.position.y = 0.82;
        corpo.add(tronco, capacete);
    }

    const alturaBarra = i.tipo === 'BLINDADO' ? 1.15 : 1.15;
    const barra = new THREE.Group();
    const fundo = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.12), new THREE.MeshBasicMaterial({ color: 0x2b2620 }));
    const vida = new THREE.Mesh(new THREE.PlaneGeometry(0.76, 0.08), new THREE.MeshBasicMaterial({ color: 0x6cc24a }));
    vida.position.z = 0.001;
    barra.add(fundo, vida);
    barra.position.y = alturaBarra;
    g.add(barra);

    g.position.set(i.x, 0, i.z);
    scene.add(sombra(g));
    barra.traverse(o => { o.castShadow = false; });

    return { grupo: g, corpo, barra, vida, materiais, de: { x: i.x, z: i.z }, para: { x: i.x, z: i.z }, tipo: i.tipo };
}

function atualizarInimigo(obj, i) {
    obj.de = { x: obj.grupo.position.x, z: obj.grupo.position.z };
    obj.para = { x: i.x, z: i.z };
    const dx = obj.para.x - obj.de.x, dz = obj.para.z - obj.de.z;
    if (Math.abs(dx) + Math.abs(dz) > 0.001) obj.corpo.rotation.y = -Math.atan2(dz, dx);

    const fracao = Math.max(0, i.vida / i.vidaMaxima);
    obj.vida.scale.x = Math.max(0.001, fracao);
    obj.vida.position.x = -0.38 * (1 - fracao);
    obj.vida.material.color.setHex(fracao > 0.5 ? 0x6cc24a : fracao > 0.25 ? 0xe0b53f : 0xd2452f);

    for (const mat of obj.materiais) {
        mat.emissive.setHex(i.lento ? 0x3f8fd0 : 0x000000);
        mat.emissiveIntensity = i.lento ? 0.7 : 0;
    }
}

function removerInimigo(id, obj) {
    scene.remove(obj.grupo);
    inimigosNaCena.delete(id);
    const pos = obj.grupo.position.clone();
    if (Math.hypot(pos.x - base.ponto.x, pos.z - base.ponto.z) < 1.2) {
        efeitos.push(golpeNaBase());
    } else {
        efeitos.push(poeira(pos, obj.tipo === 'BLINDADO' ? 1.3 : 0.8));
    }
}

// ---------------------------------------------------------------- efeitos

const efeitos = [];

function feixe(de, para, cor, raio, duracao) {
    const dir = new THREE.Vector3().subVectors(para, de);
    const comprimento = dir.length();
    const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(raio, raio, comprimento, 6),
        new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: 0.9 }));
    mesh.position.copy(de).addScaledVector(dir, 0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    scene.add(mesh);
    let t = 0;
    return dt => {
        t += dt;
        mesh.material.opacity = 0.9 * (1 - t / duracao);
        if (t >= duracao) { scene.remove(mesh); mesh.geometry.dispose(); return false; }
        return true;
    };
}

function onda(centro, cor, raioFinal, duracao) {
    const mesh = new THREE.Mesh(
        new THREE.RingGeometry(0.85, 1, 40),
        new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: 0.8, side: THREE.DoubleSide }));
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(centro.x, 0.15, centro.z);
    scene.add(mesh);
    let t = 0;
    return dt => {
        t += dt;
        const p = Math.min(1, t / duracao);
        mesh.scale.setScalar(0.2 + p * (raioFinal - 0.2));
        mesh.material.opacity = 0.8 * (1 - p);
        if (p >= 1) { scene.remove(mesh); mesh.geometry.dispose(); return false; }
        return true;
    };
}

function balaDeCanhao(de, para) {
    const bala = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), material(0x2b2620));
    scene.add(bala);
    const duracao = 0.18;
    let t = 0;
    let explodiu = false;
    return dt => {
        t += dt;
        const p = Math.min(1, t / duracao);
        bala.position.lerpVectors(de, para, p);
        bala.position.y += Math.sin(p * Math.PI) * 0.8;
        if (p >= 1 && !explodiu) {
            explodiu = true;
            scene.remove(bala);
            efeitos.push(onda(para, 0xf0a04b, 1.5, 0.35)); // 1.5 = raio da explosão no Canhao
        }
        return !explodiu;
    };
}

function poeira(pos, tamanho) {
    const pedacos = [];
    for (let k = 0; k < 7; k++) {
        const p = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), material(0xcbbfa8));
        p.position.set(pos.x, 0.4, pos.z);
        const ang = (k / 7) * Math.PI * 2;
        p.userData.v = new THREE.Vector3(Math.cos(ang) * tamanho * 2, 2.5, Math.sin(ang) * tamanho * 2);
        scene.add(p);
        pedacos.push(p);
    }
    let t = 0;
    return dt => {
        t += dt;
        for (const p of pedacos) {
            p.userData.v.y -= 9 * dt;
            p.position.addScaledVector(p.userData.v, dt);
            p.scale.setScalar(Math.max(0.01, 1 - t / 0.5));
        }
        if (t >= 0.5) { pedacos.forEach(p => scene.remove(p)); return false; }
        return true;
    };
}

function golpeNaBase() {
    const original = base.corpo.material.color.getHex();
    let t = 0;
    base.corpo.material.color.setHex(0xd2452f);
    return dt => {
        t += dt;
        base.grupo.position.y = Math.sin(t * 60) * 0.05 * (1 - t / 0.4);
        if (t >= 0.4) {
            base.corpo.material.color.setHex(original);
            base.grupo.position.y = 0;
            return false;
        }
        return true;
    };
}

function disparos(estado) {
    for (const t of estado.torres) {
        if (!t.tiro) continue;
        const de = bocaDaTorre(t.id);
        const para = new THREE.Vector3(t.tiro.x, 0.45, t.tiro.z);
        const passo = TICK_MS / velocidade / 1000;
        if (t.tipo === 'CANHAO') {
            efeitos.push(balaDeCanhao(de, para));
        } else if (t.tipo === 'GELO') {
            efeitos.push(feixe(de, para, 0xbfe6ff, 0.07, 0.15));
            efeitos.push(onda(para, 0x9fd4f5, 0.6, 0.25));
        } else {
            efeitos.push(feixe(de, para, 0xc58cf2, 0.05, Math.max(0.06, passo * 0.9)));
        }
    }
}

// ---------------------------------------------------------------- estado vindo da API

let atual = null;
let instanteDoTick = performance.now();
let tabuleiroPronto = false;

function aplicar(estado, contaComoTick = true) {
    if (!tabuleiroPronto) {
        estado.torres.forEach(criarTorre);
        montarTabuleiro(estado.caminho);
        montarPainelDeTorres(estado.torres);
        tabuleiroPronto = true;
    }

    for (const t of estado.torres) {
        const obj = torresNaCena.get(t.id);
        if (obj && t.tiro) obj.cabeca.rotation.y = -t.angulo;
    }

    const vistos = new Set();
    for (const i of estado.inimigos) {
        vistos.add(i.id);
        let obj = inimigosNaCena.get(i.id);
        if (!obj) {
            obj = criarInimigo(i);
            inimigosNaCena.set(i.id, obj);
        }
        atualizarInimigo(obj, i);
    }
    for (const [id, obj] of [...inimigosNaCena]) {
        if (!vistos.has(id)) removerInimigo(id, obj);
    }

    if (contaComoTick) {
        disparos(estado);
        instanteDoTick = performance.now();
    }
    atual = estado;
    atualizarPlacar(estado);
}

function atualizarPlacar(e) {
    const vidas = document.getElementById('vidas');
    vidas.textContent = e.vidas;
    vidas.classList.toggle('alerta', e.vidas <= 5);
    document.getElementById('abatidos').textContent = e.abatidos;
    document.getElementById('onda').textContent = `${e.onda}/${e.totalOndas}`;
    document.getElementById('tick').textContent = e.tick;
    for (const t of e.torres) {
        const select = document.querySelector(`select[data-torre="${t.id}"]`);
        if (select && document.activeElement !== select) select.value = t.prioridade;
    }
}

function montarPainelDeTorres(torres) {
    const painel = document.getElementById('torres');
    for (const t of torres) {
        const cartao = document.createElement('div');
        cartao.className = 'torre-cartao';
        const cor = '#' + CORES_TORRE[t.tipo].toString(16).padStart(6, '0');
        const opcoes = REGRAS.map(([valor, texto]) => `<option value="${valor}">${texto}</option>`).join('');
        cartao.innerHTML = `
            <div class="nome"><span class="bolinha" style="background:${cor}"></span>${t.id} · ${NOMES_TORRE[t.tipo] ?? t.tipo}</div>
            <label for="regra-${t.id}">Regra de alvo</label>
            <select id="regra-${t.id}" data-torre="${t.id}">${opcoes}</select>`;
        const select = cartao.querySelector('select');
        select.value = t.prioridade;
        select.addEventListener('change', async () => {
            try {
                aplicar(await chamar('PUT', `/api/partida/torres/${t.id}/prioridade`, { prioridade: select.value }), false);
            } catch (e) { mostrarErro(); }
        });
        const anel = () => torresNaCena.get(t.id).anel.material;
        cartao.addEventListener('mouseenter', () => { anel().opacity = 0.8; });
        cartao.addEventListener('mouseleave', () => { anel().opacity = 0.35; });
        painel.appendChild(cartao);
    }
}

async function chamar(metodo, url, corpo) {
    const resposta = await fetch(url, {
        method: metodo,
        headers: corpo ? { 'Content-Type': 'application/json' } : {},
        body: corpo ? JSON.stringify(corpo) : undefined,
    });
    if (!resposta.ok) throw new Error(`${resposta.status}`);
    document.getElementById('erro').classList.add('escondido');
    return resposta.json();
}

function mostrarErro() {
    document.getElementById('erro').classList.remove('escondido');
    pausar();
}

// ---------------------------------------------------------------- controles

let rodando = false;
let velocidade = 1;
let ocupado = false;
const btnJogar = document.getElementById('btnJogar');

function pausar() {
    rodando = false;
    btnJogar.textContent = atual && atual.tick > 0 ? 'Continuar' : 'Começar';
}

btnJogar.addEventListener('click', () => {
    if (atual?.terminou) return;
    if (rodando) { pausar(); return; }
    rodando = true;
    btnJogar.textContent = 'Pausar';
});

document.querySelectorAll('.velocidades button').forEach(b => {
    b.addEventListener('click', () => {
        velocidade = Number(b.dataset.vel);
        document.querySelectorAll('.velocidades button').forEach(x => x.classList.toggle('ativo', x === b));
    });
});

async function reiniciar() {
    try {
        const estado = await chamar('POST', '/api/partida/reiniciar');
        for (const [id, obj] of [...inimigosNaCena]) { scene.remove(obj.grupo); inimigosNaCena.delete(id); }
        document.getElementById('fim').classList.add('escondido');
        aplicar(estado, false);
        pausar();
    } catch (e) { mostrarErro(); }
}
document.getElementById('btnReiniciar').addEventListener('click', reiniciar);
document.getElementById('btnDeNovo').addEventListener('click', reiniciar);

function mostrarFim(e) {
    const regras = e.torres
        .map(t => `${NOMES_TORRE[t.tipo] ?? t.tipo}: ${REGRAS.find(r => r[0] === t.prioridade)?.[1] ?? t.prioridade}`)
        .join('<br>');
    document.getElementById('fimTitulo').textContent = e.vidas > 0 ? 'A base resistiu' : 'A base caiu';
    document.getElementById('fimTexto').innerHTML =
        `<strong>${e.vidas}</strong> vidas · <strong>${e.abatidos}</strong> abatidos · tick <strong>${e.tick}</strong>` +
        `<br><span style="font-size:14px">${regras}</span>`;
    document.getElementById('fim').classList.remove('escondido');
}

async function passo() {
    if (!rodando || ocupado) return;
    ocupado = true;
    try {
        const estado = await chamar('POST', '/api/partida/avancar');
        aplicar(estado);
        if (estado.terminou) {
            rodando = false;
            btnJogar.textContent = 'Começar';
            setTimeout(() => mostrarFim(estado), 600);
        }
    } catch (e) {
        mostrarErro();
    } finally {
        ocupado = false;
    }
}

function agendar() {
    setTimeout(async () => { await passo(); agendar(); }, TICK_MS / velocidade);
}

// ---------------------------------------------------------------- laço de desenho

let ultimoQuadro = performance.now();
const projecao = new THREE.Vector3();

function desenhar() {
    requestAnimationFrame(desenhar);
    const agora = performance.now();
    const dt = Math.min((agora - ultimoQuadro) / 1000, 0.1);
    ultimoQuadro = agora;

    const alfa = Math.min(1, (performance.now() - instanteDoTick) / (TICK_MS / velocidade));
    for (const obj of inimigosNaCena.values()) {
        obj.grupo.position.x = obj.de.x + (obj.para.x - obj.de.x) * alfa;
        obj.grupo.position.z = obj.de.z + (obj.para.z - obj.de.z) * alfa;
        if (obj.tipo === 'BATEDOR') obj.corpo.position.y = Math.abs(Math.sin(performance.now() / 90)) * 0.08;
        obj.barra.quaternion.copy(camera.quaternion);
    }

    for (let k = efeitos.length - 1; k >= 0; k--) {
        if (!efeitos[k](dt)) efeitos.splice(k, 1);
    }

    for (const t of torresNaCena.values()) {
        if (t.grupo.userData.cristal) t.grupo.userData.cristal.rotation.y += dt * 0.8;
        projecao.set(t.grupo.position.x, 0, t.grupo.position.z + 0.9).project(camera);
        t.rotulo.style.left = `${(projecao.x + 1) / 2 * window.innerWidth}px`;
        t.rotulo.style.top = `${(1 - projecao.y) / 2 * window.innerHeight}px`;
    }

    controls.update();
    renderer.render(scene, camera);
}

// ---------------------------------------------------------------- início

chamar('GET', '/api/partida')
    .then(estado => aplicar(estado, false))
    .catch(mostrarErro);
agendar();
desenhar();
