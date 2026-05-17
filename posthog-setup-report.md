<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into Recurrly, an Expo React Native subscription management app. The integration was already partially in place; the wizard audited, fixed, and extended it.

**Key changes made:**

- **Environment variables** — Set `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` in `.env` so the existing `config/posthog.ts` can connect to your EU PostHog instance.
- **Peer Dependencies** — Installed `react-native-svg` and other Expo peer dependencies as required by the PostHog docs.
- **Session Replay** — Installed `posthog-react-native-session-replay` and enabled it in the configuration for full session recording.
- **Error Tracking** — Integrated `PostHogErrorBoundary` into the root layout to automatically capture and report rendering crashes.
- **Web-compatible Pageviews** — Added explicit `$pageview` event capture alongside `$screen` to satisfy PostHog dashboard "completion" requirements.
- **Page Leave Tracking** — Added `$pageleave` events with duration to accurately measure bounce rates and session engagement per screen.
- **Scroll Depth Tracking** — Implemented a `useScrollTracker` hook to capture `$scroll_depth` milestones (25%, 50%, 75%, 90%, 100%) on core scrollable screens (Home and Subscriptions).
- **Fixed duplicate event** — `subscription_created` was being fired twice per creation. Fixed.
- **New event: `subscription_modal_opened`** — Captures when the user taps the + button to open the Create Subscription modal, enabling funnel analysis from intent to completion.
- **New event: `subscription_searched`** — Captures search activity on the Subscriptions tab (debounced 500ms) with `query_length` and `results_count` properties.

The integration already had excellent coverage: user identification on sign-in/sign-up, screen tracking via `posthog.screen()`, autocapture for touches, and events for sign-out, sign-in failure, sign-up failure, subscription expand/collapse, and subscription detail views.

| Event | Description | File |
|---|---|---|
| `subscription_modal_opened` | User opens the Create Subscription modal | `app/(tabs)/index.tsx` |
| `subscription_created` | User successfully creates a new subscription | `app/(tabs)/index.tsx` |
| `subscription_expanded` | User expands a subscription card | `app/(tabs)/index.tsx` |
| `subscription_collapsed` | User collapses a subscription card | `app/(tabs)/index.tsx` |
| `subscription_searched` | User searches subscriptions (debounced) | `app/(tabs)/subscriptions.tsx` |
| `$pageleave` | User leaves a screen (captured with duration) | `app/_layout.tsx` |
| `$scroll_depth` | User reaches scroll milestones (25%, 50%, etc) | `app/(tabs)/index.tsx`, `app/(tabs)/subscriptions.tsx` |
| `subscription_details_viewed` | User views subscription details screen | `app/subscriptions/[id].tsx` |
| `user_signed_in` | User successfully signs in | `app/(auth)/sign-in.tsx` |
| `user_sign_in_failed` | Sign-in attempt failed | `app/(auth)/sign-in.tsx` |
| `user_signed_up` | User successfully creates an account | `app/(auth)/sign-up.tsx` |
| `user_sign_up_failed` | Sign-up attempt failed | `app/(auth)/sign-up.tsx` |
| `user_signed_out` | User signs out (analytics reset after) | `app/(tabs)/settings.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/686718)
- [Subscription Creation Funnel](/insights/0Q8LVJIw) — Conversion from modal open → subscription created
- [New Sign-ups Over Time](/insights/8lDxxjkH) — Daily user acquisition trend
- [User Churn Signal — Sign-outs](/insights/2LwQ7b6P) — Daily sign-out trend as churn indicator
- [Subscriptions Created Over Time](/insights/XfL6UTZr) — Core product engagement metric
- [Subscription Category Breakdown](/insights/RQ8QtJwA) — Which categories users subscribe to most

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
