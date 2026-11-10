package br.com.senac.defesa.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;

public class Partida {

    private static final int VIDAS_INICIAIS = 20;

    private final Caminho caminho;
    private final List<Torre> torres = new ArrayList<>();
    private final List<Inimigo> inimigos = new ArrayList<>();
    private final List<Chegada> agenda = new ArrayList<>();

    private int tick;
    private int vidas = VIDAS_INICIAIS;
    private int abatidos;
    private int onda;
    private int totalOndas;
    private int proximoId = 1;

    public Partida() {
        caminho = new Caminho(List.of(
                new Ponto(-12, -5),
                new Ponto(4, -5),
                new Ponto(4, 0),
                new Ponto(-6, 0),
                new Ponto(-6, 5),
                new Ponto(11, 5)));

        torres.add(new Canhao(1, new Ponto(-1, -2.5)));
        torres.add(new TorreDeGelo(2, new Ponto(6.5, -2.5)));
        torres.add(new Laser(3, new Ponto(-2, 2.5)));

        montarOndas();
    }

    private void montarOndas() {
        agendarOnda(10, 12, "SOLDADO", "SOLDADO", "SOLDADO", "SOLDADO", "SOLDADO", "SOLDADO");
        agendarOnda(110, 6, "BATEDOR", "BATEDOR", "BATEDOR", "BATEDOR", "BATEDOR", "BATEDOR", "BATEDOR", "BATEDOR");
        agendarOnda(200, 14, "SOLDADO", "BLINDADO", "SOLDADO", "SOLDADO", "BLINDADO", "SOLDADO");
        agendarOnda(320, 5, "BATEDOR", "BATEDOR", "BLINDADO", "BATEDOR", "BATEDOR", "BATEDOR", "BLINDADO", "BATEDOR", "BATEDOR");
        agendarOnda(430, 8, "BLINDADO", "SOLDADO", "BATEDOR", "SOLDADO", "BLINDADO", "BATEDOR", "SOLDADO", "BLINDADO", "BATEDOR", "BATEDOR");
    }

    private void agendarOnda(int tickInicial, int intervalo, String... tipos) {
        totalOndas++;
        for (int i = 0; i < tipos.length; i++) {
            agenda.add(new Chegada(tickInicial + i * intervalo, tipos[i], totalOndas));
        }
    }

    /** Avança a simulação em um passo (um "tick"). */
    public void avancar() {
        if (terminou()) {
            return;
        }
        tick++;

        // 1. novos inimigos entram pelo portão
        for (Chegada chegada : agenda) {
            if (chegada.tick() == tick) {
                inimigos.add(new Inimigo(proximoId++, chegada.tipo(), caminho));
                onda = chegada.onda();
            }
        }

        // 2. inimigos andam; quem chega na base tira uma vida
        Iterator<Inimigo> it = inimigos.iterator();
        while (it.hasNext()) {
            Inimigo inimigo = it.next();
            inimigo.andar();
            if (inimigo.chegouNaBase()) {
                vidas = Math.max(0, vidas - 1);
                it.remove();
            }
        }

        // 3. torres agem
        for (Torre torre : torres) {
            torre.agir(inimigos);
        }

        // 4. remove os abatidos
        it = inimigos.iterator();
        while (it.hasNext()) {
            if (!it.next().estaVivo()) {
                abatidos++;
                it.remove();
            }
        }
    }

    public void mudarPrioridade(int torreId, String prioridade) {
        for (Torre torre : torres) {
            if (torre.getId() == torreId) {
                RegraDeAlvo regra;
                switch (prioridade) {
                    case "PROXIMO":
                        regra = new MaisProximo();
                        break;
                    case "FORTE":
                        regra = new MaisForte();
                        break;
                    case "AVANCADO":
                        regra = new MaisAvancado();
                        break;
                    default:
                        regra = new MaisProximo();
                }
                torre.setRegraDeAlvo(regra);
            }
        }
    }

    public boolean terminou() {
        if (vidas == 0) {
            return true;
        }
        boolean faltaChegar = false;
        for (Chegada chegada : agenda) {
            if (chegada.tick() > tick) {
                faltaChegar = true;
            }
        }
        return !faltaChegar && inimigos.isEmpty();
    }

    public int getTick() {
        return tick;
    }

    public int getVidas() {
        return vidas;
    }

    public int getAbatidos() {
        return abatidos;
    }

    public int getOnda() {
        return onda;
    }

    public int getTotalOndas() {
        return totalOndas;
    }

    public List<Torre> getTorres() {
        return Collections.unmodifiableList(torres);
    }

    public List<Inimigo> getInimigos() {
        return Collections.unmodifiableList(inimigos);
    }

    public Caminho getCaminho() {
        return caminho;
    }

    private record Chegada(int tick, String tipo, int onda) {
    }
}
