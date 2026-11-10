package br.com.senac.defesa.dto;

import br.com.senac.defesa.model.Ponto;

import java.util.List;

public record EstadoPartida(
        int tick,
        int vidas,
        int abatidos,
        int onda,
        int totalOndas,
        boolean terminou,
        List<Ponto> caminho,
        List<TorreView> torres,
        List<InimigoView> inimigos) {

    public record TorreView(int id, String tipo, String prioridade, double x, double z,
                            double alcance, double angulo, Ponto tiro) {
    }

    public record InimigoView(int id, String tipo, double x, double z,
                              int vida, int vidaMaxima, boolean lento) {
    }
}
