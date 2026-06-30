"""Week-normalization and workout-listing edges not covered by the happy path."""


def test_get_week_normalizes_to_monday(client):
    # 2026-03-04 is a Wednesday; the week should snap back to Monday 2026-03-02.
    r = client.get("/api/weeks/2026-03-04")
    assert r.status_code == 200
    assert r.json()["week_start"] == "2026-03-02"


def test_update_week_creates_when_missing(client):
    # PUT without a prior GET should still create the week row.
    r = client.put("/api/weeks/2026-03-09", json={"mileage_target": 35.0})
    assert r.status_code == 200
    data = r.json()
    assert data["week_start"] == "2026-03-09"
    assert data["mileage_target"] == 35.0


def test_list_workouts_missing_week_is_empty(client):
    # Querying a week that was never created returns [] (not a 404).
    r = client.get("/api/workouts", params={"week_start": "2030-01-07"})
    assert r.status_code == 200
    assert r.json() == []


def test_list_all_workouts_newest_first(client):
    client.get("/api/weeks/2026-03-02")
    client.post("/api/workouts", json={"date": "2026-03-02", "workout_type": "easy_run"})
    client.post("/api/workouts", json={"date": "2026-03-09", "workout_type": "long_run", "distance": 12.0})

    data = client.get("/api/workouts/all").json()
    dates = [w["date"] for w in data]
    assert dates == ["2026-03-09", "2026-03-02"]


def test_recent_days_respects_limit(client):
    client.get("/api/weeks/2026-03-02")
    # Three distinct day-shapes; ask for only the 2 most recent.
    client.post("/api/workouts", json={"date": "2026-03-02", "workout_type": "easy_run"})
    client.post("/api/workouts", json={"date": "2026-03-03", "workout_type": "long_run"})
    client.post("/api/workouts", json={"date": "2026-03-04", "workout_type": "strength"})

    days = client.get("/api/workouts/recent-days", params={"limit": 2}).json()
    assert len(days) == 2
    # Most recent first.
    assert days[0]["date"] == "2026-03-04"
    assert days[1]["date"] == "2026-03-03"
