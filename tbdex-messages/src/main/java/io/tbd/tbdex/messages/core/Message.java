package io.tbd.tbdex.messages.core;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import io.tbd.tbdex.messages.types.Ask;
import io.tbd.tbdex.messages.types.Close;
import io.tbd.tbdex.messages.types.ConditionalOffer;
import io.tbd.tbdex.messages.types.OfferAccept;

import java.lang.reflect.Type;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.TimeUnit;

public class Message {
    private String id;
    private String threadID;
    private MessageType type;
    private String from;
    private String to;
    private String replyTo;
    private Long createdTime;
    private Long expiresTime;
    private MessageBody body;

    private Message() {}

    private Message(String id, String threadID, String from, String to) {
        this.id = id;
        this.threadID = threadID;
        this.from = from;
        this.to = to;
    }

    public String id() {
        return id;
    }

    public String threadID() {
        return threadID;
    }

    public MessageType type() {
        return type;
    }

    public String from() {
        return from;
    }

    public String to() {
        return to;
    }

    public String replyTo() {
        return replyTo;
    }

    public long createdTime() {
        return createdTime;
    }

    public long expiresTime() {
        return expiresTime;
    }

    public MessageBody body() {
        return body;
    }

    /**
     * serializes message as json
     * @return a serialized json object
     */
    @Override
    public String toString() {
        return JsonParser.getParser().toJson(this);
    }

    public static class Builder {
        private final Message message;

        private static final List<String> requiredFields = Arrays.asList(
                "id",
                "threadID",
                "type",
                "from",
                "to",
                "body"
        );

        private static final Map<MessageType, Type> messageTypeClassMap = new HashMap<>();

        static {
            messageTypeClassMap.put(MessageType.Ask, Ask.class);
            messageTypeClassMap.put(MessageType.Close, Close.class);
            messageTypeClassMap.put(MessageType.ConditionalOffer, ConditionalOffer.class);
            messageTypeClassMap.put(MessageType.OfferAccept, OfferAccept.class);
        }

        private Builder() {
            this.message = new Message();
        }

        public Builder(String id, String threadID, String from, String to) {
            this.message = new Message(id, threadID, from, to);
        }

        public Builder createdTime(Instant instant) {
            this.message.createdTime = instant.getEpochSecond();

            return this;
        }

        /**
         * calculates expiresTime based on value of `createdTime`. Sets `createdTime` if it's not set
         * @param duration - the duration respective to timeUnit that this message will expire in
         * @param timeUnit - e.g. TimeUnit.HOURS
         * @return Builder
         */
        public Builder expiresIn(long duration, TimeUnit timeUnit) {
            // TODO: should we do this? or simply use `Instant.now()` without setting createdTime to calc exp.
            if (this.message.createdTime == null) {
                this.message.createdTime = Instant.now().getEpochSecond();
            }

            Instant createdTime = Instant.ofEpochSecond(this.message.createdTime);
            long durationSecs = timeUnit.toSeconds(duration);
            long expiresTime = createdTime.plusSeconds(durationSecs).getEpochSecond();

            if (this.message.createdTime > expiresTime) {
                throw new RuntimeException("cannot expire before creation time");
            }

            return this;
        }

        public Builder replyTo(String replyTo) {
            this.message.replyTo = replyTo;

            return this;
        }

        public Message build(MessageBody body) {
            message.body = body;
            message.type = body.type;

            return message;
        }

        /**
         * deserialize a json stringified message
         * @param serializedMessage - the serialized message
         * @return Deserialized Message
         */
        public static Message fromJson(String serializedMessage) {
            Gson parser = JsonParser.getParser();
            JsonObject json = parser.fromJson(serializedMessage, JsonObject.class);

            return fromJson(json);
        }

        // TODO: find cleaner way to do this or separate into different class
        private static Message fromJson(JsonObject jsonObject) {
            // check to ensure that all required fields exist. Throw exception if any are missing
            for (String field : requiredFields) {
                if (!jsonObject.has(field)) {
                    throw new RuntimeException(field + " is a required field");
                }
            }

            Gson parser = JsonParser.getParser();
            Message message = new Message();

            // add all required fields
            message.id = jsonObject.get("id").getAsString();
            message.threadID = jsonObject.get("threadID").getAsString();
            message.from = jsonObject.get("from").getAsString();
            message.to = jsonObject.get("to").getAsString();

            if (jsonObject.has("createdTime")) {
                message.createdTime = jsonObject.get("createdTime").getAsLong();
            }

            if (jsonObject.has("expiresTime")) {
                message.expiresTime = jsonObject.get("expiresTime").getAsLong();
            }

            if (jsonObject.has("replyTo")) {
                message.replyTo = jsonObject.get("replyTo").getAsString();
            }

            // deserialize MessageType
            message.type = parser.fromJson(jsonObject.get("type"), MessageType.class);

            // deserialize the message body into its concrete type
            JsonElement bodyJson = jsonObject.remove("body");
            Type messageType = messageTypeClassMap.get(message.type());

            message.body = parser.fromJson(bodyJson, messageType);

            return message;
        }
    }
}
