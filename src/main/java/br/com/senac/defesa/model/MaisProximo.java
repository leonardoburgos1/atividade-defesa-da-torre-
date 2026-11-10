package br.com.senac.defesa.model;

import java.util.List;

public class MaisProximo extends RegraDeAlvo {

    @Override
    public Inimigo escolher(List<Inimigo> candidatos, Ponto posicaoTorre) {
        Inimigo escolhido = null;
        double menorDistancia = Double.MAX_VALUE;

        for (Inimigo inimigo : candidatos) {
            double distancia = posicaoTorre.distanciaAte(inimigo.getPosicao());
            if (distancia < menorDistancia) {
                menorDistancia = distancia;
                escolhido = inimigo;
            }
        }
        return escolhido;
    }

    @Override
    public String getNome() {
        return "PROXIMO";
    }
}
