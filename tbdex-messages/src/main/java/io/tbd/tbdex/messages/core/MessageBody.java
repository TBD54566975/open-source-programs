package io.tbd.tbdex.messages.core;

public abstract class MessageBody {
    MessageType type;

    public MessageBody(MessageType type) {
        this.type = type;
    }
}
