package io.tbd.tbdex.messages.core;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

public abstract class MessageBody {
    MessageType type;
    Set<MessageType> validReplyTypes = new HashSet<>();

    public MessageBody(MessageType type) {
        this.type = type;
    }

    /**
     * Adds all the MessageTypes provided to a HashSet. Used to decide whether
     * any subsequent message in a thread is considered to be a valid reply to
     * the {@link MessageType} associated to this message body.
     * @param messageTypes - The Message Types that are considered to be valid replies
     *                       to the {} message type
     */
    public void addValidReplyTypes(MessageType ... messageTypes) {
        validReplyTypes.addAll(List.of(messageTypes));
    }

    /**
     * returns a boolean indicating whether the provided {@link MessageType}
     * @param messageType - the {@link MessageType} to check
     * @return boolean
     */
    public boolean isValidReply(MessageType messageType) {
        return validReplyTypes.contains(messageType);
    }
}
