package io.tbd.tbdex.messages.core;

import com.google.gson.*;

// TODO: add custom message deserializer so that appropriate type for body can be set
public class JsonParser {
    private static final Gson gson = new GsonBuilder()
            .disableHtmlEscaping()
            .create();

    public static Gson getParser() {
        return gson;
    }
}
