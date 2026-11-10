package br.com.senac.defesa.model;

public class Inimigo {

    private final int id;
    private final String tipo;
    private final int vidaMaxima;
    private final double velocidade;
    private final Caminho caminho;

    private int vida;
    private double percorrido;
    private int lentidao;

    public Inimigo(int id, String tipo, Caminho caminho) {
        this.id = id;
        this.tipo = tipo;
        this.caminho = caminho;
        if (tipo.equals("BATEDOR")) {
            vidaMaxima = 45;
            velocidade = 0.30;
        } else if (tipo.equals("BLINDADO")) {
            vidaMaxima = 260;
            velocidade = 0.10;
        } else {
            vidaMaxima = 90;
            velocidade = 0.18;
        }
        this.vida = vidaMaxima;
    }

    public void andar() {
        if (lentidao > 0) {
            percorrido += velocidade / 2;
            lentidao--;
        } else {
            percorrido += velocidade;
        }
    }

    public void receberDano(int dano) {
        vida = Math.max(0, vida - dano);
    }

    public void desacelerar(int ticks) {
        lentidao = Math.max(lentidao, ticks);
    }

    public boolean estaVivo() {
        return vida > 0;
    }

    public boolean chegouNaBase() {
        return percorrido >= caminho.getComprimento();
    }

    public Ponto getPosicao() {
        return caminho.pontoEm(percorrido);
    }

    public int getId() {
        return id;
    }

    public String getTipo() {
        return tipo;
    }

    public int getVida() {
        return vida;
    }

    public int getVidaMaxima() {
        return vidaMaxima;
    }

    public double getPercorrido() {
        return percorrido;
    }

    public boolean estaLento() {
        return lentidao > 0;
    }
}
