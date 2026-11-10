package br.com.senac.defesa.model;

import java.util.ArrayList;
import java.util.List;

public abstract class Torre {

    private final int id;
    private final Ponto posicao;
    private final double alcance;

    private RegraDeAlvo regraDeAlvo = new MaisProximo();
    private int recarga;
    private double angulo;
    private Ponto tiroAtual;

    public Torre(int id, Ponto posicao, double alcance) {
        this.id = id;
        this.posicao = posicao;
        this.alcance = alcance;
    }

    // Template Method: a ordem das etapas fica igual para todas as torres.
    public final void agir(List<Inimigo> inimigos) {
        tiroAtual = null;

        if (recarga > 0) {
            recarga--;
            return;
        }

        Inimigo alvo = escolherAlvo(inimigos);
        if (alvo == null) {
            return;
        }

        angulo = Math.atan2(alvo.getPosicao().z() - posicao.z(),
                alvo.getPosicao().x() - posicao.x());

        disparar(alvo, inimigos);
        tiroAtual = alvo.getPosicao();
        recarga = tempoDeRecarga();
    }

    protected abstract void disparar(Inimigo alvo, List<Inimigo> inimigos);

    protected abstract int tempoDeRecarga();

    public abstract String getTipo();

    private Inimigo escolherAlvo(List<Inimigo> inimigos) {
        List<Inimigo> candidatos = new ArrayList<>();

        // O filtro de alcance fica aqui, uma única vez.
        for (Inimigo inimigo : inimigos) {
            double distancia = posicao.distanciaAte(inimigo.getPosicao());
            if (inimigo.estaVivo() && distancia <= alcance) {
                candidatos.add(inimigo);
            }
        }

        return regraDeAlvo.escolher(candidatos, posicao);
    }

    public void setRegraDeAlvo(RegraDeAlvo regraDeAlvo) {
        this.regraDeAlvo = regraDeAlvo;
    }

    public String getPrioridade() {
        return regraDeAlvo.getNome();
    }

    public int getId() { return id; }
    public Ponto getPosicao() { return posicao; }
    public double getAlcance() { return alcance; }
    public double getAngulo() { return angulo; }
    public Ponto getTiroAtual() { return tiroAtual; }
}
