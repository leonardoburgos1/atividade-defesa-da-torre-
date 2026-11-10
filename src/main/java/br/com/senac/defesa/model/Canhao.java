package br.com.senac.defesa.model;

import java.util.List;

public class Canhao extends Torre {

    public Canhao(int id, Ponto posicao) {
        super(id, posicao, 4.0);
    }

    @Override
    protected void disparar(Inimigo alvo, List<Inimigo> inimigos) {
        // A bala explode e também acerta quem estiver perto do alvo.
        alvo.receberDano(16);
        for (Inimigo outro : inimigos) {
            if (outro != alvo && outro.estaVivo()
                    && outro.getPosicao().distanciaAte(alvo.getPosicao()) <= 1.5) {
                outro.receberDano(5);
            }
        }
    }

    @Override
    protected int tempoDeRecarga() {
        return 5;
    }

    @Override
    public String getTipo() {
        return "CANHAO";
    }
}
