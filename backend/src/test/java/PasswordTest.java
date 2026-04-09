import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordTest {

    @Test
    void testPassword() {
        var encoder = new BCryptPasswordEncoder();
        String hash = "DAN_HASH_TRONG_DB_VAO_DAY";
        System.out.println(encoder.matches("123456", hash));
    }
}