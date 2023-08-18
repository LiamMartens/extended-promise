import { ExtendedPromiseEventDetails, ExtendedPromiseEvents } from "./extended-promise.js";

export default function isCustomChangedEvent<R>(event: Event): event is CustomEvent<ExtendedPromiseEventDetails<R>[ExtendedPromiseEvents.CHANGED]> {
  return (
    event instanceof CustomEvent
    && event.detail
    && typeof event.detail === 'object'
    && 'status' in event.detail
    && 'previousStatus' in event.detail
    && 'promise' in event.detail
  );
}