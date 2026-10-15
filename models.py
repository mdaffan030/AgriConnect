from sqlalchemy import Column, Integer, String, Float, ForeignKey
from database import Base


class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"), nullable=True)
    crop_name = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    expected_price = Column(Float, nullable=False)
    location = Column(String, nullable=False)


class Farmer(Base):
    __tablename__ = "farmers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)


class Buyer(Base):
    __tablename__ = "buyers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("buyers.id"), nullable=False)
    offer_price = Column(Float, nullable=False)
    quantity = Column(Float, nullable=False)
    status = Column(String, default="Pending")
class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    offer_id = Column(Integer, ForeignKey("offers.id"), nullable=False)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("buyers.id"), nullable=False)
    farmer_id = Column(Integer, ForeignKey("farmers.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    price_per_kg = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String, default="Confirmed")