## Target User & Scope

**1. Who is this for?** Just you personally, or are you building this for others too (e.g., a coach managing multiple athletes)?

> my wife primarily

**2. "Experienced marathon trainer"** — does that mean someone who's run multiple marathons and has strong opinions on training structure, or someone who coaches marathon runners?

> 4 time marathon finisher, 1 previous Chicago marathon

**3. What's missing from existing tools** (Strava, TrainingPeaks, Final Surge, etc.) that's driving you to build your own?

> marathon training specific data only- strava gets messy with logging dog walks etc. want to see future runs and strava only logs previous runs

## Platform & Tech

**4. When you say "not mobile," what do you mean?** Web app? Desktop app? CLI tool? Terminal UI? Spreadsheet-like interface?

> Web app (React frontend)

**5. Do you have a tech stack preference?** (Python, JS/React, something else?)

> Python backend, React frontend

**6. Where should data live?** Local files (JSON/SQLite), a database, cloud-hosted?

> SQLite

**7. Single user local tool, or something with a login/auth?**

> Single user local tool

## Training Plan Structure

**8. How do you think about training cycles?** Do you plan in mesocycles (e.g., base → build → peak → taper), or is it more freeform week-to-week?

> Freeform week to week

**9. How far out do you typically plan?** A full 16-20 week block? Or rolling weekly plans?

> 18 week plan but with sunday set up of next weeks plan, each week will follow long run, medium long run, 3x speed work, a cross train day, and a rest day. Week-by-week planning only — no long-range skeleton.

**10. Do you plan around a specific race date and work backwards, or build forward?**

> Race day: 2026 Chicago Marathon (Oct 11, 2026). Goal time: 3:45:00 (~8:35/mile pace). Show countdown of weeks remaining.

**11. Do you want the app to generate plans, or is it purely manual planning with templates?**

> Planning with templates. Templates are copy-then-edit — apply a template to a day, freely modify that instance without affecting the saved template.

## Workout Data Model

**12. What types of workouts do you want to categorize?** Some common ones: easy run, long run, tempo, intervals/track, hill repeats, fartlek, race pace, progression run, recovery run, cross-training, rest. What's your list?

> Long run, medium long run, speed work x2, easy run, cross train, rest day, strength training. All speed work under one "speed work" category — template/notes captures the specific format.

**13. What fields matter for a workout entry?** Distance, time, pace, heart rate, effort (RPE), splits, elevation, weather, notes, shoe used?

> Distance, pace (min/mile). For speed workouts: average pace + interval pace. For strength: free-form text type + time. For cycling: separate mileage (not counted toward running total).

**14. Do you distinguish between the planned workout and the actual workout?** (e.g., planned: 10mi easy, actual: 8.5mi, cut short due to weather)

> No

**15. "Re-use common workouts" — can you give an example?** Like a saved template for "Tuesday track workout: 6x800m at 5K pace with 400m jog recovery"?

> 1 mi warm up, 3 min push pace, 2 min recovery pace x 5, 1 mi cool down, or track workouts like your examples

## Mileage & Metrics

**16. When you say "track mileage," what granularity?** Daily, weekly, monthly, cycle-to-date, yearly?

> Weekly. Set a weekly mileage target first, then distribute across individual runs.

**17. Do you care about weekly mileage progression rules** (e.g., no more than 10% increase week over week)?

> No, I will set this manually

**18. Any other metrics beyond mileage?** Time on feet, elevation gain, intensity distribution (easy vs. hard), acute/chronic training load?

> No

## The Swap/Adjust Feature

**19. "Swap with another day in the week"** — is this just drag-and-drop rearranging within a week? Or could you swap across weeks?

> Just within week — can swap Tuesday with Thursday but not across weeks

**20. Should swapping trigger any warnings?** (e.g., "You're putting a long run the day after a track workout")

> No. Swap just overwrites — no history of original arrangement kept.

## Recovery & Rest

**21. How do you want to track rest days?** Just mark them, or also track recovery activities (stretching, foam rolling, sleep quality, body weight)?

> Just mark them, no recovery tracking

**22. Cross-training (cycling, swimming, strength) — does that live in the same system, or is this purely a running app?**

> Cycle mileage can be logged (tracked separately from running mileage). Strength type (free-form text) and time should be logged.

## Integrations

**23. Do you want to pull data from a GPS watch or Strava/Garmin Connect?** Or is all data manually entered?

> Manual entry

**24. Any import/export needs?** (CSV, calendar sync, etc.)

> Calendar sync (iCal) — see planned runs in phone/Google calendar

## Visualization & Reporting

**25. What do you want to see at a glance?** A weekly calendar view? A dashboard with mileage charts? A timeline of the whole training block?

> Weekly calendar as the main view

**26. Any specific charts or reports you'd want?** (Weekly mileage bar chart, pace trends, planned vs. actual comparison)

> Pace trends — specifically long run pace trending over the training block

## Additional Decisions

**27. Day structure** — Are workout days fixed or flexible?

> Flexible — assign workout types to any day each week, no fixed pattern
