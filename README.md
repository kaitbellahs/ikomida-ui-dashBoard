# ikomida-ui-dashBoard

The vendor application.

> Part of the **iKomida** platform. See **[ikomida-k8s-config](https://github.com/kaitbellahs/ikomida-k8s-config)** for the architecture overview of all 31 repositories.

---

## Role

Where a restaurant actually runs its day: incoming orders, catalog and stock, business hours, staff, and settings.

This one ships to **four** targets — the same Svelte source runs as a web app, as native iOS and Android through Capacitor, and as a desktop application through **Electron**, because a busy kitchen wants a screen that stays on, not a browser tab.

## Targets

web · iOS · Android · desktop (Electron)

## Stack

Svelte · TypeScript · Capacitor · rollup

## Build

```bash
yarn install
yarn dev        # development build + watch
yarn prod       # production build
```

## Status

Built in 2022. The platform is no longer deployed; this repository is published as a record of the work. **The commit history predates generative AI coding assistants.**

## License

Licensed under the [Apache License 2.0](LICENSE) — free for commercial use, provided the copyright notice and [NOTICE](NOTICE) are retained.

Copyright 2022 Khalid Ait Bellahs.
