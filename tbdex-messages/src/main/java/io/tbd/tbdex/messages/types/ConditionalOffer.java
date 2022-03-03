package io.tbd.tbdex.messages.types;

import io.tbd.tbdex.messages.core.MessageBody;
import io.tbd.tbdex.messages.core.MessageType;

public class ConditionalOffer extends MessageBody {
    public ConditionalOffer() {
        super(MessageType.ConditionalOffer);
    }
}
