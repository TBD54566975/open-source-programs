package io.tbd.tbdex.messages.core;

public enum MessageType {
    Ask("Ask"),
    Close("Close"),
    ConditionalOffer("ConditionalOffer"),
    OfferAccept("OfferAccept");

    private final String messageType;

    MessageType(String messageType) {
        this.messageType = messageType;
    }

    public String getMessageType() {
        return this.messageType;
    }
}
