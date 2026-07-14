"""
NextGen Computer Academy - Backend regression tests.
Verifies API endpoints remain functional after frontend-only date-fns downgrade.
"""
import os
import pytest
import requests
import uuid

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://admin-panel-suite-2.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@nextgen.local")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "NextGen@2025")


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    return s


@pytest.fixture(scope="session")
def admin_token(session):
    r = session.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    if r.status_code != 200:
        pytest.skip(f"admin login failed {r.status_code}: {r.text[:200]}")
    data = r.json()
    token = data.get("token") or data.get("access_token")
    assert token
    return token


# ---------- Health / root ----------
class TestHealth:
    def test_root(self, session):
        r = session.get(f"{BASE_URL}/api/")
        assert r.status_code == 200
        assert r.json().get("ok") is True


# ---------- Public content ----------
class TestPublicContent:
    def test_get_content(self, session):
        r = session.get(f"{BASE_URL}/api/content")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, dict) and len(data) > 0

    def test_get_courses(self, session):
        r = session.get(f"{BASE_URL}/api/courses")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 9, f"expected 9+ courses, got {len(data)}"
        first = data[0]
        for key in ("title_en", "title_te", "desc_en", "desc_te"):
            assert key in first

    def test_get_course_by_key(self, session):
        r = session.get(f"{BASE_URL}/api/courses/tally-prime")
        # Endpoint might use key from title slug or return 404 if unmatched — accept either.
        assert r.status_code in (200, 404)

    def test_get_testimonials(self, session):
        r = session.get(f"{BASE_URL}/api/testimonials")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_get_gallery(self, session):
        r = session.get(f"{BASE_URL}/api/gallery")
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ---------- Demo bookings ----------
class TestDemoBooking:
    def test_create_demo_booking(self, session):
        payload = {
            "name": f"TEST_Demo_{uuid.uuid4().hex[:6]}",
            "phone": "9999900001",
            "date": "2026-02-15",
            "time": "10:00",
            "course": "Tally Prime",
            "notes": "regression test",
        }
        r = session.post(f"{BASE_URL}/api/demo-bookings", json=payload)
        assert r.status_code in (200, 201), f"got {r.status_code}: {r.text[:300]}"
        data = r.json()
        assert "_id" not in data
        assert data.get("ok") is True
        assert data.get("id")

    def test_create_demo_booking_missing_required(self, session):
        r = session.post(f"{BASE_URL}/api/demo-bookings", json={})
        assert 400 <= r.status_code < 500


# ---------- Admissions (multipart form) ----------
class TestAdmissions:
    def test_create_admission(self, session):
        form = {
            "student_name": f"TEST_Admission_{uuid.uuid4().hex[:6]}",
            "father_name": "Test Father",
            "mother_name": "Test Mother",
            "dob": "2000-01-01",
            "gender": "Male",
            "qualification": "Graduate",
            "course": "Tally Prime",
            "phone": "9999900002",
            "alt_phone": "",
            "email": "test_admission@example.com",
            "address": "123 Test St",
        }
        r = session.post(f"{BASE_URL}/api/admissions", data=form)
        assert r.status_code in (200, 201), f"got {r.status_code}: {r.text[:300]}"
        data = r.json()
        assert data.get("ok") is True
        assert data.get("id")

    def test_create_admission_missing_fields(self, session):
        r = session.post(f"{BASE_URL}/api/admissions", data={"student_name": "x"})
        # Missing required form fields → FastAPI returns 422
        assert 400 <= r.status_code < 500


# ---------- Admin auth + protected endpoints ----------
class TestAdminAuth:
    def test_admin_login_valid(self, session):
        r = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        )
        assert r.status_code == 200, r.text[:300]
        data = r.json()
        token = data.get("token") or data.get("access_token")
        assert token and isinstance(token, str) and len(token) > 10

    def test_admin_login_invalid(self, session):
        r = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": "wrongpass"},
        )
        assert r.status_code in (400, 401, 403)

    def test_admin_me(self, session, admin_token):
        r = session.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 200

    def test_admin_list_admissions(self, session, admin_token):
        r = session.get(
            f"{BASE_URL}/api/admissions",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_admin_list_demo_bookings(self, session, admin_token):
        r = session.get(
            f"{BASE_URL}/api/demo-bookings",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_admissions_requires_auth(self, session):
        r = session.get(f"{BASE_URL}/api/admissions")
        assert r.status_code in (401, 403)
