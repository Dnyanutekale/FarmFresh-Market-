import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

@pytest.mark.asyncio
async def test_get_products():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/products")
        assert response.status_code == 200
        products = response.json()
        assert len(products) > 0
        assert any(p["category"] == "Vegetables" for p in products)
        assert any(p["category"] == "Fruits" for p in products)
        assert any(p["category"] == "Dry Fruits" for p in products)
        assert any(p["category"] == "Dry Products" for p in products)

@pytest.mark.asyncio
async def test_get_categories():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/products/categories")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 4

@pytest.mark.asyncio
async def test_farmer_login():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/auth/login", json={
            "email": "farmer.ramesh@farmfresh.com",
            "password": "Pass123!"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "farmer"

@pytest.mark.asyncio
async def test_customer_order_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Login as customer
        login_res = await client.post("/api/auth/login", json={
            "email": "customer@example.com",
            "password": "Pass123!"
        })
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Get products
        products_res = await client.get("/api/products")
        first_product = products_res.json()[0]

        # 3. Create order
        order_payload = {
            "items": [{"product_id": first_product["id"], "quantity": 1.0}],
            "shipping_name": "Test Customer",
            "shipping_phone": "+91 99999 88888",
            "shipping_address": "Flat 101, Test Residency",
            "shipping_city": "Mumbai",
            "shipping_postal_code": "400001",
            "payment_method": "cod"
        }
@pytest.mark.asyncio
async def test_admin_dashboard_and_verify_farmer():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Admin login
        login_res = await client.post("/api/auth/login", json={
            "email": "admin@farmfresh.com",
            "password": "Pass123!"
        })
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Dashboard metrics
        dash_res = await client.get("/api/admin/dashboard", headers=headers)
        assert dash_res.status_code == 200
        data = dash_res.json()
        assert "total_users" in data
        assert "farmers_count" in data
        assert data["farmers_count"] >= 2

        # Get farmers
        farmers_res = await client.get("/api/admin/farmers", headers=headers)
        assert farmers_res.status_code == 200
        farmers = farmers_res.json()
        assert len(farmers) > 0
        first_farmer = farmers[0]

        # Toggle verify
        toggle_res = await client.patch(f"/api/admin/farmers/{first_farmer['id']}/verify", headers=headers)
        assert toggle_res.status_code == 200
        assert toggle_res.json()["is_verified_farmer"] != first_farmer["is_verified_farmer"]

@pytest.mark.asyncio
async def test_payment_and_fulfillment_lifecycle():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Customer login & order creation
        c_login = await client.post("/api/auth/login", json={
            "email": "customer@example.com",
            "password": "Pass123!"
        })
        c_token = c_login.json()["access_token"]
        c_headers = {"Authorization": f"Bearer {c_token}"}

        products = (await client.get("/api/products")).json()
        p = products[0]

        order_res = await client.post("/api/orders", json={
            "items": [{"product_id": p["id"], "quantity": 1}],
            "shipping_name": "Priya Sharma",
            "shipping_phone": "+91-9876543210",
            "shipping_address": "42, Green Park",
            "shipping_city": "New Delhi",
            "shipping_postal_code": "110016",
            "payment_method": "razorpay_mock"
        }, headers=c_headers)
        assert order_res.status_code == 201
        order = order_res.json()

        # 2. Initiate payment
        pay_init = await client.post("/api/payment/initiate", json={
            "order_id": order["id"],
            "gateway": "razorpay",
            "amount": order["final_amount"]
        }, headers=c_headers)
        assert pay_init.status_code == 200
        tx_id = pay_init.json()["transaction_id"]

        # 3. Verify payment
        pay_ver = await client.post("/api/payment/verify", json={
            "order_id": order["id"],
            "gateway": "razorpay",
            "transaction_id": tx_id,
            "status": "success"
        }, headers=c_headers)
        assert pay_ver.status_code == 200
        assert pay_ver.json()["success"] is True

        # 4. Farmer login and update order status
        f_login = await client.post("/api/auth/login", json={
            "email": "farmer.ramesh@farmfresh.com",
            "password": "Pass123!"
        })
        f_token = f_login.json()["access_token"]
        f_headers = {"Authorization": f"Bearer {f_token}"}

        farmer_orders = (await client.get("/api/farmer/orders", headers=f_headers)).json()
        matched_item = next((item for item in farmer_orders if item["order_id"] == order["id"]), None)
        if matched_item:
            item_status_res = await client.patch(
                f"/api/farmer/orders/{matched_item['item_id']}/status",
                json={"status": "packed"},
                headers=f_headers
            )
            assert item_status_res.status_code == 200
            assert item_status_res.json()["status"] == "packed"

