package io.tbd.tbdex.messages.types;

import io.tbd.tbdex.messages.core.MessageBody;
import io.tbd.tbdex.messages.core.MessageType;

public class Close extends MessageBody {
    String reason;

    public Close(String reason) {
        super(MessageType.Close);

        this.reason = reason;
    }
}
