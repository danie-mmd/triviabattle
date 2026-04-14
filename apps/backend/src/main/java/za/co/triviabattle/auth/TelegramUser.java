package za.co.triviabattle.auth;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TelegramUser {
    private long id;
    private String firstName;
    private String lastName;
    private String username;
    private String photoUrl;
    private String languageCode;
    private boolean isPremium;
}
