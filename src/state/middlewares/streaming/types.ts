export enum SubscriptionEvent {
  CONNECT = "CONNECT",
  DISCONNECT = "DISCONNECT",
  SEND_MESSAGE = "SEND_MESSAGE",
}

export type SubscriptionPayload = {
  subscription: {
    link: string;
    event: SubscriptionEvent;
  };
};

export type StreamingBaseEvent = {
  link: string;
};

export type StreamingCloseEvent = StreamingBaseEvent & {
  wasClean: boolean;
};

export type StreamingMessageEvent = StreamingBaseEvent & {
  event: MessageEvent;
  message: any;
};

export type StreamingOpenEvent = StreamingBaseEvent & {
  event: Event;
};
