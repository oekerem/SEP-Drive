package sepdrive.gruppen.backend.service;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import sepdrive.gruppen.backend.entity.User;
import sepdrive.gruppen.backend.entity.Wallet;
import sepdrive.gruppen.backend.entity.WalletTransaction;
import sepdrive.gruppen.backend.exception.InvalidCredentialsException;
import sepdrive.gruppen.backend.repository.UserRepository;
import sepdrive.gruppen.backend.repository.WalletRepository;
import sepdrive.gruppen.backend.repository.WalletTransactionRepository;

import java.time.LocalDateTime;

@Service
public class WalletService {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    @Autowired
    public WalletService(WalletRepository walletRepository, UserRepository userRepository,
                         WalletTransactionRepository transactionRepository) {
        this.walletRepository = walletRepository;
        this.userRepository = userRepository;
        this.walletTransactionRepository = transactionRepository;
    }

    public double getBalance(String username) {
        Wallet wallet = walletRepository.findByUserUsername(username)
                .orElseThrow(() -> new InvalidCredentialsException("Wallet not found for user: " + username));
        return wallet.getBalance();
    }

    public String doDeposit(String username, double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Deposit amount must be positive.");
        }
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new InvalidCredentialsException("User not found: " + username));
        Wallet wallet = walletRepository.findByUser(user)
                .orElseThrow(() -> new InvalidCredentialsException("Wallet not found for user: " + username));
        wallet.setBalance(wallet.getBalance() + amount);
        walletRepository.save(wallet);
        WalletTransaction transaction = new WalletTransaction();
        transaction.setTimestamp(LocalDateTime.now());
        transaction.setAmount(amount);
        transaction.setType("deposit");
        transaction.setSender(null);
        transaction.setReceiver(user);
        walletTransactionRepository.save(transaction);
        return "Deposit successful. ";
    }

    @Transactional
    public String transfer(String senderUsername, String receiverUsername, double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Transfer amount must be positive.");
        }
        if (senderUsername.equals(receiverUsername)) {
            throw new IllegalArgumentException("Cannot transfer to the same user.");
        }

        User senderUser = userRepository.findByUsername(senderUsername)
                .orElseThrow(() -> new InvalidCredentialsException("Sender not found: " + senderUsername));
        User receiverUser = userRepository.findByUsername(receiverUsername)
                .orElseThrow(() -> new InvalidCredentialsException("Receiver not found: " + receiverUsername));
        Wallet senderWallet = walletRepository.findByUser(senderUser)
                .orElseThrow(() -> new InvalidCredentialsException("Sender wallet not found."));
        Wallet receiverWallet = walletRepository.findByUser(receiverUser)
                .orElseThrow(() -> new InvalidCredentialsException("Receiver wallet not found."));
        if (senderWallet.getBalance() < amount) {
            throw new InvalidCredentialsException("Insufficient funds.");
        }
        senderWallet.setBalance(senderWallet.getBalance() - amount);
        receiverWallet.setBalance(receiverWallet.getBalance() + amount);
        walletRepository.save(senderWallet);
        walletRepository.save(receiverWallet);
        WalletTransaction transaction = new WalletTransaction();
        transaction.setTimestamp(LocalDateTime.now());
        transaction.setAmount(amount);
        transaction.setType("payment");
        transaction.setSender(senderUser);
        transaction.setReceiver(receiverUser);
        walletTransactionRepository.save(transaction);
        return "Transfer successful.";
    }

    public void createWalletForUser(User user) {
        if (!walletRepository.findByUser(user).isPresent()) {
            Wallet wallet = new Wallet();
            wallet.setUser(user);
            wallet.setBalance(0.0);
            walletRepository.save(wallet);
        }
    }

}
