import static org.junit.jupiter.api.Assertions.assertEquals;

import io.tbd.tbdex.messages.core.Message;
import io.tbd.tbdex.messages.core.MessageThreadProcessor;
import io.tbd.tbdex.messages.types.Close;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class MessageThreadProcessorTests {

    @Test
    @DisplayName("throws an exception if Ask is not the first message")
    void testAskNotFirstMessageThrowsException() {
        MessageThreadProcessor messageThreadProcessor = new MessageThreadProcessor.Builder().build();

        Message message = new Message.Builder("mid", "thid", "pfi", "alice")
            .build(new Close("but whai?"));

        RuntimeException thrown = Assertions.assertThrows(RuntimeException.class, () -> {
            messageThreadProcessor.addMessage(message);
        });

        Assertions.assertEquals("The first message in a thread can only be an Ask",
                thrown.getMessage());
    }

}
