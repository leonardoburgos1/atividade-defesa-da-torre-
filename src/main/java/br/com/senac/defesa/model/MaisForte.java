package br.com.senac.defesa.model;

import java.util.List;

public class MaisForte extends RegraDeAlvo {

    @Override
    public Inimigo escolher(List<Inimigo> candidatos, Ponto posicaoTorre) {
        Inimigo escolhido = null;
        int maiorVida = -1;
        for (Inimigo inimigo : candidatos) {
            if (inimigo.getVida() > maiorVida) {
                maiorVida = inimigo.getVida();
                escolhido = inimigo;
            }
        }
        return escolhido;
    }

    @Override
    public String getNome() {
        return "FORTE";
    }
}
