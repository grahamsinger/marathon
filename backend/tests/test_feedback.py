def test_create_feedback(client):
    r = client.post("/api/feedback", json={"message": "Love the new summary view", "page": "/summary"})
    assert r.status_code == 201
    data = r.json()
    assert data["message"] == "Love the new summary view"
    assert data["page"] == "/summary"
    assert "id" in data
    assert "created_at" in data


def test_create_feedback_without_page(client):
    r = client.post("/api/feedback", json={"message": "No page attached"})
    assert r.status_code == 201
    assert r.json()["page"] is None


def test_list_feedback_newest_first(client):
    client.post("/api/feedback", json={"message": "first"})
    client.post("/api/feedback", json={"message": "second"})

    r = client.get("/api/feedback")
    assert r.status_code == 200
    messages = [f["message"] for f in r.json()]
    assert set(messages) == {"first", "second"}
    assert len(messages) == 2


def test_delete_feedback(client):
    fid = client.post("/api/feedback", json={"message": "delete me"}).json()["id"]

    r = client.delete(f"/api/feedback/{fid}")
    assert r.status_code == 204

    assert client.get("/api/feedback").json() == []


def test_delete_missing_feedback_404(client):
    r = client.delete("/api/feedback/9999")
    assert r.status_code == 404
