package br.com.senac.defesa.model;

import java.util.List;

public class MaisAvancado extends RegraDeAlvo {

    @Override
    public Inimigo escolher(List<Inimigo> candidatos, Ponto posicaoTorre) {
        Inimigo escolhido = null;
        double maisAvancado = -1;
        for (Inimigo inimigo : candidatos) {
            if (inimigo.getPercorrido() > maisAvancado) {
                maisAvancado = inimigo.getPercorrido();
                escolhido = inimigo;
            }
        }
        return escolhido;
    }

    @Override
    public String getNome() {
        return "AVANCADO";
    }
}
