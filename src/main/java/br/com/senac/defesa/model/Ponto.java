package br.com.senac.defesa.model;

public record Ponto(double x, double z) {

    public double distanciaAte(Ponto outro) {
        double dx = outro.x - x;
        double dz = outro.z - z;
        return Math.sqrt(dx * dx + dz * dz);
    }
}
