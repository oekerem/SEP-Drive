package sepdrive.gruppen.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sepdrive.gruppen.backend.entity.User;
import sepdrive.gruppen.backend.entity.Wallet;
import sepdrive.gruppen.backend.entity.WalletTransaction;

import java.util.Optional;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {
   // Optional<Wallet> findBySender(User sender);
   // Optional<Wallet> findByReceiver(User receiver);
}
