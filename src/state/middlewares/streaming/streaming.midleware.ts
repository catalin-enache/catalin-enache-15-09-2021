import { createAction, Middleware } from "@reduxjs/toolkit";
import {
  StreamingBaseEvent,
  StreamingCloseEvent,
  StreamingMessageEvent,
  StreamingOpenEvent,
  SubscriptionEvent,
  SubscriptionPayload,
} from "./types";

export const actionStreamingConnectionPending =
  createAction<StreamingBaseEvent>("streaming/connection-pending");
export const actionStreamingOpened =
  createAction<StreamingOpenEvent>("streaming/opened");
export const actionStreamingDisconnected = createAction<StreamingCloseEvent>(
  "streaming/disconnected"
);
export const actionStreamingDisconnectedUnclean =
  createAction<StreamingCloseEvent>("streaming/disconnected-unclean");
export const actionStreamingMessage =
  createAction<StreamingMessageEvent>("streaming/message");

const webSockets: Record<string, WebSocket> = {};
const buffers: Record<
  string,
  { setIntervalId: ReturnType<typeof setInterval> }
> = {};

export type EventAggregatorCallback = (
  id: string,
  evt: MessageEvent
) => boolean;
export type RetrieveAggregationCallback = (id: string) => object;

export const streamingMiddleware =
  (
    bufferSize,
    aggregateEventCb: EventAggregatorCallback,
    getAggregatedDataCb: RetrieveAggregationCallback
  ): Middleware =>
  (storeApi) =>
  (next) =>
  (action) => {
    let theBufferSize =
      +(window.streamingMiddlewareBufferSize ?? bufferSize) || 0;

    if (
      [null, undefined].includes(action.payload) ||
      typeof action.payload !== "object"
    ) {
      return next(action);
    }

    const { subscription, ...rest } = action.payload as SubscriptionPayload;

    if (!subscription) {
      return next(action);
    }

    if (subscription.event === SubscriptionEvent.CONNECT) {
      if (webSockets[subscription.link]) {
        throw new Error(`Already having a connection for ${subscription.link}`);
      }

      next(
        actionStreamingConnectionPending({
          link: subscription.link,
        })
      );

      webSockets[subscription.link] = new WebSocket(subscription.link);

      webSockets[subscription.link].addEventListener("open", (event) => {
        buffers[subscription.link] &&
          clearInterval(buffers[subscription.link].setIntervalId);
        if (theBufferSize) {
          buffers[subscription.link] = {
            setIntervalId: setInterval(() => {
              if (webSockets[subscription.link]) {
                const aggregatedMessage = getAggregatedDataCb(
                  subscription.link
                );
                aggregatedMessage &&
                  next(
                    actionStreamingMessage({
                      link: subscription.link,
                      // not sending the event since this is an aggregation of events
                      message: aggregatedMessage,
                    })
                  );
              }
            }, theBufferSize * 1000),
          };
        }

        next(
          actionStreamingOpened({
            link: subscription.link,
            event,
          })
        );
      });

      webSockets[subscription.link].addEventListener("close", (closeEvent) => {
        buffers[subscription.link] &&
          clearInterval(buffers[subscription.link].setIntervalId);
        if (
          !webSockets[subscription.link] ||
          webSockets[subscription.link] !== closeEvent.currentTarget
        ) {
          return;
        }

        const payload = {
          link: subscription.link,
          wasClean: closeEvent.wasClean,
        };

        if (closeEvent.wasClean) {
          next(actionStreamingDisconnected(payload));
        } else {
          next(actionStreamingDisconnectedUnclean(payload));
        }
        delete webSockets[subscription.link];
      });

      webSockets[subscription.link].addEventListener(
        "message",
        (messageEvent) => {
          if (!theBufferSize) {
            // normal unbuffered flow
            webSockets[subscription.link] &&
              next(
                actionStreamingMessage({
                  link: subscription.link,
                  event: messageEvent,
                  message: messageEvent.data && JSON.parse(messageEvent.data),
                })
              );
          } else {
            const processed = aggregateEventCb(subscription.link, messageEvent);
            if (!processed) {
              // if event not processed pass it through (normal unbuffered flow)
              webSockets[subscription.link] &&
                next(
                  actionStreamingMessage({
                    link: subscription.link,
                    event: messageEvent,
                    message: messageEvent.data && JSON.parse(messageEvent.data),
                  })
                );
            }
          }
        }
      );
    }

    if (subscription.event === SubscriptionEvent.DISCONNECT) {
      if (webSockets[subscription.link]) {
        webSockets[subscription.link].close();
      }
      const payload = {
        link: subscription.link,
        wasClean: true,
      };
      delete webSockets[subscription.link];
      next(actionStreamingDisconnected(payload));
    }

    if (subscription.event === SubscriptionEvent.SEND_MESSAGE) {
      if (!webSockets[subscription.link]) {
        throw new Error(
          `There is no connection to send message to for ${subscription.link}`
        );
      }
      webSockets[subscription.link].send(JSON.stringify(rest));
    }

    // allow subscription actions to pass through (echo back),
    // even handling them in reducer might be pointless.
    let result = next(action);
    return result;
  };
