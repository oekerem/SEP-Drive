package sepdrive.gruppen.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sepdrive.gruppen.backend.entity.User;
import sepdrive.gruppen.backend.entity.Wallet;

import java.util.Optional;

public interface WalletRepository extends JpaRepository<Wallet, Long> {
    Optional<Wallet> findByUser(User user);
    Optional<Wallet> findByUserUsername(String username);
}
