export const ANALYTICS_EVENTS = {
  PUBLIC_FORM_SUBMIT_FAILED: "public_form_submit_failed",
  PUBLIC_FORM_SUBMITTED: "public_form_submitted",
  PUBLIC_FORM_VIEWED: "public_form_viewed",
  USER_SIGNED_UP: "user_signed_up",
} as const;

export type AnalyticsProperties = Readonly<Record<string, unknown>>;

export type PublicFormAnalyticsProperties = {
  form_id?: string;
  form_name?: string;
  form_slug?: string;
  form_status?: string;
  workspace_slug?: string;
};

export type AnalyticsEventProperties = {
  [ANALYTICS_EVENTS.PUBLIC_FORM_SUBMIT_FAILED]: PublicFormAnalyticsProperties & {
    error_message: string;
  };
  [ANALYTICS_EVENTS.PUBLIC_FORM_SUBMITTED]: PublicFormAnalyticsProperties;
  [ANALYTICS_EVENTS.PUBLIC_FORM_VIEWED]: PublicFormAnalyticsProperties;
  [ANALYTICS_EVENTS.USER_SIGNED_UP]: {
    signup_source: "auth_user_created";
    user_id: string;
  };
};

export type AnalyticsEventName = keyof AnalyticsEventProperties;

export type AnalyticsActor = {
  id: string;
  initialProperties?: AnalyticsProperties;
  properties?: AnalyticsProperties;
};

export type AnalyticsContext = {
  actor?: AnalyticsActor;
  occurredAt?: Date;
};

export type AnalyticsEvent<TName extends AnalyticsEventName = AnalyticsEventName> = {
  context?: AnalyticsContext;
  name: TName;
  properties: AnalyticsEventProperties[TName];
};

export type AnyAnalyticsEvent = {
  [TName in AnalyticsEventName]: AnalyticsEvent<TName>;
}[AnalyticsEventName];

export type Analytics<TResult> = {
  capture<TName extends AnalyticsEventName>(
    name: TName,
    properties: AnalyticsEventProperties[TName],
    context?: AnalyticsContext,
  ): TResult;
};

export function createAnalytics<TResult>(
  sink: (event: AnyAnalyticsEvent) => TResult,
): Analytics<TResult> {
  return {
    capture(name, properties, context) {
      return sink({
        ...(context ? { context } : {}),
        name,
        properties,
      } as AnyAnalyticsEvent);
    },
  };
}
