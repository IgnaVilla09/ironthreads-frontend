export type HealthResponse = {
  ok: boolean;
};

export type StoreIntegration = {
  id: string;
  storeId: string;
  accessToken: string;
  scope: string | null;
  status: string;
  installedAt: string;
  uninstalledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MessageLog = {
  id: string;
  abandonedCheckoutId: string;
  channel: string;
  templateName: string;
  recipient: string;
  subject: string | null;
  body: string | null;
  providerMessageId: string | null;
  status: string;
  errorMessage: string | null;
  sentAt: string | null;
  createdAt: string;
};

export type AbandonedCheckout = {
  id: string;
  storeIntegrationId: string;
  tiendanubeCheckoutId: string;
  token: string | null;
  abandonedCheckoutUrl: string | null;
  contactEmail: string | null;
  contactName: string | null;
  contactPhone: string | null;
  currency: string | null;
  subtotal: string | null;
  total: string | null;
  productsJson: unknown;
  rawJson: unknown;
  status: string;
  firstMessageDueAt: string | null;
  secondMessageDueAt: string | null;
  thirdMessageDueAt: string | null;
  firstMessageSentAt: string | null;
  secondMessageSentAt: string | null;
  thirdMessageSentAt: string | null;
  recoveredAt: string | null;
  recoveredOrderId: string | null;
  createdAtFromTN: string | null;
  updatedAtFromTN: string | null;
  createdAt: string;
  updatedAt: string;
  storeIntegration: StoreIntegration;
};

export type AbandonedCheckoutDetail = AbandonedCheckout & {
  messageLogs: MessageLog[];
};
