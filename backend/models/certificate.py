from datetime import datetime
from typing import List, Optional, Any, Annotated
from pydantic import BaseModel, Field, field_validator, GetJsonSchemaHandler
from pydantic.json_schema import JsonSchemaValue
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema: GetJsonSchemaHandler) -> JsonSchemaValue:
        return {"type": "string"}

class Coordinate(BaseModel):
    lat_deg: float
    lat_min: float
    lat_sec: float
    lat_dir: str
    lon_deg: float
    lon_min: float
    lon_sec: float
    lon_dir: str
    amsl: float

    @field_validator('lat_dir')
    @classmethod
    def validate_lat_dir(cls, v):
        if v not in ['N', 'S']:
            raise ValueError('Latitude direction must be N or S')
        return v

    @field_validator('lon_dir')
    @classmethod
    def validate_lon_dir(cls, v):
        if v not in ['E', 'W']:
            raise ValueError('Longitude direction must be E or W')
        return v

    @field_validator('lat_deg')
    @classmethod
    def validate_lat_deg(cls, v):
        if not 0 <= v <= 90:
            raise ValueError('Latitude degrees must be between 0 and 90')
        return v

    @field_validator('lon_deg')
    @classmethod
    def validate_lon_deg(cls, v):
        if not 0 <= v <= 180:
            raise ValueError('Longitude degrees must be between 0 and 180')
        return v

class CertificateBase(BaseModel):
    survey_no: str
    village_name: str
    owner: str
    facility: str
    coordinates: List[Coordinate]
    certificate_type: str
    userName: Optional[str] = None
    userAddress: Optional[str] = None
    userPhone: Optional[str] = None
    userEmail: Optional[str] = None

class CertificateCreate(CertificateBase):
    pass

class CertificateUpdate(CertificateBase):
    # This model is specifically for updates and excludes _id
    pass

class Certificate(CertificateBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {
        "json_encoders": {ObjectId: str},
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "from_attributes": True
    } 