def test_race_info(client):
    r = client.get("/api/race-info")
    assert r.status_code == 200
    data = r.json()
    assert data["race_name"] == "Chicago Marathon 2026"
    assert data["goal_pace_seconds"] == 515


def test_get_or_create_week(client):
    r = client.get("/api/weeks/2026-03-02")
    assert r.status_code == 200
    data = r.json()
    assert data["week_start"] == "2026-03-02"
    assert data["workouts"] == []


def test_update_week(client):
    client.get("/api/weeks/2026-03-02")
    r = client.put("/api/weeks/2026-03-02", json={"mileage_target": 40.0, "notes": "Build week"})
    assert r.status_code == 200
    data = r.json()
    assert data["mileage_target"] == 40.0
    assert data["notes"] == "Build week"


def test_create_and_get_workout(client):
    client.get("/api/weeks/2026-03-02")
    r = client.post("/api/workouts", json={
        "date": "2026-03-02",
        "workout_type": "easy_run",
        "distance": 5.0,
        "pace_seconds": 540,
    })
    assert r.status_code == 201
    workout = r.json()
    assert workout["workout_type"] == "easy_run"
    assert workout["distance"] == 5.0

    # Verify it shows up in the week
    r2 = client.get("/api/weeks/2026-03-02")
    assert len(r2.json()["workouts"]) == 1


def test_update_workout(client):
    client.get("/api/weeks/2026-03-02")
    r = client.post("/api/workouts", json={
        "date": "2026-03-02",
        "workout_type": "easy_run",
        "distance": 5.0,
    })
    workout_id = r.json()["id"]

    r2 = client.put(f"/api/workouts/{workout_id}", json={
        "distance": 6.0,
        "pace_seconds": 530,
    })
    assert r2.status_code == 200
    assert r2.json()["distance"] == 6.0
    assert r2.json()["pace_seconds"] == 530


def test_delete_workout(client):
    client.get("/api/weeks/2026-03-02")
    r = client.post("/api/workouts", json={
        "date": "2026-03-02",
        "workout_type": "rest",
    })
    workout_id = r.json()["id"]

    r2 = client.delete(f"/api/workouts/{workout_id}")
    assert r2.status_code == 204

    r3 = client.get("/api/weeks/2026-03-02")
    assert len(r3.json()["workouts"]) == 0


def test_duplicate_date_rejected(client):
    client.get("/api/weeks/2026-03-02")
    client.post("/api/workouts", json={
        "date": "2026-03-02",
        "workout_type": "easy_run",
    })
    r = client.post("/api/workouts", json={
        "date": "2026-03-02",
        "workout_type": "rest",
    })
    assert r.status_code == 400


def test_swap_workouts(client):
    client.get("/api/weeks/2026-03-02")
    r1 = client.post("/api/workouts", json={
        "date": "2026-03-02",
        "workout_type": "easy_run",
        "distance": 5.0,
    })
    r2 = client.post("/api/workouts", json={
        "date": "2026-03-03",
        "workout_type": "long_run",
        "distance": 16.0,
    })
    id1 = r1.json()["id"]
    id2 = r2.json()["id"]

    r3 = client.post("/api/workouts/swap", json={
        "workout_id_1": id1,
        "workout_id_2": id2,
    })
    assert r3.status_code == 200
    swapped = {w["id"]: w for w in r3.json()}
    assert swapped[id1]["date"] == "2026-03-03"
    assert swapped[id2]["date"] == "2026-03-02"


def test_template_crud(client):
    r = client.post("/api/templates", json={
        "name": "Easy 5",
        "workout_type": "easy_run",
        "distance": 5.0,
        "pace_seconds": 540,
    })
    assert r.status_code == 201
    template_id = r.json()["id"]

    r2 = client.get("/api/templates")
    assert len(r2.json()) == 1

    r3 = client.put(f"/api/templates/{template_id}", json={"name": "Easy 5 Miles"})
    assert r3.json()["name"] == "Easy 5 Miles"

    r4 = client.delete(f"/api/templates/{template_id}")
    assert r4.status_code == 204

    r5 = client.get("/api/templates")
    assert len(r5.json()) == 0


def test_create_from_template(client):
    r = client.post("/api/templates", json={
        "name": "Long Run",
        "workout_type": "long_run",
        "distance": 18.0,
        "pace_seconds": 530,
    })
    template_id = r.json()["id"]

    r2 = client.post("/api/workouts/from-template", json={
        "template_id": template_id,
        "date": "2026-03-07",
    })
    assert r2.status_code == 201
    workout = r2.json()
    assert workout["workout_type"] == "long_run"
    assert workout["distance"] == 18.0
    assert workout["pace_seconds"] == 530


def test_pace_trend(client):
    client.get("/api/weeks/2026-03-02")
    client.post("/api/workouts", json={
        "date": "2026-03-07",
        "workout_type": "long_run",
        "distance": 16.0,
        "pace_seconds": 540,
    })
    client.post("/api/workouts", json={
        "date": "2026-03-14",
        "workout_type": "long_run",
        "distance": 18.0,
        "pace_seconds": 530,
    })

    r = client.get("/api/stats/pace-trend")
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 2
    assert data[0]["pace_seconds"] == 540
    assert data[1]["pace_seconds"] == 530


def test_ical_feed(client):
    client.get("/api/weeks/2026-03-02")
    client.post("/api/workouts", json={
        "date": "2026-03-02",
        "workout_type": "easy_run",
        "distance": 5.0,
        "pace_seconds": 540,
    })

    r = client.get("/api/ical/feed")
    assert r.status_code == 200
    assert "text/calendar" in r.headers["content-type"]
    content = r.text
    assert "VCALENDAR" in content
    assert "VEVENT" in content
    assert "Easy Run" in content
