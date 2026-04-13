import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GetHash {

    @Test
    void getHash() {
        String hash = new BCryptPasswordEncoder().encode("123456");
        System.out.println(hash);
    }
}