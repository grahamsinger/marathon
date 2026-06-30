def test_total_mileage_sums_only_running_with_distance(client):
    client.get("/api/weeks/2026-03-02")
    # Running types with distance — counted.
    client.post("/api/workouts", json={"date": "2026-03-02", "workout_type": "easy_run", "distance": 5.0})
    client.post("/api/workouts", json={"date": "2026-03-03", "workout_type": "long_run", "distance": 16.0})
    # Non-running type — excluded even with a distance.
    client.post("/api/workouts", json={"date": "2026-03-04", "workout_type": "cross_train", "distance": 10.0})
    # Running type without distance — excluded (no miles to add).
    client.post("/api/workouts", json={"date": "2026-03-05", "workout_type": "easy_run"})

    r = client.get("/api/stats/total-mileage")
    assert r.status_code == 200
    assert r.json()["total_miles"] == 21.0


def test_total_mileage_empty_is_zero(client):
    r = client.get("/api/stats/total-mileage")
    assert r.status_code == 200
    assert r.json()["total_miles"] == 0.0


def test_pace_trend_only_long_runs_with_pace(client):
    client.get("/api/weeks/2026-03-02")
    # Long run with pace — included.
    client.post("/api/workouts", json={
        "date": "2026-03-07", "workout_type": "long_run", "distance": 16.0, "pace_seconds": 540,
    })
    # Long run WITHOUT pace — excluded.
    client.post("/api/workouts", json={"date": "2026-03-08", "workout_type": "long_run", "distance": 8.0})
    # Easy run with pace — excluded (not a long run).
    client.post("/api/workouts", json={
        "date": "2026-03-09", "workout_type": "easy_run", "distance": 4.0, "pace_seconds": 500,
    })

    data = client.get("/api/stats/pace-trend").json()
    assert len(data) == 1
    assert data[0]["pace_seconds"] == 540
    assert data[0]["distance"] == 16.0
