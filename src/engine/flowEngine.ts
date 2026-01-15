// Flow Engine - Main orchestrator for conversation flows
// Routes messages to appropriate flow based on flowType

import { Conversation, ClientConfiguration, CollectedData } from '../types';
import * as deliveryFlow from './deliveryFlow';
import * as clothingFlow from './clothingFlow';
import { isWithinOperatingHours, getClosedMessage } from './operatingHoursChecker';

export interface FlowEngineResponse {
  response: string;
  newState: string;
  collectedData: CollectedData;
  shouldTransfer: boolean;
  transferReason?: string;
  shouldCreateOrder: boolean;
  shouldCreateReservation?: boolean;
}

/**
 * Main entry point for processing messages through conversation flows
 * @param conversation - Current conversation with state
 * @param message - Customer message text
 * @param config - Client configuration (catalog, messages, etc.)
 * @returns Flow response with bot message and state updates
 */
export const processMessage = (
  conversation: Conversation,
  message: string,
  config: ClientConfiguration
): FlowEngineResponse => {
  const currentState = conversation.currentState;
  const collectedData = conversation.collectedData || {};
  const flowType = conversation.flowType;

  // Check operating hours FIRST - before processing any flow
  if (!isWithinOperatingHours(config)) {
    return {
      response: getClosedMessage(config),
      newState: currentState || 'greeting',
      collectedData,
      shouldTransfer: false,
      shouldCreateOrder: false
    };
  }

  // Determine flow type if not set (first message)
  // For now, default to delivery. Clothing flow will be added in Checkpoint 3
  const activeFlowType = flowType || 'delivery';

  // Route to appropriate flow
  switch (activeFlowType) {
    case 'delivery': {
      const result = deliveryFlow.processDeliveryFlow(
        currentState as deliveryFlow.DeliveryState | null,
        message,
        collectedData,
        config
      );

      return {
        response: result.response,
        newState: result.newState,
        collectedData: result.collectedData,
        shouldTransfer: result.shouldTransfer,
        transferReason: result.transferReason,
        shouldCreateOrder: result.shouldCreateOrder
      };
    }

    case 'clothing': {
      const result = clothingFlow.processClothingFlow(
        currentState as clothingFlow.ClothingState | null,
        message,
        collectedData,
        config
      );

      return {
        response: result.response,
        newState: result.newState,
        collectedData: result.collectedData,
        shouldTransfer: result.shouldTransfer,
        transferReason: result.transferReason,
        shouldCreateOrder: false,
        shouldCreateReservation: result.shouldCreateReservation
      };
    }

    default: {
      // Unknown flow type - transfer to human
      // CRITICAL: Use configurable message (Predictable, Deterministic Responses requirement)
      const systemErrorMsg = config.messages?.systemError || 'Desculpe, ocorreu um erro. Vou te conectar com um atendente.';
      return {
        response: systemErrorMsg,
        newState: 'transferred_to_human',
        collectedData,
        shouldTransfer: true,
        transferReason: `Unknown flow type: ${activeFlowType}`,
        shouldCreateOrder: false
      };
    }
  }
};
