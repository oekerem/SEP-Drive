package sepdrive.gruppen.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sepdrive.gruppen.backend.entity.Drive;
import sepdrive.gruppen.backend.entity.DriveOffer;
import sepdrive.gruppen.backend.entity.DriveOfferStatus;
import sepdrive.gruppen.backend.entity.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface DriveOfferRepository extends JpaRepository<DriveOffer, Long> {
    Optional<DriveOffer> findByDriveAndFahrer(Drive drive, User fahrer);
    List<DriveOffer> findByDrive(Drive drive);
    Optional<DriveOffer> findDriveOfferById(long id);
    Optional<DriveOffer> findDriveOfferByFahrer_UsernameAndStatus(String fahrerUsername, DriveOfferStatus status);
    Optional<DriveOffer> findDriveOfferByFahrer_Username(String fahrerUsername);
}
