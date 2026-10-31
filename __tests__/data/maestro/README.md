# Maestro fixtures

Real output from Maestro CLI 2.12.0, run on 2026-10-31 against a small local web page
(`--platform web --headless`, Chrome), because no Android emulator was available.
Only two things were edited: the `MAESTRO_CLI_*` environment entries and the screenshot `artifacts`
were removed from the step logs. JUnit and step-log formats are the same on Android and iOS.

Command:

```sh
maestro test maestro/ --platform web --headless --format junit \
  --output maestro-results/report.xml --test-output-dir maestro-results/
```

| Flow | Result |
| --- | --- |
| `mobile/profile/edit-avatar.yaml` | passes, no labels (one row from flow `properties`) |
| `mobile/checkout/saved-card.yaml` | C1042 passes, C1043 fails, C1044 never runs |
| `mobile/checkout/promo-code.yaml` | C1051 is `optional: true` and fails (WARNED), the flow passes |
| `mobile/checkout/reorder.yaml` | labeled `runFlow` (C1060); the subflow's own label C9999 is ignored |
| `mobile/onboarding/sign-up.yaml` | C3001 passes, then an unlabeled `tapOn` fails, so C3002 never runs |

The `url:` lines point at `http://localhost:8765`, the throwaway page used for the run.
