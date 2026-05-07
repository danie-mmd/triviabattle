package za.co.triviabattle;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.nio.file.Paths;

@SpringBootApplication
@EnableScheduling
@org.springframework.data.jpa.repository.config.EnableJpaRepositories(basePackages = "za.co.triviabattle")
public class TriviaBattleApplication {
    public static void main(String[] args) {
        try {
            String userDir = System.getProperty("user.dir");
            System.out.println("[Debug] Current Working Directory: " + userDir);

            String[] paths = {"./.env", "../.env", "../../.env", "../../../.env"};
            Dotenv dotenv = null;
            for (String p : paths) {
                java.io.File f = new java.io.File(p);
                System.out.println("[Debug] Checking for .env at: " + f.getAbsolutePath() + " - Exists: " + f.exists());
                if (f.exists()) {
                    System.out.println("[Dotenv] SUCCESS! Found .env at: " + f.getAbsolutePath());
                    dotenv = Dotenv.configure()
                            .directory(f.getParent() != null ? f.getParent() : ".")
                            .ignoreIfMissing()
                            .load();
                    break;
                }
            }

            if (dotenv == null) {
                System.out.println("[Dotenv] No .env file found in searched paths. Falling back to system env.");
                dotenv = Dotenv.configure().ignoreIfMissing().load();
            }

            dotenv.entries().forEach(entry -> {
                String key = entry.getKey();
                String value = entry.getValue();
                if (key.contains("GEMINI") || key.contains("BOT") || key.contains("JWT") || key.contains("TRIVIA")) {
                    System.out.println("[Dotenv] Loading variable: " + key + " (length: " + value.length() + ", ends with: ..." + (value.length() > 4 ? value.substring(value.length() - 4) : "****") + ")");
                }
                System.setProperty(key, value);
            });

            if (System.getProperty("BOT_TOKEN") != null) {
                System.out.println("[Dotenv] Successfully loaded core environment variables");
            }
        } catch (Exception e) {
            System.err.println("[Dotenv] Error loading .env: " + e.getMessage());
        }

        SpringApplication.run(TriviaBattleApplication.class, args);
    }
}
