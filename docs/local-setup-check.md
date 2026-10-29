# Windows local setup check

Checked October 28, 2026 in the existing Windows checkout, using Node.js 24.19.0, pnpm 11.25.0 and installed dependencies. PowerShell runs the projects directly; Windows Subsystem for Linux (WSL) is optional.

| Project | Source verification | Existing checks | Production build |
| --- | --- | --- | --- |
| 03 / Model Breakdown | 16 recorded hashes match | 17 tests pass | Pass |
| 04 / Animated Storyboard | Static source in `docs/collage-motion/` | Visibility, order and export-source check passes | No build required |
| 05 / Spatial Media Presenter | 20 recorded hashes match | 7 sample-migration checks pass | Pass |
| 06 / Motion Tracking (Oct 29 revision) | 15 recorded hashes match | 4 marker + 6 frame-timing tests pass | Pass; TypeScript check passes |
| 07 / Kinetic Typography | 5 recorded hashes match | No separate test script | Pass |

Project 07 was checked again on October 29 with three supplied clips. Each white marker was selected through the browser UI and exported in 4K. The project page now contains two matched 14-second videos; the [check record](../projects/06-motion-tracking/docs/white-marker-demo.md) separates this bounded example from the earlier synthetic timing tests.

This check reused installed dependencies; it is not a fresh-machine installation test. It did not download a speech model, run transcription or repeat the earlier export acceptance tests. Build success does not establish codec support on another machine. Follow each project's Local setup section for its commands and requirements.

[Back to the portfolio](../README.md)
