"""Error paths (mostly 404s) that the happy-path tests don't exercise."""


def test_update_missing_workout_404(client):
    r = client.put("/api/workouts/9999", json={"distance": 5.0})
    assert r.status_code == 404


def test_delete_missing_workout_404(client):
    r = client.delete("/api/workouts/9999")
    assert r.status_code == 404


def test_swap_missing_workout_404(client):
    # Create one real workout; swap it against a non-existent id.
    real = client.post("/api/workouts", json={"date": "2026-03-02", "workout_type": "rest"}).json()["id"]
    r = client.post("/api/workouts/swap", json={"workout_id_1": real, "workout_id_2": 9999})
    assert r.status_code == 404


def test_from_template_missing_template_404(client):
    r = client.post("/api/workouts/from-template", json={"template_id": 9999, "date": "2026-03-02"})
    assert r.status_code == 404


def test_apply_day_no_source_404(client):
    r = client.post("/api/workouts/apply-day", json={
        "source_date": "2026-03-02",
        "target_date": "2026-03-05",
    })
    assert r.status_code == 404


def test_update_missing_template_404(client):
    r = client.put("/api/templates/9999", json={"name": "Nope"})
    assert r.status_code == 404


def test_delete_missing_template_404(client):
    r = client.delete("/api/templates/9999")
    assert r.status_code == 404
