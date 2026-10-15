from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import SessionLocal, engine, Base
from models import Crop, Farmer, Buyer, Offer, Order
import json
import urllib.request
import urllib.error
from datetime import date, datetime, timedelta, timezone
from fastapi import HTTPException, Query

# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(title="AgriConnect API")


# Allow React frontend to access the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Database session
def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# Request data for creating a crop
class CropCreate(BaseModel):
    crop_name: str
    quantity: float
    expected_price: float
    location: str
    farmer_id: int
class CropUpdate(BaseModel):
    quantity: float
    expected_price: float
    farmer_id: int
class FarmerCreate(BaseModel):
    name: str
    email: str
    password: str
class FarmerLogin(BaseModel):
    email: str
    password: str
class BuyerCreate(BaseModel):
    name: str
    email: str
    password: str
class BuyerLogin(BaseModel):
    email: str
    password: str
class OfferCreate(BaseModel):
    crop_id: int
    buyer_id: int
    offer_price: float
    quantity: float
class OrderStatusUpdate(BaseModel):
    status: str
    farmer_id: int
    

@app.get("/")
def home():
    return {
        "message": "AgriConnect API is running!"
    }


@app.get("/api/hello")
def hello():
    return {
        "message": "Hello from AgriConnect!"
    }


# Add a crop
@app.post("/api/crops")
def add_crop(crop: CropCreate, db: Session = Depends(get_db)):

    new_crop = Crop(
    crop_name=crop.crop_name,
    quantity=crop.quantity,
    expected_price=crop.expected_price,
    location=crop.location,
    farmer_id=crop.farmer_id
)

    db.add(new_crop)
    db.commit()
    db.refresh(new_crop)

    return {
        "message": "Crop listed successfully!",
        "crop": {
    "id": new_crop.id,
    "crop_name": new_crop.crop_name,
    "quantity": new_crop.quantity,
    "expected_price": new_crop.expected_price,
    "location": new_crop.location,
    "farmer_id": new_crop.farmer_id
}
    }


# Get all crops
@app.get("/api/crops")
def get_crops(
    farmer_id: int,
    db: Session = Depends(get_db)
):

    crops = db.query(Crop).filter(
        Crop.farmer_id == farmer_id
    ).all()

    return {
        "crops": [
            {
                "id": crop.id,
                "crop_name": crop.crop_name,
                "quantity": crop.quantity,
                "expected_price": crop.expected_price,
                "location": crop.location,
                "farmer_id": crop.farmer_id
            }
            for crop in crops
        ]
    }

# Update an existing crop
@app.put("/api/crops/{crop_id}")
def update_crop(
    crop_id: int,
    update: CropUpdate,
    db: Session = Depends(get_db)
):
    if update.quantity < 0 or update.expected_price < 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity and expected price cannot be negative."
        )

    crop = db.query(Crop).filter(
        Crop.id == crop_id,
        Crop.farmer_id == update.farmer_id
    ).first()

    if crop is None:
        raise HTTPException(
            status_code=404,
            detail="Crop not found for this farmer."
        )

    crop.quantity = update.quantity
    crop.expected_price = update.expected_price

    db.commit()
    db.refresh(crop)

    return {
        "message": "Crop updated successfully!",
        "crop": {
            "id": crop.id,
            "crop_name": crop.crop_name,
            "quantity": crop.quantity,
            "expected_price": crop.expected_price,
            "location": crop.location,
            "farmer_id": crop.farmer_id
        }
    }



# Buyer marketplace - get all available farmer crops
@app.get("/api/marketplace/crops")
def get_marketplace_crops(db: Session = Depends(get_db)):
    crops = db.query(Crop).filter(
        Crop.farmer_id.isnot(None)
    ).all()

    result = []

    for crop in crops:
        farmer = db.query(Farmer).filter(
            Farmer.id == crop.farmer_id
        ).first()

        result.append({
            "id": crop.id,
            "crop_name": crop.crop_name,
            "quantity": crop.quantity,
            "expected_price": crop.expected_price,
            "location": crop.location,
            "farmer_id": crop.farmer_id,
            "farmer_name": farmer.name if farmer else "Unknown Farmer"
        })

    return {
        "crops": result
    }
# Register a new farmer
@app.post("/api/farmers/register")
def register_farmer(
    farmer: FarmerCreate,
    db: Session = Depends(get_db)
):

    new_farmer = Farmer(
        name=farmer.name,
        email=farmer.email,
        password=farmer.password
    )

    db.add(new_farmer)
    db.commit()
    db.refresh(new_farmer)

    return {
        "message": "Farmer registered successfully!",
        "farmer": {
            "id": new_farmer.id,
            "name": new_farmer.name,
            "email": new_farmer.email
        }
    }
@app.post("/api/buyers/register")
def register_buyer(buyer: BuyerCreate, db: Session = Depends(get_db)):
    new_buyer = Buyer(
        name=buyer.name,
        email=buyer.email,
        password=buyer.password
    )

    db.add(new_buyer)
    db.commit()
    db.refresh(new_buyer)

    return {
        "message": "Buyer registered successfully!",
        "buyer": {
            "id": new_buyer.id,
            "name": new_buyer.name,
            "email": new_buyer.email
        }
    }
# Farmer login
@app.post("/api/farmers/login")
def login_farmer(
    farmer: FarmerLogin,
    db: Session = Depends(get_db)
):

    existing_farmer = db.query(Farmer).filter(
        Farmer.email == farmer.email,
        Farmer.password == farmer.password
    ).first()

    if existing_farmer is None:
        return {
            "message": "Invalid email or password"
        }

    return {
        "message": "Login successful!",
        "farmer": {
            "id": existing_farmer.id,
            "name": existing_farmer.name,
            "email": existing_farmer.email
        }
    }
@app.post("/api/buyers/login")
def login_buyer(
    buyer: BuyerLogin,
    db: Session = Depends(get_db)
):

    existing_buyer = db.query(Buyer).filter(
        Buyer.email == buyer.email,
        Buyer.password == buyer.password
    ).first()

    if existing_buyer is None:
        return {
            "message": "Invalid email or password"
        }

    return {
        "message": "Buyer login successful!",
        "buyer": {
            "id": existing_buyer.id,
            "name": existing_buyer.name,
            "email": existing_buyer.email
        }
    }
@app.post("/api/offers")
def create_offer(offer: OfferCreate, db: Session = Depends(get_db)):

    new_offer = Offer(
        crop_id=offer.crop_id,
        buyer_id=offer.buyer_id,
        offer_price=offer.offer_price,
        quantity=offer.quantity,
        status="Pending"
    )

    db.add(new_offer)
    db.commit()
    db.refresh(new_offer)

    return {
        "message": "Offer submitted successfully!",
        "offer": {
            "id": new_offer.id,
            "crop_id": new_offer.crop_id,
            "buyer_id": new_offer.buyer_id,
            "offer_price": new_offer.offer_price,
            "quantity": new_offer.quantity,
            "status": new_offer.status
        }
    }
@app.get("/api/farmer/offers")
def get_farmer_offers(farmer_id: int, db: Session = Depends(get_db)):

    offers = (
        db.query(Offer)
        .join(Crop, Offer.crop_id == Crop.id)
        .filter(Crop.farmer_id == farmer_id)
        .all()
    )

    return {
        "offers": [
            {
                "id": offer.id,
                "crop_id": offer.crop_id,
                "buyer_id": offer.buyer_id,
                "crop_name": db.query(Crop)
                    .filter(Crop.id == offer.crop_id)
                    .first().crop_name,
                "offer_price": offer.offer_price,
                "quantity": offer.quantity,
                "status": offer.status
            }
            for offer in offers
        ]
    }
@app.put("/api/offers/{offer_id}/status")
def update_offer_status(
    offer_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    offer = db.query(Offer).filter(
        Offer.id == offer_id
    ).first()

    if offer is None:
        return {"message": "Offer not found"}

    if status not in ["Accepted", "Rejected"]:
        return {"message": "Invalid status"}

    # Reject offer
    if status == "Rejected":
        offer.status = "Rejected"
        db.commit()
        db.refresh(offer)

        return {
            "message": "Offer rejected successfully!",
            "offer": {
                "id": offer.id,
                "status": offer.status
            }
        }

    # Prevent accepting the same offer twice
    if offer.status == "Accepted":
        return {
            "message": "Offer is already accepted",
            "offer": {
                "id": offer.id,
                "status": offer.status
            }
        }

    # Get the crop
    crop = db.query(Crop).filter(
        Crop.id == offer.crop_id
    ).first()

    if crop is None:
        return {"message": "Crop not found"}

    # Check requested quantity
    if offer.quantity > crop.quantity:
        return {
            "message": "Not enough crop quantity available"
        }

    # Accept offer
    offer.status = "Accepted"

    # Calculate total amount
    total_amount = offer.quantity * offer.offer_price

    # Create order
    new_order = Order(
        offer_id=offer.id,
        crop_id=offer.crop_id,
        buyer_id=offer.buyer_id,
        farmer_id=crop.farmer_id,
        quantity=offer.quantity,
        price_per_kg=offer.offer_price,
        total_amount=total_amount,
        status="Confirmed"
    )

    db.add(new_order)

    # Reduce available crop quantity
    crop.quantity -= offer.quantity

    db.commit()

    db.refresh(offer)
    db.refresh(new_order)

    return {
        "message": "Offer accepted and order created successfully!",
        "offer": {
            "id": offer.id,
            "status": offer.status
        },
        "order": {
            "id": new_order.id,
            "offer_id": new_order.offer_id,
            "crop_id": new_order.crop_id,
            "buyer_id": new_order.buyer_id,
            "farmer_id": new_order.farmer_id,
            "quantity": new_order.quantity,
            "price_per_kg": new_order.price_per_kg,
            "total_amount": new_order.total_amount,
            "status": new_order.status
        }
    }

@app.put("/api/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    update: OrderStatusUpdate,
    db: Session = Depends(get_db)
):

    allowed_statuses = [
        "Confirmed",
        "Processing",
        "Ready for Pickup",
        "Out for Delivery",
        "Delivered"
    ]

    if update.status not in allowed_statuses:
        return {
            "message": "Invalid order status"
        }

    order = db.query(Order).filter(
        Order.id == order_id
    ).first()

    if order is None:
        return {
            "message": "Order not found"
        }

    if order.farmer_id != update.farmer_id:
        return {
            "message": "You are not authorized to update this order"
        }

   
    status_flow = {
        "Confirmed": ["Processing"],
        "Processing": ["Ready for Pickup"],
        "Ready for Pickup": ["Out for Delivery"],
        "Out for Delivery": ["Delivered"],
    }

    if update.status not in status_flow.get(order.status, []):
        return {
            "message": (
                f"Cannot change status from '{order.status}' "
                f"to '{update.status}'. Follow the order sequence."
            )
        }

    order.status = update.status


    db.commit()
    db.refresh(order)

    return {
        "message": "Order status updated successfully!",
        "order": {
            "id": order.id,
            "status": order.status
        }
    }
@app.get("/api/market-insights")
def get_market_insights(
    farmer_id: int,
    db: Session = Depends(get_db)
):

    # Get this farmer's crops
    crops = db.query(Crop).filter(
        Crop.farmer_id == farmer_id
    ).all()

    # Basic crop statistics
    total_crops = len(crops)

    total_quantity = sum(
        float(crop.quantity or 0)
        for crop in crops
    )

    total_expected_value = sum(
        float(crop.quantity or 0) *
        float(crop.expected_price or 0)
        for crop in crops
    )

    average_price = (
        total_expected_value / total_quantity
        if total_quantity > 0
        else 0
    )

    # Get farmer's offers
    offers = (
        db.query(Offer)
        .join(Crop, Offer.crop_id == Crop.id)
        .filter(Crop.farmer_id == farmer_id)
        .all()
    )

    total_offers = len(offers)

    accepted_offers = len([
        offer for offer in offers
        if offer.status == "Accepted"
    ])

    pending_offers = len([
        offer for offer in offers
        if offer.status == "Pending"
    ])

    # Get farmer's orders
    orders = db.query(Order).filter(
        Order.farmer_id == farmer_id
    ).all()

    total_orders = len(orders)

    total_sales = sum(
        float(order.total_amount or 0)
        for order in orders
    )

    # Crop breakdown
    crop_breakdown = []

    for crop in crops:
        crop_breakdown.append({
            "crop_name": crop.crop_name,
            "quantity": crop.quantity,
            "expected_price": crop.expected_price,
            "estimated_value":
                float(crop.quantity or 0) *
                float(crop.expected_price or 0)
        })

    return {
        "summary": {
            "total_crops": total_crops,
            "total_quantity": total_quantity,
            "average_price": round(average_price, 2),
            "total_expected_value": round(
                total_expected_value, 2
            ),
            "total_offers": total_offers,
            "accepted_offers": accepted_offers,
            "pending_offers": pending_offers,
            "total_orders": total_orders,
            "total_sales": round(total_sales, 2)
        },

        "crop_breakdown": crop_breakdown
    }
@app.get("/api/farmer/orders")
def get_farmer_orders(farmer_id: int, db: Session = Depends(get_db)):
    orders = db.query(Order).filter(
        Order.farmer_id == farmer_id
    ).all()

    result = []

    for order in orders:
        crop = db.query(Crop).filter(
            Crop.id == order.crop_id
        ).first()

        buyer = db.query(Buyer).filter(
            Buyer.id == order.buyer_id
        ).first()

        result.append({
            "id": order.id,
            "offer_id": order.offer_id,
            "crop_id": order.crop_id,
            "crop_name": crop.crop_name if crop else "Unknown Crop",
            "buyer_id": order.buyer_id,
            "buyer_name": buyer.name if buyer else "Unknown Buyer",
            "farmer_id": order.farmer_id,
            "quantity": order.quantity,
            "price_per_kg": order.price_per_kg,
            "total_amount": order.total_amount,
            "status": order.status
        })

    return {
        "orders": result
    }


@app.get("/api/buyer/orders")
def get_buyer_orders(buyer_id: int, db: Session = Depends(get_db)):
    orders = db.query(Order).filter(
        Order.buyer_id == buyer_id
    ).all()

    result = []

    for order in orders:
        crop = db.query(Crop).filter(
            Crop.id == order.crop_id
        ).first()

        farmer = db.query(Farmer).filter(
            Farmer.id == order.farmer_id
        ).first()

        result.append({
            "id": order.id,
            "offer_id": order.offer_id,
            "crop_id": order.crop_id,
            "crop_name": crop.crop_name if crop else "Unknown Crop",
            "buyer_id": order.buyer_id,
            "farmer_id": order.farmer_id,
            "farmer_name": farmer.name if farmer else "Unknown Farmer",
            "quantity": order.quantity,
            "price_per_kg": order.price_per_kg,
            "total_amount": order.total_amount,
            "status": order.status
        })

    return {
        "orders": result
    }

# ============================================================
# CEDA MARKET PRICES API
# This is a new endpoint; existing endpoints remain unchanged.
# ============================================================

CEDA_API_BASE = "https://agmarknet.ceda.ashoka.edu.in/api"



def ceda_get_json(url: str):
    request = urllib.request.Request(
        url,
        headers={
            "Accept": "application/json",
            "User-Agent": "AgriConnect/1.0",
        },
    )

    print(f"CEDA GET starting: {url}")

    try:
        with urllib.request.urlopen(request, timeout=25) as response:
            result = json.loads(response.read().decode("utf-8"))
            print(f"CEDA GET succeeded: {url}")
            return result

    
    except Exception as exc:
        import traceback
        traceback.print_exc()

        raise HTTPException(
            status_code=502,
            detail=f"Could not retrieve market prices: {type(exc).__name__}: {exc}",
        )




@app.get("/api/market-metadata")
def get_market_metadata():
    """Return state and commodity options from Agmarknet."""
    url = "https://api.agmarknet.gov.in/v1/daily-price-arrival/filters"

    request = urllib.request.Request(
        url,
        headers={
            "Accept": "application/json",
            "User-Agent": "AgriConnect/1.0",
        },
    )

    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            result = json.loads(response.read().decode("utf-8"))

    except Exception as exc:
        print("Agmarknet metadata error:", repr(exc))
        raise HTTPException(
            status_code=502,
            detail="Could not retrieve Agmarknet state and commodity options.",
        )

    if not result.get("status"):
        raise HTTPException(
            status_code=502,
            detail="Agmarknet did not return filter options.",
        )

    data = result.get("data", {})

    states = sorted({
        item.get("state_name", "").strip()
        for item in data.get("state_data", [])
        if item.get("state_name", "").strip()
    })

    commodities = sorted({
        item.get("cmdt_name", "").strip()
        for item in data.get("cmdt_data", [])
        if item.get("cmdt_name", "").strip()
    }, key=str.casefold)

    return {
        "source": "Agmarknet",
        "source_url": url,
        "states": states,
        "commodities": commodities,
        "state_count": len(states),
        "commodity_count": len(commodities),
        "message": "Options retrieved from Agmarknet.",
    }




@app.get("/api/market-prices")
def get_market_prices(
    state: str = Query(default="Telangana", min_length=2, max_length=80),
    commodity: str = Query(default="Tomato", min_length=2, max_length=80),
   days: int = Query(default=7, ge=1, le=365),
    market_id: int | None = Query(default=None, ge=1),
):
    # Agmarknet IDs confirmed from the filters API.
   


   
    # Fetch commodity IDs dynamically from Agmarknet.
    filters_request = urllib.request.Request(
        "https://api.agmarknet.gov.in/v1/daily-price-arrival/filters",
        headers={
            "Accept": "application/json",
            "User-Agent": "AgriConnect/1.0",
        },
    )


    try:
        with urllib.request.urlopen(filters_request, timeout=30) as response:
            filters_response = json.loads(
                response.read().decode("utf-8")
            )
    except Exception as exc:
        print("Agmarknet filters error:", repr(exc))
        raise HTTPException(
            status_code=502,
            detail="Could not retrieve Agmarknet filter options.",
        )

    filter_data = filters_response.get("data", {})
    commodities = filter_data.get("cmdt_data", [])
    state_options = filter_data.get("state_data", [])
    market_options = filter_data.get("market_data", [])
    matched_state = next(
        (
            item for item in state_options
            if item.get("state_name", "").strip().casefold()
            == state.strip().casefold()
        ),
        None,
    )

    if matched_state is None:
        raise HTTPException(
            status_code=404,
            detail=f"State '{state}' was not found in Agmarknet.",
        )

    state_id = matched_state["state_id"]

   
    if market_id is None:
        state_markets = [
            item for item in market_options
            if item.get("state_id") == state_id
            and item.get("mkt_name")
            and item.get("mkt_name") != "All Markets"
        ]

        if not state_markets:
            raise HTTPException(
                status_code=404,
                detail=f"No markets were found for {state}.",
            )
        matched_market = None
    else:
        matched_market = next(
            (
                item for item in market_options
                if item.get("id") == market_id
                and item.get("state_id") == state_id
            ),
            None,
        )
        if matched_market is None:
            raise HTTPException(
                status_code=400,
                detail="The selected market does not belong to this state.",
            )
        market_name = matched_market["mkt_name"]

    matched_commodity = next(
        (
            item for item in commodities
            if item.get("cmdt_name", "").strip().casefold()
            == commodity.strip().casefold()
        ),
        None,
    )

    if matched_commodity is None:
        raise HTTPException(
            status_code=404,
            detail=f"Commodity '{commodity}' was not found in Agmarknet.",
        )

    commodity_id = matched_commodity["cmdt_id"]


    matched_commodity = next(
        (
            item for item in commodities
            if item.get("cmdt_name", "").strip().casefold()
            == commodity.strip().casefold()
        ),
        None,
    )

    if matched_commodity is None:
        raise HTTPException(
            status_code=404,
            detail=f"Commodity '{commodity}' was not found in Agmarknet.",
        )

    commodity_id = matched_commodity["cmdt_id"]

   
   
    # Fetch prices from the selected market, or search other markets
    # automatically until a reported numeric price is found.
    if market_id is None:
        candidate_markets = state_markets
    else:
        candidate_markets = [matched_market]

    selected_response = None
    selected_url = None
    selected_market = None

    for candidate in candidate_markets[:15]:
        candidate_id = candidate["id"]

        url = (
            "https://api.agmarknet.gov.in/v1/"
            "prices-and-arrivals/commodity-price/lastweek"
            f"?marketId={candidate_id}"
            f"&stateId={state_id}"
            f"&commodityId={commodity_id}"
        )

        request = urllib.request.Request(
            url,
            headers={
                "Accept": "application/json",
                "User-Agent": "AgriConnect/1.0",
            },
            method="GET",
        )

        try:
            with urllib.request.urlopen(request, timeout=15) as response:
                result = json.loads(response.read().decode("utf-8"))
        except Exception as exc:
            print(f"Agmarknet market {candidate_id} error:", repr(exc))
            continue

        if not result.get("success"):
            continue

        records = result.get("data", [])
        has_price = any(
            isinstance(record.get(column.get("key")), (int, float))
            or (
                isinstance(record.get(column.get("key")), str)
                and record[column["key"]].strip().replace(",", "").replace(".", "", 1).isdigit()
            )
            for record in records
            for column in result.get("columns", [])
            if column.get("key", "")[:4].isdigit()
            and column.get("key", "")[4:5] == "-"
        )

        if has_price:
            selected_response = result
            selected_url = url
            selected_market = candidate
            break

    if selected_response is None:
        raise HTTPException(
            status_code=404,
            detail=(
                f"No reported numeric prices were found for {commodity} "
                f"in the checked markets of {state}. Please try another crop "
                "or state."
            ),
        )

    return {
        "source": "Agmarknet",
        "source_url": selected_url,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "state": state,
        "commodity": commodity,
        "market_id": selected_market["id"],
        "market": selected_market["mkt_name"],
        "price_unit": "Rs./Quintal (as reported by Agmarknet)",
        "record_count": len(selected_response.get("data", [])),
        "columns": selected_response.get("columns", []),
        "records": selected_response.get("data", []),
        "message": "Reported market prices fetched successfully.",
    }
