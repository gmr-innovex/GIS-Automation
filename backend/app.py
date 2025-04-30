from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import List
from utils.coordinate_converter import process_coordinates
import os
import tempfile
import json

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

@app.post("/api/convert")
async def convert_coordinates(request: CoordinateRequest):
    try:
        coordinates = request.coordinates
        
        if not coordinates:
            raise HTTPException(status_code=400, detail="No coordinates provided")
            
        # Process coordinates
        utm_coordinates = process_coordinates(coordinates)
        
        # Create a temporary directory
        with tempfile.TemporaryDirectory() as temp_dir:
            # Generate DXF file in the temporary directory
            output_path = os.path.join(temp_dir, "coordinates.dxf")
            from utils.dxf_generator import create_dxf
            create_dxf(utm_coordinates, output_path)
            
            # Print converted values in backend console
            print("\nConverted Coordinates:")
            for i, coord in enumerate(utm_coordinates, 1):
                print(f"\nCoordinate {i}:")
                print(f"  Easting: {coord['easting']:.2f}m")
                print(f"  Northing: {coord['northing']:.2f}m")
                print(f"  Elevation: {coord['elevation']:.2f}m")
                print(f"  Zone: {coord['zone']}")
            
            # Return both the file and the converted values
            return FileResponse(
                output_path,
                media_type="application/dxf",
                filename="coordinates.dxf",
                headers={
                    "X-Converted-Values": json.dumps(utm_coordinates),
                    "Access-Control-Expose-Headers": "X-Converted-Values"
                }
            )
        
    except Exception as e:
        print(f"Error in conversion: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000) 