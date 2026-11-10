package br.com.senac.defesa.service;

import br.com.senac.defesa.dto.EstadoPartida;
import br.com.senac.defesa.dto.EstadoPartida.InimigoView;
import br.com.senac.defesa.dto.EstadoPartida.TorreView;
import br.com.senac.defesa.model.Inimigo;
import br.com.senac.defesa.model.Partida;
import br.com.senac.defesa.model.Torre;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

// Você não precisa mexer nesta classe.
@Service
public class PartidaService {

    private Partida partida = new Partida();

    public synchronized EstadoPartida estado() {
        List<TorreView> torres = new ArrayList<>();
        for (Torre torre : partida.getTorres()) {
            torres.add(new TorreView(
                    torre.getId(),
                    torre.getTipo(),
                    torre.getPrioridade(),
                    torre.getPosicao().x(),
                    torre.getPosicao().z(),
                    torre.getAlcance(),
                    torre.getAngulo(),
                    torre.getTiroAtual()));
        }

        List<InimigoView> inimigos = new ArrayList<>();
        for (Inimigo inimigo : partida.getInimigos()) {
            inimigos.add(new InimigoView(
                    inimigo.getId(),
                    inimigo.getTipo(),
                    inimigo.getPosicao().x(),
                    inimigo.getPosicao().z(),
                    inimigo.getVida(),
                    inimigo.getVidaMaxima(),
                    inimigo.estaLento()));
        }

        return new EstadoPartida(
                partida.getTick(),
                partida.getVidas(),
                partida.getAbatidos(),
                partida.getOnda(),
                partida.getTotalOndas(),
                partida.terminou(),
                partida.getCaminho().getPontos(),
                torres,
                inimigos);
    }

    public synchronized EstadoPartida avancar() {
        partida.avancar();
        return estado();
    }

    public synchronized EstadoPartida mudarPrioridade(int torreId, String prioridade) {
        partida.mudarPrioridade(torreId, prioridade);
        return estado();
    }

    public synchronized EstadoPartida reiniciar() {
        // as regras escolhidas continuam valendo na nova partida
        List<Torre> antigas = partida.getTorres();
        partida = new Partida();
        for (Torre torre : antigas) {
            partida.mudarPrioridade(torre.getId(), torre.getPrioridade());
        }
        return estado();
    }
}
