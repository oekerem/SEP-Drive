package sepdrive.gruppen.backend.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sepdrive.gruppen.backend.dto.DepositRequest;
import sepdrive.gruppen.backend.dto.TransferRequest;
import sepdrive.gruppen.backend.service.WalletService;

import java.util.List;


@RestController
@RequestMapping("/api/wallet")
@CrossOrigin(origins = "http://localhost:3000")
public class WalletController {

    @Autowired
    private WalletService walletService;

    @GetMapping("/{username}")
    public ResponseEntity<Double> getBalance(@PathVariable String username) {
        return ResponseEntity.ok(walletService.getBalance(username));
    }

    @PostMapping("/{username}/deposit")
    public ResponseEntity<String> deposit(@PathVariable String username,
                                          @RequestBody @Valid DepositRequest request) {
        String message = walletService.doDeposit(username, request.getAmount());
        return ResponseEntity.ok(message);
    }

    @PostMapping("/transfer")
    public ResponseEntity<String> transfer(@RequestBody @Valid TransferRequest request) {
        String message = walletService.transfer(request.getSenderUsername(), request.getReceiverUsername(), request.getAmount());
        return ResponseEntity.ok(message);
    }


}
