package service;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import sepdrive.gruppen.backend.entity.User;
import sepdrive.gruppen.backend.entity.Wallet;
import sepdrive.gruppen.backend.entity.WalletTransaction;
import sepdrive.gruppen.backend.exception.InvalidCredentialsException;
import sepdrive.gruppen.backend.repository.UserRepository;
import sepdrive.gruppen.backend.repository.WalletRepository;
import sepdrive.gruppen.backend.repository.WalletTransactionRepository;
import sepdrive.gruppen.backend.service.WalletService;

import java.util.Optional;

@ExtendWith(MockitoExtension.class)
public class WalletServiceTest {

        @Mock
        private WalletRepository walletRepository;
        @Mock
        private UserRepository userRepository;
        @Mock
        private WalletTransactionRepository walletTransactionRepository;
        @InjectMocks
        private WalletService walletService;

        private User user;

        @BeforeEach
        void setUp() {
            user = new User();
            user.setUsername("nevzat");
            user.setId(1L);
        }

        @Test
        public void doDeposit_validAmount_updatesWalletAndCreatesTransaction() {
            Wallet wallet = new Wallet(1L, user, 10.0);

            Mockito.when(userRepository.findByUsername("nevzat")).thenReturn(Optional.of(user));
            Mockito.when(walletRepository.findByUser(user)).thenReturn(Optional.of(wallet));

            String result = walletService.doDeposit("nevzat", 20.0);

            Assertions.assertEquals("Deposit successful. ", result);
            Assertions.assertEquals(30.0, wallet.getBalance());

            Mockito.verify(walletTransactionRepository).save(Mockito.any(WalletTransaction.class));
        }

        @Test
        public void transfer_validTransfer_worksCorrectly() {
            User receiver = new User();
            receiver.setUsername("abdul");

            Wallet senderWallet = new Wallet(1L, user, 50.0);
            Wallet receiverWallet = new Wallet(2L, receiver, 10.0);

            Mockito.when(userRepository.findByUsername("nevzat")).thenReturn(Optional.of(user));
            Mockito.when(userRepository.findByUsername("abdul")).thenReturn(Optional.of(receiver));
            Mockito.when(walletRepository.findByUser(user)).thenReturn(Optional.of(senderWallet));
            Mockito.when(walletRepository.findByUser(receiver)).thenReturn(Optional.of(receiverWallet));

            String result = walletService.transfer("nevzat", "abdul", 15.0);

            Assertions.assertEquals("Transfer successful.", result);
            Assertions.assertEquals(35.0, senderWallet.getBalance());
            Assertions.assertEquals(25.0, receiverWallet.getBalance());

            Mockito.verify(walletTransactionRepository).save(Mockito.any(WalletTransaction.class));
        }

    @Test
    public void transfer_InsufficientFunds_throwsException() {

        User receiver = new User();
        receiver.setUsername("abdul");

        Wallet senderWallet = new Wallet(1L, user, 5.0);
        Wallet receiverWallet = new Wallet(2L, receiver, 0.0);

        Mockito.when(userRepository.findByUsername("nevzat")).thenReturn(Optional.of(user));
        Mockito.when(userRepository.findByUsername("abdul")).thenReturn(Optional.of(receiver));
        Mockito.when(walletRepository.findByUser(user)).thenReturn(Optional.of(senderWallet));
        Mockito.when(walletRepository.findByUser(receiver)).thenReturn(Optional.of(receiverWallet));

        InvalidCredentialsException ex = Assertions.assertThrows(
                InvalidCredentialsException.class,
                () -> walletService.transfer("nevzat", "abdul", 10.0)
        );
        Assertions.assertTrue(ex.getMessage().contains("Insufficient funds."));

        Mockito.verify(walletTransactionRepository, Mockito.never())
                .save(Mockito.any(WalletTransaction.class));
    }

    @Test
    public void doDeposit_walletNotFound_throwsException() {

        Mockito.when(userRepository.findByUsername("kerem"))
                .thenReturn(Optional.of(user));
        Mockito.when(walletRepository.findByUser(user))
                .thenReturn(Optional.empty());

        InvalidCredentialsException ex = Assertions.assertThrows(
                InvalidCredentialsException.class,
                () -> walletService.doDeposit("kerem", 50.0)
        );
        Assertions.assertTrue(ex.getMessage().contains("Wallet not found for user"));

        Mockito.verify(walletTransactionRepository, Mockito.never())
                .save(Mockito.any(WalletTransaction.class));
    }
}


