import asyncio
import sys
from datetime import date, datetime, timedelta
from sqlalchemy import select
from app.database import engine, Base, AsyncSessionLocal
from app.models.user import User
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.utils.security import get_password_hash

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

async def seed():
    print("[INFO] Initializing FarmFresh Market Database Tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Check if users already seeded
        check = await session.execute(select(User).limit(1))
        if check.scalar_one_or_none():
            print("Database already contains data. Skipping re-seed.")
            return

        print("Seeding Users (Admin, Farmers, Customer)...")
        default_pwd = get_password_hash("Pass123!")

        admin = User(
            email="admin@farmfresh.com",
            hashed_password=default_pwd,
            full_name="Platform Administrator",
            phone="+91 98000 11122",
            role="admin",
            is_active=True,
            is_verified_farmer=True
        )

        farmer1 = User(
            email="farmer.ramesh@farmfresh.com",
            hashed_password=default_pwd,
            full_name="Ramesh Patil",
            phone="+91 98220 12345",
            role="farmer",
            is_active=True,
            is_verified_farmer=True,
            farm_name="Patil Organic Agro",
            farm_location="Nashik, Maharashtra",
            bio="3rd-generation farmer cultivating 100% naturally grown vegetables, herbs, and citrus without synthetic pesticides or harmful fertilizers.",
            avatar_url="https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop"
        )

        farmer2 = User(
            email="farmer.anita@farmfresh.com",
            hashed_password=default_pwd,
            full_name="Anita Sharma",
            phone="+91 98110 54321",
            role="farmer",
            is_active=True,
            is_verified_farmer=True,
            farm_name="Valley Breeze Orchards",
            farm_location="Mahabaleshwar, Maharashtra",
            bio="Dedicated to organic berry farming, table grapes, and stone-ground heritage spices using rainwater harvesting and solar dryers.",
            avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop"
        )

        farmer3 = User(
            email="farmer.tariq@farmfresh.com",
            hashed_password=default_pwd,
            full_name="Tariq Ahmed",
            phone="+91 99060 98765",
            role="farmer",
            is_active=True,
            is_verified_farmer=True,
            farm_name="Kashmir Valley Dryfruits & Orchards",
            farm_location="Shopian, Kashmir",
            bio="Himalayan high-altitude plantation producing premium walnuts, almonds, saffron, and crisp mountain apples for over 25 years.",
            avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop"
        )

        customer = User(
            email="customer@example.com",
            hashed_password=default_pwd,
            full_name="Siddharth Mehra",
            phone="+91 98765 43210",
            role="customer",
            is_active=True,
            is_verified_farmer=False
        )

        session.add_all([admin, farmer1, farmer2, farmer3, customer])
        await session.commit()
        await session.refresh(farmer1)
        await session.refresh(farmer2)
        await session.refresh(farmer3)
        await session.refresh(customer)

        today = date.today()

        print("Seeding Products across 4 Core Categories...")
        products = [
            # VEGETABLES
            Product(
                farmer_id=farmer1.id,
                name="Vine-Ripened Desi Tomatoes",
                category="Vegetables",
                description="Juicy, naturally ripened desi country tomatoes bursting with authentic tangy flavor. Perfect for curries, salads, and fresh purées.",
                price_per_unit=35.0,
                unit="kg",
                stock_quantity=150.0,
                image_url="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80",
                harvest_date=today,
                is_organic=True,
                is_featured=True,
                rating=4.9,
                review_count=32
            ),
            Product(
                farmer_id=farmer1.id,
                name="Farm Fresh Red Onions (Nashik Special)",
                category="Vegetables",
                description="Renowned Nashik crisp red onions with high pungency and excellent shelf life. Hand-sorted and cured directly at the farm.",
                price_per_unit=42.0,
                unit="kg",
                stock_quantity=220.0,
                image_url="https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80",
                harvest_date=today - timedelta(days=2),
                is_organic=False,
                is_featured=True,
                rating=4.8,
                review_count=45
            ),
            Product(
                farmer_id=farmer1.id,
                name="Tender Baby Spinach (Palak)",
                category="Vegetables",
                description="Harvested before sunrise to retain maximum iron, nutrients, and crisp freshness. 100% pesticide-free hydroponic-enhanced soil.",
                price_per_unit=25.0,
                unit="bunch",
                stock_quantity=80.0,
                image_url="https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&auto=format&fit=crop&q=80",
                harvest_date=today,
                is_organic=True,
                is_featured=False,
                rating=4.7,
                review_count=18
            ),
            Product(
                farmer_id=farmer2.id,
                name="Crisp Green Bell Peppers (Capsicum)",
                category="Vegetables",
                description="Thick-walled, vibrant crunchy green capsicum. Ideal for stir-fries, roasts, and stuffed continental dishes.",
                price_per_unit=65.0,
                unit="kg",
                stock_quantity=95.0,
                image_url="https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&auto=format&fit=crop&q=80",
                harvest_date=today - timedelta(days=1),
                is_organic=True,
                is_featured=False,
                rating=4.6,
                review_count=14
            ),
            Product(
                farmer_id=farmer2.id,
                name="Tender Sweet Baby Carrots",
                category="Vegetables",
                description="Organically cultivated sweet orange carrots with high beta-carotene. Washed with clean mountain spring water.",
                price_per_unit=50.0,
                unit="kg",
                stock_quantity=110.0,
                image_url="https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&auto=format&fit=crop&q=80",
                harvest_date=today - timedelta(days=1),
                is_organic=True,
                is_featured=True,
                rating=4.9,
                review_count=29
            ),
            Product(
                farmer_id=farmer1.id,
                name="Organic Green Broccoli Crowns",
                category="Vegetables",
                description="Compact, dark green florets grown in cool hill soils. Packed with antioxidants, vitamin C, and dietary fiber.",
                price_per_unit=85.0,
                unit="piece",
                stock_quantity=60.0,
                image_url="https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=800&auto=format&fit=crop&q=80",
                harvest_date=today,
                is_organic=True,
                is_featured=False,
                rating=4.8,
                review_count=21
            ),

            # FRUITS
            Product(
                farmer_id=farmer2.id,
                name="Mahabaleshwar Sweet Strawberries",
                category="Fruits",
                description="Handpicked morning-fresh strawberries from the misty slopes of Mahabaleshwar. Naturally sweet with fragrant aroma.",
                price_per_unit=180.0,
                unit="box",
                stock_quantity=60.0,
                image_url="https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&auto=format&fit=crop&q=80",
                harvest_date=today,
                is_organic=True,
                is_featured=True,
                rating=5.0,
                review_count=52
            ),
            Product(
                farmer_id=farmer1.id,
                name="Ratnagiri Alphonso Mangoes (GI Tagged)",
                category="Fruits",
                description="The King of Mangoes! Naturally tree-ripened on the coastal red laterite soil of Ratnagiri. Non-carbide treated.",
                price_per_unit=799.0,
                unit="box",
                stock_quantity=40.0,
                image_url="https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80",
                harvest_date=today - timedelta(days=2),
                is_organic=True,
                is_featured=True,
                rating=5.0,
                review_count=88
            ),
            Product(
                farmer_id=farmer3.id,
                name="Kashmir Royal Red Delicious Apples",
                category="Fruits",
                description="Crisp, juicy mountain apples from Himalayan slopes of Shopian. Unwaxed, rich aroma, and natural crunch.",
                price_per_unit=165.0,
                unit="kg",
                stock_quantity=140.0,
                image_url="https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&auto=format&fit=crop&q=80",
                harvest_date=today - timedelta(days=3),
                is_organic=True,
                is_featured=True,
                rating=4.9,
                review_count=41
            ),
            Product(
                farmer_id=farmer1.id,
                name="Nagpur Sweet & Juicy Mandarins",
                category="Fruits",
                description="Sun-drenched Vidarbha oranges with thin peels and abundant sweet-tangy juice. Loaded with immune-boosting Vitamin C.",
                price_per_unit=90.0,
                unit="kg",
                stock_quantity=180.0,
                image_url="https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=800&auto=format&fit=crop&q=80",
                harvest_date=today - timedelta(days=1),
                is_organic=False,
                is_featured=False,
                rating=4.7,
                review_count=36
            ),
            Product(
                farmer_id=farmer2.id,
                name="Sholapur Ruby Red Pomegranates",
                category="Fruits",
                description="Bhagwa variety with deep crimson arils, soft edible seeds, and high antioxidant polyphenols.",
                price_per_unit=145.0,
                unit="kg",
                stock_quantity=75.0,
                image_url="https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80",
                harvest_date=today - timedelta(days=2),
                is_organic=True,
                is_featured=False,
                rating=4.8,
                review_count=23
            ),

            # DRY FRUITS
            Product(
                farmer_id=farmer3.id,
                name="Kashmiri Snow White Walnuts (Kernels)",
                category="Dry Fruits",
                description="Extra-light Kashmiri walnut kernels with smooth buttery taste and high Omega-3 DHA content. No chemical bleaching.",
                price_per_unit=580.0,
                unit="500g",
                stock_quantity=90.0,
                image_url="https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=800&auto=format&fit=crop&q=80",
                harvest_date=today - timedelta(days=10),
                is_organic=True,
                is_featured=True,
                rating=5.0,
                review_count=67
            ),
            Product(
                farmer_id=farmer3.id,
                name="Himalayan Mamra Almonds (Badam)",
                category="Dry Fruits",
                description="Native Indian organic Mamra Badam with concave shape, natural almond oil intact (up to 50%), and unmatched cognitive benefits.",
                price_per_unit=690.0,
                unit="500g",
                stock_quantity=80.0,
                image_url="https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=800&auto=format&fit=crop&q=80",
                harvest_date=today - timedelta(days=15),
                is_organic=True,
                is_featured=True,
                rating=4.9,
                review_count=44
            ),
            Product(
                farmer_id=farmer2.id,
                name="Konkan Jumbo Whole Cashews (W-210)",
                category="Dry Fruits",
                description="King size hand-graded whole cashew nuts from the coastal Konkan orchards. Crunchy, creamy, and mildly sweet.",
                price_per_unit=530.0,
                unit="500g",
                stock_quantity=100.0,
                image_url="https://images.unsplash.com/photo-1569466896818-335b1bedfcce?w=800&auto=format&fit=crop&q=80",
                harvest_date=today - timedelta(days=8),
                is_organic=False,
                is_featured=False,
                rating=4.8,
                review_count=39
            ),
            Product(
                farmer_id=farmer2.id,
                name="Sangli Sun-Dried Golden Raisins (Kismis)",
                category="Dry Fruits",
                description="Naturally sun-dried Thomson Seedless green grapes from Sangli grape valley. Soft, chewy, rich in iron.",
                price_per_unit=220.0,
                unit="500g",
                stock_quantity=120.0,
                image_url="https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=800&auto=format&fit=crop&q=80",
                harvest_date=today - timedelta(days=20),
                is_organic=True,
                is_featured=False,
                rating=4.7,
                review_count=19
            ),

            # DRY PRODUCTS
            Product(
                farmer_id=farmer1.id,
                name="Bilona Method Pure Desi Cow A2 Ghee",
                category="Dry Products",
                description="Artisanal Vedic Ghee made from curd of grass-fed Gir cows using traditional wooden bilona churning. Golden granular texture.",
                price_per_unit=780.0,
                unit="500g",
                stock_quantity=60.0,
                image_url="https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=800&auto=format&fit=crop&q=80",
                harvest_date=today - timedelta(days=4),
                is_organic=True,
                is_featured=True,
                rating=5.0,
                review_count=94
            ),
            Product(
                farmer_id=farmer2.id,
                name="Raw Wild Western Ghats Forest Honey",
                category="Dry Products",
                description="Unprocessed, unpasteurized monofloral forest honey gathered ethically by indigenous tribes. Rich in natural bee pollen and enzymes.",
                price_per_unit=390.0,
                unit="500g",
                stock_quantity=85.0,
                image_url="https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80",
                harvest_date=today - timedelta(days=12),
                is_organic=True,
                is_featured=True,
                rating=4.9,
                review_count=58
            ),
            Product(
                farmer_id=farmer1.id,
                name="Salem High-Curcumin Turmeric Powder (Haldi)",
                category="Dry Products",
                description="Stone-ground unpolished turmeric with guaranteed >5% natural curcumin content. Sourced directly from heirloom rhizomes.",
                price_per_unit=160.0,
                unit="500g",
                stock_quantity=150.0,
                image_url="https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80",
                harvest_date=today - timedelta(days=18),
                is_organic=True,
                is_featured=False,
                rating=4.8,
                review_count=27
            ),
            Product(
                farmer_id=farmer3.id,
                name="Pure Kashmiri Mongra Saffron (Kesar)",
                category="Dry Products",
                description="Grade A++ Pampore Kashmiri Saffron with deep red stigmas, intense exotic fragrance, and golden coloring strength.",
                price_per_unit=650.0,
                unit="box",
                stock_quantity=45.0,
                image_url="https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&auto=format&fit=crop&q=80",
                harvest_date=today - timedelta(days=30),
                is_organic=True,
                is_featured=True,
                rating=5.0,
                review_count=73
            )
        ]

        session.add_all(products)
        await session.commit()

        # Seed a sample customer order to demonstrate fulfillment & tracking
        print("Seeding Sample Completed & In-Transit Customer Orders...")
        sample_order = Order(
            order_number="FFM-20260923-DEMO01",
            customer_id=customer.id,
            total_amount=565.0,
            discount_amount=0.0,
            shipping_amount=0.0,
            final_amount=565.0,
            status="confirmed",
            payment_method="razorpay_mock",
            payment_status="completed",
            transaction_id="mock_tx_rzp_98a7bc61e",
            shipping_name="Siddharth Mehra",
            shipping_phone="+91 98765 43210",
            shipping_address="Flat 402, Green Meadows, Baner Road",
            shipping_city="Pune",
            shipping_postal_code="411045",
            order_notes="Please ring the bell and leave at door if unattended."
        )
        session.add(sample_order)
        await session.commit()
        await session.refresh(sample_order)

        order_item_1 = OrderItem(
            order_id=sample_order.id,
            product_id=products[0].id,
            farmer_id=farmer1.id,
            product_name=products[0].name,
            product_image=products[0].image_url,
            unit_price=products[0].price_per_unit,
            unit=products[0].unit,
            quantity=3.0,
            subtotal=105.0,
            status="packed"
        )
        order_item_2 = OrderItem(
            order_id=sample_order.id,
            product_id=products[4].id,
            farmer_id=farmer2.id,
            product_name=products[4].name,
            product_image=products[4].image_url,
            unit_price=products[4].price_per_unit,
            unit=products[4].unit,
            quantity=2.0,
            subtotal=100.0,
            status="confirmed"
        )
        order_item_3 = OrderItem(
            order_id=sample_order.id,
            product_id=products[6].id,
            farmer_id=farmer2.id,
            product_name=products[6].name,
            product_image=products[6].image_url,
            unit_price=products[6].price_per_unit,
            unit=products[6].unit,
            quantity=2.0,
            subtotal=360.0,
            status="confirmed"
        )
        session.add_all([order_item_1, order_item_2, order_item_3])
        await session.commit()

        print("[SUCCESS] FarmFresh Market Database Seeded Successfully!")

if __name__ == "__main__":
    asyncio.run(seed())
