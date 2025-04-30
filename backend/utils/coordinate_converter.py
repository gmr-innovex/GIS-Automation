from pyproj import Proj
import os
import logging
from typing import List, Dict, Tuple
from utils.dxf_generator import create_dxf

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class CoordinateConversionError(Exception):
    """Custom exception for coordinate conversion errors"""
    pass

class DXFGenerationError(Exception):
    """Custom exception for DXF generation errors"""
    pass

def dms_to_decimal(degrees: float, minutes: float, seconds: float, direction: str) -> float:
    """
    Convert degrees, minutes, seconds to decimal degrees.
    
    Args:
        degrees: Whole degrees
        minutes: Minutes (0-60)
        seconds: Seconds (0-60)
        direction: N, S, E, or W
    
    Returns:
        decimal_degrees: Decimal degrees representation
    
    Raises:
        CoordinateConversionError: If conversion fails
    """
    try:
        decimal_degrees = float(degrees) + float(minutes)/60 + float(seconds)/3600
        
        if direction in ['S', 'W']:
            decimal_degrees = -decimal_degrees
            
        return decimal_degrees
    except (ValueError, TypeError) as e:
        logger.error(f"Error converting DMS to decimal: {str(e)}")
        raise CoordinateConversionError(f"Invalid DMS values: {str(e)}")

def process_coordinates(coordinates: List[Dict]) -> List[Dict]:
    """
    Process a list of coordinates with raw DMS values to UTM coordinates.
    
    Args:
        coordinates: List of dictionaries containing lat_deg, lat_min, lat_sec, lat_dir,
                    lon_deg, lon_min, lon_sec, lon_dir, and amsl
    
    Returns:
        List of dictionaries containing UTM coordinates
    
    Raises:
        CoordinateConversionError: If coordinate processing fails
    """
    utm_coordinates = []
    
    logger.info("Starting coordinate processing")
    for i, coord in enumerate(coordinates, 1):
        try:
            logger.info(f"Processing coordinate {i}")
            
            # Validate input values
            required_fields = ['lat_deg', 'lat_min', 'lat_sec', 'lat_dir',
                             'lon_deg', 'lon_min', 'lon_sec', 'lon_dir', 'amsl']
            if not all(field in coord for field in required_fields):
                raise CoordinateConversionError(f"Missing required fields in coordinate {i}")
            
            # Convert to decimal degrees
            lat_decimal = dms_to_decimal(coord['lat_deg'], coord['lat_min'], 
                                       coord['lat_sec'], coord['lat_dir'])
            lon_decimal = dms_to_decimal(coord['lon_deg'], coord['lon_min'], 
                                       coord['lon_sec'], coord['lon_dir'])
            
            # Calculate UTM zone
            zone_number = int((lon_decimal + 180) / 6) + 1
            zone_letter = 'N' if lat_decimal >= 0 else 'S'
            
            # Create UTM projection
            utm_proj = Proj(proj='utm', zone=zone_number, 
                          ellps='WGS84', south=(lat_decimal < 0))
            
            # Convert to UTM coordinates
            easting, northing = utm_proj(lon_decimal, lat_decimal)
            
            utm_coord = {
                'easting': easting,
                'northing': northing,
                'elevation': coord['amsl'],
                'zone': f"{zone_number}{zone_letter}"
            }
            
            utm_coordinates.append(utm_coord)
            logger.info(f"Successfully processed coordinate {i}")
            
        except Exception as e:
            logger.error(f"Error processing coordinate {i}: {str(e)}")
            raise CoordinateConversionError(f"Error processing coordinate {i}: {str(e)}")
    
    return utm_coordinates

def generate_dxf(utm_coordinates: List[Dict], output_dir: str = "output") -> str:
    """
    Generate a DXF file from UTM coordinates.
    
    Args:
        utm_coordinates: List of dictionaries containing UTM coordinates
        output_dir: Directory to save the DXF file
    
    Returns:
        Path to the generated DXF file
    
    Raises:
        DXFGenerationError: If DXF generation fails
    """
    try:
        # Create output directory if it doesn't exist
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            logger.info(f"Created output directory: {output_dir}")
        
        # Generate unique filename
        output_path = os.path.join(output_dir, f"coordinates_{os.urandom(4).hex()}.dxf")
        
        # Generate DXF file
        create_dxf(utm_coordinates, output_path)
        logger.info(f"Successfully generated DXF file: {output_path}")
        
        return output_path
        
    except Exception as e:
        logger.error(f"Error generating DXF file: {str(e)}")
        raise DXFGenerationError(f"Error generating DXF file: {str(e)}")

def process_and_generate(coordinates: List[Dict]) -> Tuple[List[Dict], str]:
    """
    Process coordinates and generate DXF file.
    
    Args:
        coordinates: List of coordinate dictionaries
    
    Returns:
        Tuple of (utm_coordinates, dxf_path)
    
    Raises:
        CoordinateConversionError: If coordinate processing fails
        DXFGenerationError: If DXF generation fails
    """
    try:
        # Process coordinates to UTM
        utm_coordinates = process_coordinates(coordinates)
        
        # Generate DXF file
        dxf_path = generate_dxf(utm_coordinates)
        
        return utm_coordinates, dxf_path
        
    except Exception as e:
        logger.error(f"Error in coordinate processing and DXF generation: {str(e)}")
        raise