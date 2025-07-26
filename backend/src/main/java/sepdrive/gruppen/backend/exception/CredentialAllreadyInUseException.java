package sepdrive.gruppen.backend.exception;

public class CredentialAllreadyInUseException extends RuntimeException {
    public CredentialAllreadyInUseException(String message) {
        super(message);
    }
}
