package io.tbd.tbdex.messages.types;

import io.tbd.tbdex.messages.core.MessageBody;
import io.tbd.tbdex.messages.core.MessageType;

public class Ask extends MessageBody {
    public String sourceCurrency;
    public int sourceAmount;
    public String targetCurrency;

    public Ask(String sourceCurrency, int sourceAmount, String targetCurrency) {
        super(MessageType.Ask);

        this.sourceCurrency = sourceCurrency;
        this.sourceAmount = sourceAmount;
        this.targetCurrency = targetCurrency;
    }
}
