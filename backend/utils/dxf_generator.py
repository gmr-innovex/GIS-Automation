import ezdxf
from typing import List, Dict

def create_dxf(utm_coordinates: List[Dict], output_path: str) -> None:
    """Create a DXF file with the given UTM coordinates"""
    # Create a new DXF document
    doc = ezdxf.new('R2010')  # Using AutoCAD 2010 format
    
    # Add a new modelspace
    msp = doc.modelspace()
    
    # Extract coordinate values
    points = [(coord["easting"], coord["northing"], coord["elevation"]) for coord in utm_coordinates]
    
    # Generate alphabet labels (A, B, C, ..., AA, AB, ...)
    def get_alphabet_label(index):
        result = ""
        while index >= 0:
            result = chr(65 + (index % 26)) + result
            index = index // 26 - 1
        return result
    
    # Add points with alphabet labels
    for i, point in enumerate(points):
        msp.add_point(point)
        # Add text label with alphabet
        label = get_alphabet_label(i)
        text = msp.add_text(f"Point {label}", dxfattribs={'height': 2.5})
        text.dxf.insert = (point[0] + 5, point[1] + 5)  # Position text relative to point
    
    # Add polyline connecting the points
    points_2d = [(p[0], p[1]) for p in points]
    points_2d.append(points_2d[0])  # Close the polygon
    msp.add_lwpolyline(points_2d)
    
    # Add a table with coordinate information
    table_x = min(p[0] for p in points) - 50
    table_y = min(p[1] for p in points) - 50
    
    # Add table header
    header = msp.add_text("Coordinate Table", dxfattribs={'height': 5})
    header.dxf.insert = (table_x, table_y)
    
    header_row = msp.add_text("Point   Easting     Northing    Elevation   Zone", dxfattribs={'height': 3})
    header_row.dxf.insert = (table_x, table_y - 10)
    
    # Add table rows with alphabet labels
    for i, coord in enumerate(utm_coordinates):
        label = get_alphabet_label(i)
        text = f"{label}      {coord['easting']:.2f}   {coord['northing']:.2f}   {coord['elevation']:.2f}   {coord['zone']}"
        row = msp.add_text(text, dxfattribs={'height': 3})
        row.dxf.insert = (table_x, table_y - 20 - i*10)
    
    # Save the DXF file
    doc.saveas(output_path)