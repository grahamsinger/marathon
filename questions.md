# Marathon Training App — Design Questions

## Target User & Scope

**1. Who is this for?** Just you personally, or are you building this for others too (e.g., a coach managing multiple athletes)?

>

**2. "Experienced marathon trainer"** — does that mean someone who's run multiple marathons and has strong opinions on training structure, or someone who coaches marathon runners?

>

**3. What's missing from existing tools** (Strava, TrainingPeaks, Final Surge, etc.) that's driving you to build your own?

>

## Platform & Tech

**4. When you say "not mobile," what do you mean?** Web app? Desktop app? CLI tool? Terminal UI? Spreadsheet-like interface?

>

**5. Do you have a tech stack preference?** (Python, JS/React, something else?)

>

**6. Where should data live?** Local files (JSON/SQLite), a database, cloud-hosted?

>

**7. Single user local tool, or something with a login/auth?**

>

## Training Plan Structure

**8. How do you think about training cycles?** Do you plan in mesocycles (e.g., base → build → peak → taper), or is it more freeform week-to-week?

>

**9. How far out do you typically plan?** A full 16-20 week block? Or rolling weekly plans?

>

**10. Do you plan around a specific race date and work backwards, or build forward?**

>

**11. Do you want the app to generate plans, or is it purely manual planning with templates?**

>

## Workout Data Model

**12. What types of workouts do you want to categorize?** Some common ones: easy run, long run, tempo, intervals/track, hill repeats, fartlek, race pace, progression run, recovery run, cross-training, rest. What's your list?

>

**13. What fields matter for a workout entry?** Distance, time, pace, heart rate, effort (RPE), splits, elevation, weather, notes, shoe used?

>

**14. Do you distinguish between the planned workout and the actual workout?** (e.g., planned: 10mi easy, actual: 8.5mi, cut short due to weather)

>

**15. "Re-use common workouts" — can you give an example?** Like a saved template for "Tuesday track workout: 6x800m at 5K pace with 400m jog recovery"?

>

## Mileage & Metrics

**16. When you say "track mileage," what granularity?** Daily, weekly, monthly, cycle-to-date, yearly?

>

**17. Do you care about weekly mileage progression rules** (e.g., no more than 10% increase week over week)?

>

**18. Any other metrics beyond mileage?** Time on feet, elevation gain, intensity distribution (easy vs. hard), acute/chronic training load?

>

## The Swap/Adjust Feature

**19. "Swap with another day in the week"** — is this just drag-and-drop rearranging within a week? Or could you swap across weeks?

>

**20. Should swapping trigger any warnings?** (e.g., "You're putting a long run the day after a track workout")

>

## Recovery & Rest

**21. How do you want to track rest days?** Just mark them, or also track recovery activities (stretching, foam rolling, sleep quality, body weight)?

>

**22. Cross-training (cycling, swimming, strength) — does that live in the same system, or is this purely a running app?**

>

## Integrations

**23. Do you want to pull data from a GPS watch or Strava/Garmin Connect?** Or is all data manually entered?

>

**24. Any import/export needs?** (CSV, calendar sync, etc.)

>

## Visualization & Reporting

**25. What do you want to see at a glance?** A weekly calendar view? A dashboard with mileage charts? A timeline of the whole training block?

>

**26. Any specific charts or reports you'd want?** (Weekly mileage bar chart, pace trends, planned vs. actual comparison)

>
