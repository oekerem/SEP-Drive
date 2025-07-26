package sepdrive.gruppen.backend.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sepdrive.gruppen.backend.entity.Drive;
import sepdrive.gruppen.backend.entity.DriveStatus;
import sepdrive.gruppen.backend.entity.User;
import java.util.List;
import java.util.Optional;

@Repository
public interface DriveRepository extends JpaRepository<Drive, Long> {
    Optional<Drive> findByUserKunde_UsernameAndDriveStatus(String username, DriveStatus status);
    int countByUserKundeAndDriveStatus(User user, DriveStatus status);
    int countByUserFahrerAndDriveStatus(User user, DriveStatus status);
    List<Drive> getDriveByDriveStatus(DriveStatus driveStatus);
    Optional<Drive> getDriveById(long id);

    List<Drive> findAllByUserKunde_UsernameAndDriveStatus(String username, DriveStatus status);
    List<Drive> findAllByUserFahrer_UsernameAndDriveStatus(String username, DriveStatus status);

    @Query("SELECT SUM(d.distance) FROM Drive d WHERE d.userFahrer = :userFahrer AND d.driveStatus = :driveStatus")
    Double findSumDistanceByUserFahrerAndDriveStatus(@Param("userFahrer") User userFahrer, @Param("driveStatus") DriveStatus driveStatus);

    @Query("SELECT COUNT(d) FROM Drive d WHERE d.userFahrer = :userFahrer AND d.driveStatus = :driveStatus")
    int findCountByUserFahrerAndDriveStatus(@Param("userFahrer") User userFahrer, @Param("driveStatus") DriveStatus driveStatus);
}
