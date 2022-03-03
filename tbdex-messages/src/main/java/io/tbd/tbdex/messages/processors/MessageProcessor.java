package io.tbd.tbdex.messages.processors;

import io.tbd.tbdex.messages.core.Message;

public interface MessageProcessor {
     Message process(Message message);
}
