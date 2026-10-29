# Windows local setup check

Checked October 28, 2026 in the existing Windows checkout, using Node.js 24.19.0, pnpm 11.25.0 and installed dependencies. PowerShell runs the projects directly; Windows Subsystem for Linux (WSL) is optional.

| Project | Source verification | Existing checks | Production build |
| --- | --- | --- | --- |
| 03 / Model Breakdown | 16 recorded hashes match | 17 tests pass | Pass |
| 04 / Animated Storyboard | Static source in `docs/collage-motion/` | Visibility, order and export-source check passes | No build required |
| 05 / Spatial Media Presenter | 20 recorded hashes match | 7 sample-migration checks pass | Pass |
| 06 / Kinetic Typography | 5 recorded hashes match | No separate test script | Pass |
| 07 / Motion Tracking | 7 recorded hashes match | 6 frame-timing tests pass | Pass |

Project 07 was also served locally with Vite preview, loaded in Chromium, and used to import the existing synthetic clip, select its target and play the full sequence. Its project page contains the actual interface recording and the existing input/output videos.

This check reused installed dependencies; it is not a fresh-machine installation test. It did not download a speech model, run transcription or repeat the earlier export acceptance tests. Build success does not establish codec support on another machine. Follow each project's Local setup section for its commands and requirements.

[Back to the portfolio](../README.md)
