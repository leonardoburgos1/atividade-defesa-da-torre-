package br.com.senac.defesa.model;

import java.util.List;

/**
 * Trilha por onde os inimigos andam, do portão até a base.
 * A posição de um inimigo é a distância que ele já percorreu na trilha.
 */
public class Caminho {

    private final List<Ponto> pontos;
    private final double comprimento;

    public Caminho(List<Ponto> pontos) {
        this.pontos = List.copyOf(pontos);
        double total = 0;
        for (int i = 1; i < pontos.size(); i++) {
            total += pontos.get(i - 1).distanciaAte(pontos.get(i));
        }
        this.comprimento = total;
    }

    public Ponto pontoEm(double distancia) {
        double restante = distancia;
        for (int i = 1; i < pontos.size(); i++) {
            Ponto a = pontos.get(i - 1);
            Ponto b = pontos.get(i);
            double trecho = a.distanciaAte(b);
            if (restante <= trecho) {
                double t = restante / trecho;
                return new Ponto(a.x() + (b.x() - a.x()) * t, a.z() + (b.z() - a.z()) * t);
            }
            restante -= trecho;
        }
        return pontos.get(pontos.size() - 1);
    }

    public double getComprimento() {
        return comprimento;
    }

    public List<Ponto> getPontos() {
        return pontos;
    }
}
