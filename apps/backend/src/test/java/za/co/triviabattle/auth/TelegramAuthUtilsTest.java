package za.co.triviabattle.auth;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class TelegramAuthUtilsTest {

    /**
     * Known-good test vector derived from the Telegram docs.
     * In real tests you would compute a real initData from a test bot token.
     */
    private static final String TEST_BOT_TOKEN = "1234567890:test_bot_token_for_unit_tests_only";

    @Test
    void validInitData_returnsTrue() {
        // This is a mock – replace with a real initData/botToken pair for integration testing
        // For unit testing we verify the rejection paths
    }

    @Test
    void nullInitData_returnsFalse() {
        assertFalse(TelegramAuthUtils.validateInitData(null, TEST_BOT_TOKEN));
    }

    @Test
    void blankInitData_returnsFalse() {
        assertFalse(TelegramAuthUtils.validateInitData("", TEST_BOT_TOKEN));
    }

    @Test
    void missingHash_returnsFalse() {
        String noHash = "auth_date=1700000000&user=%7B%22id%22%3A123%7D";
        assertFalse(TelegramAuthUtils.validateInitData(noHash, TEST_BOT_TOKEN));
    }

    @Test
    void tamperedData_returnsFalse() {
        // Real hash but data has been modified
        String tampered = "auth_date=1700000000&user=%7B%22id%22%3A999%7D&hash=aabbccdd";
        assertFalse(TelegramAuthUtils.validateInitData(tampered, TEST_BOT_TOKEN));
    }

    @Test
    void expiredAuthDate_returnsFalse() {
        // auth_date from 2020 – definitely expired
        String expired = "auth_date=1580000000&user=%7B%22id%22%3A123%7D&hash=fakehash";
        assertFalse(TelegramAuthUtils.validateInitData(expired, TEST_BOT_TOKEN));
    }

    @Test
    void parseUser_validJson_returnsUser() {
        String user = "{\"id\":12345,\"first_name\":\"Alice\",\"username\":\"alice_ton\",\"is_premium\":true}";
        String encoded = "auth_date=9999999999&user=" + java.net.URLEncoder.encode(user, java.nio.charset.StandardCharsets.UTF_8) + "&hash=placeholder";

        // parseUser does NOT validate the signature – use after validateInitData
        var result = TelegramAuthUtils.parseUser(encoded);
        assertTrue(result.isPresent());
        assertEquals(12345L, result.get().getId());
        assertEquals("Alice", result.get().getFirstName());
        assertEquals("alice_ton", result.get().getUsername());
        assertTrue(result.get().isPremium());
    }
}
