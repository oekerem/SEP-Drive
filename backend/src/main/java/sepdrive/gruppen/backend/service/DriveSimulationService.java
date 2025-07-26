package sepdrive.gruppen.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import sepdrive.gruppen.backend.entity.Drive;
import sepdrive.gruppen.backend.entity.DriveStatus;
import sepdrive.gruppen.backend.entity.Point;
import sepdrive.gruppen.backend.repository.DriveRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class DriveSimulationService {

    private final DriveRepository driveRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ConcurrentHashMap<Long, DriveSimulationState> simulationStates = new ConcurrentHashMap<>();

    @Autowired
    public DriveSimulationService(DriveRepository driveRepository,
                                  SimpMessagingTemplate messagingTemplate) {
        this.driveRepository = driveRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Async
    public void simulateDrive(Long driveId) {
        Drive drive = driveRepository.findById(driveId)
                .orElseThrow(() -> new IllegalArgumentException("Drive not found with ID: " + driveId));

        if (drive.getDriveStatus() != DriveStatus.ACTIVE) {
            throw new IllegalStateException("Drive is not active.");
        }

        drive.setDriveStatus(DriveStatus.IN_PROGRESS);
        driveRepository.save(drive);

        List<Point> route = drive.getRoute();
        String kundeUsername = drive.getUserKunde().getUsername();
        String fahrerUsername = drive.getUserFahrer().getUsername();

        // SimulationState anlegen, wenn noch nicht vorhanden, abstrakt und private in dieser Klasse
        simulationStates.putIfAbsent(driveId, new DriveSimulationState());
        DriveSimulationState state = simulationStates.get(driveId);

        while (state.getIndex() < route.size()) {
            if (state.isPaused()) {
                try {
                    Thread.sleep(200);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return;
                }
                continue;
            }

            Point currentPoint = route.get(state.getIndex());
            messagingTemplate.convertAndSend("/topic/drive/progress/" + kundeUsername, currentPoint);
            messagingTemplate.convertAndSend("/topic/drive/progress/" + fahrerUsername, currentPoint);
            state.increment();

            try {
                Thread.sleep(state.getDelay());
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return;
            }
        }

        drive.setDriveStatus(DriveStatus.COMPLETED);
        driveRepository.save(drive);

        messagingTemplate.convertAndSend("/topic/drive/complete/" + kundeUsername, "Fahrt abgeschlossen");
        messagingTemplate.convertAndSend("/topic/drive/complete/" + fahrerUsername, "Fahrt abgeschlossen");

        simulationStates.remove(driveId);
    }

    public void pauseDrive(Long driveId) {
        DriveSimulationState state = simulationStates.get(driveId);
        if (state != null) {
            state.pause();
        }
    }

    public void resumeDrive(Long driveId) {
        DriveSimulationState state = simulationStates.get(driveId);
        if (state != null) {
            state.resume();
        }
    }

    public void updateDelay(Long driveId, long millis) {
        DriveSimulationState state = simulationStates.get(driveId);
        if (state != null) {
            state.setDelay(millis);
        }
    }

    private static class DriveSimulationState {
        AtomicInteger currentIndex = new AtomicInteger(0);
        AtomicBoolean paused = new AtomicBoolean(false);
        volatile long delayMillis = 1000;

        int getIndex() {
            return currentIndex.get();
        }
        void increment() {
            currentIndex.incrementAndGet();
        }
        boolean isPaused() {
            return paused.get();
        }
        void pause() {
            paused.set(true);
        }
        void resume() {
            paused.set(false);
        }
        void setDelay(long millis) {
            this.delayMillis = millis;
        }
        long getDelay() {
            return delayMillis;
        }
    }
}