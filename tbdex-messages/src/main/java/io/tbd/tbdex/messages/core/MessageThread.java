package io.tbd.tbdex.messages.core;

import java.util.LinkedList;

public class MessageThread {
    private LinkedList<Message> messageThread;

    public MessageThread() {
        this.messageThread = new LinkedList<>();
    }

    public MessageThread(Message message) {
        super();

        this.addMessage(message);
    }

    public void addMessage(Message message) {
        this.messageThread.add(message);
    }

    public Message getLastMessage() {
        if (this.messageThread.isEmpty()) {
            return null;
        }

        return this.messageThread.getLast();
    }

    public boolean isEmpty() {
        return this.messageThread.isEmpty();
    }
}
