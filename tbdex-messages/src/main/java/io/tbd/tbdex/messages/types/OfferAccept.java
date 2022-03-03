package io.tbd.tbdex.messages.types;

import io.tbd.tbdex.messages.core.MessageBody;
import io.tbd.tbdex.messages.core.MessageType;

public class OfferAccept extends MessageBody {
    public OfferAccept() {
        super(MessageType.OfferAccept);
    }
}
