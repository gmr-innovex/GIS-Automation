from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from typing import List
from utils.coordinate_converter import process_coordinates
import os
import tempfile
import json
from models.certificate import Certificate, CertificateCreate, CertificateUpdate
from utils.database import Database, DATABASE_NAME
from datetime import datetime, timezone, timedelta
from bson import ObjectId
from pydantic import ValidationError

app = FastAPI()

# Enable CORS with more permissive settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],  # Expose all headers
    max_age=3600,  # Cache preflight requests for 1 hour
)

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

class CoordinateRequest(BaseModel):
    coordinates: List[Coordinate]

@app.options("/api/convert")
async def options_convert():
    return {"status": "ok"}

@app.on_event("startup")
async def startup_db_client():
    try:
        print("\n=== Database Connection Attempt ===")
        await Database.connect_db()
        # Verify connection by trying to list collections
        db = Database.get_db()
        collections = await db.list_collection_names()
        print(f"Successfully connected to database: {DATABASE_NAME}")
        print(f"Available collections: {collections}")
        print("=== Database Connection Successful ===\n")
    except Exception as e:
        print(f"\n=== Database Connection Failed ===")
        print(f"Error: {str(e)}")
        print("=== Database Connection Failed ===\n")
        raise

@app.on_event("shutdown")
async def shutdown_db_client():
    await Database.close_db()

@app.post("/api/convert")
async def convert_coordinates(request: CoordinateRequest):
    try:
        coordinates = request.coordinates
        
        # Log the raw request data
        print("\n=== Coordinate Conversion Request ===")
        print("Raw request data:", request.dict())
        
        if not coordinates:
            raise HTTPException(status_code=400, detail="No coordinates provided")
        
        # Print input coordinates with detailed validation
        print("\nInput Coordinates Validation:")
        for i, coord in enumerate(coordinates, 1):
            print(f"\nCoordinate {i}:")
            print(f"  Latitude: {coord.lat_deg}° {coord.lat_min}' {coord.lat_sec}\" {coord.lat_dir}")
            print(f"  Longitude: {coord.lon_deg}° {coord.lon_min}' {coord.lon_sec}\" {coord.lon_dir}")
            print(f"  AMSL: {coord.amsl}m")
            
            # Validate each field
            if not isinstance(coord.lat_deg, (int, float)) or coord.lat_deg < 0 or coord.lat_deg > 90:
                print(f"  WARNING: Invalid latitude degrees: {coord.lat_deg}")
            if not isinstance(coord.lon_deg, (int, float)) or coord.lon_deg < 0 or coord.lon_deg > 180:
                print(f"  WARNING: Invalid longitude degrees: {coord.lon_deg}")
            if coord.lat_dir not in ['N', 'S']:
                print(f"  WARNING: Invalid latitude direction: {coord.lat_dir}")
            if coord.lon_dir not in ['E', 'W']:
                print(f"  WARNING: Invalid longitude direction: {coord.lon_dir}")
            
        # Convert to dict format for processing
        coord_dicts = [coord.dict() for coord in coordinates]
        print("\nConverted to dict format:", coord_dicts)
        
        # Process coordinates
        utm_coordinates = process_coordinates(coord_dicts)
        
        # Print converted values
        print("\nConverted UTM Coordinates:")
        for i, coord in enumerate(utm_coordinates, 1):
            label = chr(64 + i)  # A, B, C, etc.
            print(f"\nPoint {label}:")
            print(f"  Easting: {coord['easting']:.2f}m")
            print(f"  Northing: {coord['northing']:.2f}m")
            print(f"  Elevation: {coord['elevation']:.2f}m")
            print(f"  Zone: {coord['zone']}")
        
        # Create a temporary directory
        with tempfile.TemporaryDirectory() as temp_dir:
            # Generate DXF file
            output_path = os.path.join(temp_dir, "coordinates.dxf")
            from utils.dxf_generator import create_dxf
            create_dxf(utm_coordinates, output_path)
            
            # Read the file content
            with open(output_path, 'rb') as f:
                file_content = f.read()
            
            print("\n=== DXF Generation Successful ===")
            print(f"File size: {len(file_content)} bytes")
            
            # Return the file
            return Response(
                content=file_content,
                media_type="application/dxf",
                headers={
                    "Content-Disposition": "attachment; filename=coordinates.dxf",
                    "X-Converted-Values": json.dumps(utm_coordinates),
                    "Access-Control-Expose-Headers": "X-Converted-Values"
                }
            )
        
    except ValidationError as e:
        print("\n=== Validation Error ===")
        print("Error details:", e.errors())
        print("Request data:", request.dict())
        raise HTTPException(status_code=422, detail=e.errors())
    except Exception as e:
        print("\n=== Error in Conversion ===")
        print("Error:", str(e))
        print("Request data:", request.dict())
        raise HTTPException(status_code=500, detail=str(e))

def get_ist_time():
    """Get current time in Indian Standard Time (IST)"""
    utc_now = datetime.now(timezone.utc)
    ist_offset = timedelta(hours=5, minutes=30)
    ist_time = utc_now + ist_offset
    return ist_time.replace(tzinfo=timezone(ist_offset))

@app.post("/api/certificates")
async def create_certificate(certificate: CertificateCreate):
    try:
        print("\n=== Certificate Creation Attempt ===")
        print("1. Received certificate data:", certificate.dict())
        
        db = Database.get_db()
        print("2. Database connection verified")
        
        # Verify database connection by listing collections
        collections = await db.list_collection_names()
        print(f"3. Available collections: {collections}")
        
        certificate_dict = certificate.dict()
        # Ensure optional fields are included even if None
        certificate_dict['userName'] = certificate.userName
        certificate_dict['userAddress'] = certificate.userAddress
        certificate_dict['userPhone'] = certificate.userPhone
        certificate_dict['userEmail'] = certificate.userEmail
        current_time = get_ist_time()
        certificate_dict["created_at"] = current_time
        certificate_dict["updated_at"] = current_time
        
        print("5. Data being sent to insert_one:", certificate_dict)
        
        print("5. Attempting to insert certificate...")
        result = await db.certificates.insert_one(certificate_dict)
        print(f"6. Insert result - Inserted ID: {result.inserted_id}")
        
        # Verify the document was inserted by counting documents
        count = await db.certificates.count_documents({"_id": result.inserted_id})
        print(f"7. Verification - Documents with this ID: {count}")
        
        print("8. Fetching created certificate...")
        created_certificate = await db.certificates.find_one({"_id": result.inserted_id})
        
        if created_certificate is None:
            print("9. ERROR: Certificate not found after creation!")
            raise HTTPException(status_code=500, detail="Failed to create certificate")
        
        print("9. Certificate successfully created and verified")
        print("10. Converting ObjectId to string...")
        created_certificate["_id"] = str(created_certificate["_id"])
        
        # Ensure timestamps are in IST
        if isinstance(created_certificate["created_at"], datetime):
            if created_certificate["created_at"].tzinfo is None:
                created_certificate["created_at"] = created_certificate["created_at"].replace(tzinfo=timezone.utc)
            created_certificate["created_at"] = created_certificate["created_at"].astimezone(timezone(timedelta(hours=5, minutes=30))).isoformat()
        
        if isinstance(created_certificate["updated_at"], datetime):
            if created_certificate["updated_at"].tzinfo is None:
                created_certificate["updated_at"] = created_certificate["updated_at"].replace(tzinfo=timezone.utc)
            created_certificate["updated_at"] = created_certificate["updated_at"].astimezone(timezone(timedelta(hours=5, minutes=30))).isoformat()
        
        # Print final document for verification
        print("11. Final certificate document:", created_certificate)
        print("=== Certificate Creation Successful ===\n")
        return created_certificate
        
    except ValidationError as e:
        print("\n=== Certificate Creation Failed - Validation Error ===")
        print("Validation error details:", e.errors())
        print("=== Certificate Creation Failed ===\n")
        raise HTTPException(status_code=422, detail=e.errors())
    except Exception as e:
        print("\n=== Certificate Creation Failed - General Error ===")
        print("Error creating certificate:", str(e))
        print("=== Certificate Creation Failed ===\n")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/certificates")
async def get_certificates(skip: int = 0, limit: int = 10):
    try:
        db = Database.get_db()
        certificates = await db.certificates.find().sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
        
        # Format the certificates for frontend
        formatted_certificates = []
        for cert in certificates:
            # Convert ObjectId to string
            cert["_id"] = str(cert["_id"])
            
            # Ensure timestamps are in IST
            if isinstance(cert["created_at"], datetime):
                if cert["created_at"].tzinfo is None:
                    cert["created_at"] = cert["created_at"].replace(tzinfo=timezone.utc)
                cert["created_at"] = cert["created_at"].astimezone(timezone(timedelta(hours=5, minutes=30))).isoformat()
            
            if isinstance(cert["updated_at"], datetime):
                if cert["updated_at"].tzinfo is None:
                    cert["updated_at"] = cert["updated_at"].replace(tzinfo=timezone.utc)
                cert["updated_at"] = cert["updated_at"].astimezone(timezone(timedelta(hours=5, minutes=30))).isoformat()
            
            formatted_certificates.append(cert)
        
        return formatted_certificates
    except Exception as e:
        print(f"Error fetching certificates: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/certificates/{certificate_id}")
async def get_certificate(certificate_id: str):
    try:
        db = Database.get_db()
        certificate = await db.certificates.find_one({"_id": ObjectId(certificate_id)})
        if not certificate:
            raise HTTPException(status_code=404, detail="Certificate not found")
        
        # Format the certificate for frontend
        certificate["_id"] = str(certificate["_id"])
        certificate["created_at"] = certificate["created_at"].isoformat()
        certificate["updated_at"] = certificate["updated_at"].isoformat()
        
        return certificate
    except Exception as e:
        print(f"Error fetching certificate: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/certificates/{certificate_id}")
async def update_certificate(certificate_id: str, certificate: CertificateUpdate):
    try:
        print(f"\n=== Certificate Update Attempt for ID: {certificate_id} ===")
        print("1. Received update data:", certificate.dict())
        
        db = Database.get_db()
        
        # Verify the certificate exists before update
        existing_certificate = await db.certificates.find_one({"_id": ObjectId(certificate_id)})
        if not existing_certificate:
            print("Certificate not found")
            raise HTTPException(status_code=404, detail="Certificate not found")
        
        # Prepare update data, ensuring optional fields are included
        update_data = certificate.dict()
        # Ensure optional fields are included even if None
        update_data['userName'] = certificate.userName
        update_data['userAddress'] = certificate.userAddress
        update_data['userPhone'] = certificate.userPhone
        update_data['userEmail'] = certificate.userEmail
        update_data["updated_at"] = get_ist_time()
        
        print("3. Data being sent to update_one:", update_data)
        
        print("3. Prepared update data:", update_data)
        
        # Perform the update
        result = await db.certificates.update_one(
            {"_id": ObjectId(certificate_id)},
            {"$set": update_data}
        )
        
        print(f"Update result - Modified count: {result.modified_count}")
        
        if result.modified_count == 0:
            print("No documents were modified")
            raise HTTPException(status_code=404, detail="Certificate not found or no changes made")
        
        # Fetch and return the updated certificate
        updated_certificate = await db.certificates.find_one({"_id": ObjectId(certificate_id)})
        if updated_certificate:
            # Convert ObjectId to string
            updated_certificate["_id"] = str(updated_certificate["_id"])
            
            # Ensure timestamps are in IST
            if isinstance(updated_certificate["created_at"], datetime):
                if updated_certificate["created_at"].tzinfo is None:
                    updated_certificate["created_at"] = updated_certificate["created_at"].replace(tzinfo=timezone.utc)
                updated_certificate["created_at"] = updated_certificate["created_at"].astimezone(timezone(timedelta(hours=5, minutes=30))).isoformat()
            
            if isinstance(updated_certificate["updated_at"], datetime):
                if updated_certificate["updated_at"].tzinfo is None:
                    updated_certificate["updated_at"] = updated_certificate["updated_at"].replace(tzinfo=timezone.utc)
                updated_certificate["updated_at"] = updated_certificate["updated_at"].astimezone(timezone(timedelta(hours=5, minutes=30))).isoformat()
            
            print("Successfully updated certificate")
            print("=== Certificate Update Successful ===\n")
            return updated_certificate
            
    except Exception as e:
        print("\n=== Certificate Update Failed ===")
        print(f"Error updating certificate: {str(e)}")
        print("=== Certificate Update Failed ===\n")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/certificates/{certificate_id}")
async def delete_certificate(certificate_id: str):
    db = Database.get_db()
    result = await db.certificates.delete_one({"_id": ObjectId(certificate_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return {"message": "Certificate deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000) 