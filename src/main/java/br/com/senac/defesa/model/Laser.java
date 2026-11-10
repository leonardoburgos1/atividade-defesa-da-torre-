package br.com.senac.defesa.model;

import java.util.List;

public class Laser extends Torre {

    public Laser(int id, Ponto posicao) {
        super(id, posicao, 5.0);
    }

    @Override
    protected void disparar(Inimigo alvo, List<Inimigo> inimigos) {
        alvo.receberDano(2);
    }

    @Override
    protected int tempoDeRecarga() {
        return 0;
    }

    @Override
    public String getTipo() {
        return "LASER";
    }
}
