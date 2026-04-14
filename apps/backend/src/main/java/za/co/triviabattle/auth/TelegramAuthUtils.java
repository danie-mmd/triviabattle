package za.co.triviabattle.auth;

import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

/**
 * TelegramAuthUtils
 *
 * Validates the initData HMAC signature as per the official Telegram docs:
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 *
 * Algorithm:
 *  1. Parse initData query string, extract all fields except `hash`.
 *  2. Sort fields alphabetically and join as "key=value\n" (no trailing newline).
 *  3. Compute HMAC-SHA256(dataCheckString, HMAC-SHA256("WebAppData", botToken)).
 *  4. Compare with the extracted `hash` field (constant-time).
 */
@Slf4j
@UtilityClass
public class TelegramAuthUtils {

    private static final String HMAC_SHA256 = "HmacSHA256";
    private static final long MAX_AGE_SECONDS = 86_400L; // 24 hours

    /**
     * Validates initData using the bot token.
     *
     * @param initData raw initData string from Telegram.WebApp.initData
     * @param botToken the bot token (never expose this to the frontend)
     * @return true if signature is valid and data is not expired
     */
    public boolean validateInitData(String initData, String botToken) {
        if (initData == null || initData.isBlank() || botToken == null || botToken.isBlank()) {
            log.error("[TelegramAuth] Validation failed: initData or botToken is null/empty (botToken length={})", 
                    botToken != null ? botToken.length() : "null");
            return false;
        }

        try {
            Map<String, String> params = parseQueryString(initData);
            String receivedHash = params.remove("hash");
            if (receivedHash == null) return false;

            // Check freshness
            String authDateStr = params.get("auth_date");
            if (authDateStr != null) {
                long authDate = Long.parseLong(authDateStr);
                long age = (System.currentTimeMillis() / 1000) - authDate;
                if (age > MAX_AGE_SECONDS) {
                    log.warn("[TelegramAuth] initData is expired (age={}s)", age);
                    return false;
                }
            }

            // Build data check string: sorted key=value pairs joined by \n
            String dataCheckString = params.entrySet().stream()
                    .sorted(Map.Entry.comparingByKey())
                    .map(e -> e.getKey() + "=" + e.getValue())
                    .collect(Collectors.joining("\n"));

            log.debug("[TelegramAuth] dataCheckString: \"{}\"", dataCheckString);

            // secret_key = HMAC-SHA256(botToken, "WebAppData")
            byte[] secretKey = hmacSha256(botToken.getBytes(StandardCharsets.UTF_8),
                    "WebAppData".getBytes(StandardCharsets.UTF_8));

            // hash = HMAC-SHA256(dataCheckString, secretKey)
            byte[] computedHash = hmacSha256(dataCheckString.getBytes(StandardCharsets.UTF_8), secretKey);
            String computedHex = bytesToHex(computedHash);

            log.debug("[TelegramAuth] receivedHash: {}, computedHex: {}", receivedHash, computedHex);

            boolean result = constantTimeEquals(computedHex, receivedHash.toLowerCase(Locale.ROOT));
            if (!result) {
                log.warn("[TelegramAuth] Signature mismatch for user data");
            }
            return result;

        } catch (Exception e) {
            log.error("[TelegramAuth] Validation error", e);
            return false;
        }
    }

    /**
     * Parses the user JSON from initDataUnsafe.user into a TelegramUser.
     * NOTE: Only call this AFTER validateInitData() returns true.
     */
    public Optional<TelegramUser> parseUser(String initData) {
        try {
            Map<String, String> params = parseQueryString(initData);
            String userJson = params.get("user");
            if (userJson == null) return Optional.empty();

            // Simple extraction without pulling in an extra JSON library
            // (Jackson is available via Spring; use ObjectMapper in real code)
            long id = extractLong(userJson, "id");
            String firstName = extractString(userJson, "first_name");
            String lastName = extractString(userJson, "last_name");
            String username = extractString(userJson, "username");
            String photoUrl = extractString(userJson, "photo_url");
            String languageCode = extractString(userJson, "language_code");
            boolean isPremium = userJson.contains("\"is_premium\":true");

            return Optional.of(TelegramUser.builder()
                    .id(id)
                    .firstName(firstName)
                    .lastName(lastName)
                    .username(username)
                    .photoUrl(photoUrl)
                    .languageCode(languageCode)
                    .isPremium(isPremium)
                    .build());

        } catch (Exception e) {
            log.error("[TelegramAuth] User parse error", e);
            return Optional.empty();
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Map<String, String> parseQueryString(String query) {
        Map<String, String> result = new LinkedHashMap<>();
        for (String part : query.split("&")) {
            int eq = part.indexOf('=');
            if (eq < 0) continue;
            String key = URLDecoder.decode(part.substring(0, eq), StandardCharsets.UTF_8);
            String value = URLDecoder.decode(part.substring(eq + 1), StandardCharsets.UTF_8);
            result.put(key, value);
        }
        return result;
    }

    private byte[] hmacSha256(byte[] data, byte[] key) throws Exception {
        Mac mac = Mac.getInstance(HMAC_SHA256);
        mac.init(new SecretKeySpec(key, HMAC_SHA256));
        return mac.doFinal(data);
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) sb.append(String.format("%02x", b));
        return sb.toString();
    }

    /** Constant-time string comparison to prevent timing attacks. */
    private boolean constantTimeEquals(String a, String b) {
        if (a.length() != b.length()) return false;
        int diff = 0;
        for (int i = 0; i < a.length(); i++) {
            diff |= a.charAt(i) ^ b.charAt(i);
        }
        return diff == 0;
    }

    private long extractLong(String json, String key) {
        String search = "\"" + key + "\":";
        int idx = json.indexOf(search);
        if (idx < 0) return 0;
        int start = idx + search.length();
        int end = start;
        while (end < json.length() && (Character.isDigit(json.charAt(end)) || json.charAt(end) == '-')) end++;
        return Long.parseLong(json.substring(start, end));
    }

    private String extractString(String json, String key) {
        String search = "\"" + key + "\":\"";
        int idx = json.indexOf(search);
        if (idx < 0) return null;
        int start = idx + search.length();
        int end = json.indexOf('"', start);
        if (end < 0) return null;
        return json.substring(start, end);
    }
}
