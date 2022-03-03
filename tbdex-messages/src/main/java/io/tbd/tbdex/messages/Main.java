package io.tbd.tbdex.messages;

import io.tbd.tbdex.messages.core.Message;
import io.tbd.tbdex.messages.core.MessageThreadProcessor;
import io.tbd.tbdex.messages.types.Ask;

import java.time.Instant;

public class Main {
    public static void main(String[] args) {
        MessageThreadProcessor alice = new MessageThreadProcessor.Builder().build();
        MessageThreadProcessor pfi = new MessageThreadProcessor.Builder().build();

        Ask ask = new Ask("USD", 100, "USDC");

        Message message = new Message.Builder("hi", "2u", "whatever","did:ion:123")
                .createdTime(Instant.now())
                .build(ask);

        String serial = message.toString();
        System.out.println(serial);

        message = Message.Builder.fromJson(serial);
        boolean isAsk = message.body() instanceof Ask;
        System.out.println(isAsk);
    }
}
