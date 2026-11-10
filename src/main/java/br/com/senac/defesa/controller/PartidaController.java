package br.com.senac.defesa.controller;

import br.com.senac.defesa.dto.EstadoPartida;
import br.com.senac.defesa.service.PartidaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Você não precisa mexer nesta classe.
@RestController
@RequestMapping("/api/partida")
public class PartidaController {

    private final PartidaService service;

    public PartidaController(PartidaService service) {
        this.service = service;
    }

    @GetMapping
    public EstadoPartida estado() {
        return service.estado();
    }

    @PostMapping("/avancar")
    public EstadoPartida avancar() {
        return service.avancar();
    }

    @PostMapping("/reiniciar")
    public EstadoPartida reiniciar() {
        return service.reiniciar();
    }

    @PutMapping("/torres/{id}/prioridade")
    public EstadoPartida mudarPrioridade(@PathVariable int id, @RequestBody MudancaDePrioridade corpo) {
        return service.mudarPrioridade(id, corpo.prioridade());
    }

    public record MudancaDePrioridade(String prioridade) {
    }
}
