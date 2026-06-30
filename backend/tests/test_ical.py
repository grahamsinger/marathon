"""iCal feed content — summary formatting and event fields."""


def test_ical_summary_includes_distance_pace_and_description(client):
    client.get("/api/weeks/2026-03-02")
    client.post("/api/workouts", json={
        "date": "2026-03-02",
        "workout_type": "long_run",
        "distance": 16.0,
        "pace_seconds": 545,          # -> 9:05/mi
        "description": "Hilly route",
    })

    text = client.get("/api/ical/feed").text
    assert "Long Run" in text          # type, title-cased and de-underscored
    assert "16.0 mi" in text           # distance
    assert "9:05/mi" in text           # pace formatted from seconds
    assert "Hilly route" in text       # description -> event description


def test_ical_summary_includes_duration(client):
    client.get("/api/weeks/2026-03-02")
    client.post("/api/workouts", json={
        "date": "2026-03-02",
        "workout_type": "strength",
        "duration_minutes": 45,
    })

    text = client.get("/api/ical/feed").text
    assert "Strength" in text
    assert "45 min" in text


def test_ical_empty_feed_is_valid_calendar(client):
    text = client.get("/api/ical/feed").text
    assert "VCALENDAR" in text
    assert "VEVENT" not in text        # no workouts -> no events
