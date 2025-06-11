import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from sqlalchemy.orm import Session
from sqlalchemy.exc import DataError
from ..routers.reports import router
from ..database import get_db

# filepath: backend/app/routers/test_reports.py

client = TestClient(router)

@pytest.fixture
def mock_db_session():
    session = MagicMock(spec=Session)
    return session

def test_get_service_executions(mock_db_session, monkeypatch):
    # Mock query results
    mock_query_result = [
        MagicMock(
            id=1,
            id_service=101,
            id_client=201,
            id_company=301,
            fuselage_type="Type A",
            id_avion=401,
            id_user=501,
            work_order="WO123",
            whonew="User1",
            create_at="2023-01-01T00:00:00",
            updated_at="2023-01-02T00:00:00",
            service_name="Service Name"
        )
    ]
    mock_db_session.query.return_value.select_from.return_value.outerjoin.return_value.order_by.return_value.offset.return_value.limit.return_value.all.return_value = mock_query_result

    monkeypatch.setattr("..routers.reports.get_db", lambda: mock_db_session)

    response = client.get("/reports/service-executions?skip=0&limit=10")
    assert response.status_code == 200
    assert response.json() == [
        {
            "id": 1,
            "id_service": 101,
            "id_client": 201,
            "id_company": 301,
            "fuselage_type": "Type A",
            "id_avion": 401,
            "id_user": 501,
            "work_order": "WO123",
            "whonew": "User1",
            "create_at": "2023-01-01T00:00:00",
            "updated_at": "2023-01-02T00:00:00",
            "service_name": "Service Name",
            "client_name": None,
            "company_name": None,
            "aircraft_model": None
        }
    ]

def test_get_service_executions_count(mock_db_session, monkeypatch):
    # Mock count result
    mock_db_session.query.return_value.count.return_value = 100

    monkeypatch.setattr("..routers.reports.get_db", lambda: mock_db_session)

    response = client.get("/reports/service-executions/count")
    assert response.status_code == 200
    assert response.json() == {"total_count": 100}

def test_get_operation_reports_v2_error(mock_db_session, monkeypatch):
    # Mock database error
    mock_db_session.execute.side_effect = DataError("22018", "Explicit conversion error")

    monkeypatch.setattr("..routers.reports.get_db", lambda: mock_db_session)

    response = client.get("/reports/operation-reports-v2")
    assert response.status_code == 500
    assert "Explicit conversion error" in response.json()["detail"]