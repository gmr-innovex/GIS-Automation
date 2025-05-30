import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function AuthorisationCertificate({ coordinates, surveyNo, villageName, owner, facility }) {
  const certificateRef = useRef(null);
  // Letterhead image dimensions (in px, at 96 DPI)
  const IMG_WIDTH = 793;  // 20.97 cm * 96 DPI
  const IMG_HEIGHT = 1122; // 29.63 cm * 96 DPI
  const HEADER_SPACE = 192; // 2 inches
  const FOOTER_SPACE = 192; // 2 inches
  const SIDE_MARGIN = 50;   // 1 inch
  const CONTENT_HEIGHT = IMG_HEIGHT - HEADER_SPACE - FOOTER_SPACE;

  // Paths for images
  const letterheadPath = require('../assets/images/letterhead.png');
  const birfLogoPath = require('../assets/images/bird.png');

  // Styles
  const documentContainerStyle = {
    width: `${IMG_WIDTH}px`,
    position: 'relative',
    margin: '0 auto',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  };

  const firstImageStyle = {
    width: `${IMG_WIDTH}px`,
    minHeight: `${IMG_HEIGHT}px`,
    position: 'relative',
    paddingTop: `${HEADER_SPACE}px`,
    paddingBottom: `${FOOTER_SPACE}px`,
    paddingLeft: `${SIDE_MARGIN}px`,
    paddingRight: `${SIDE_MARGIN}px`,
    backgroundColor: 'white',
    border: '1px solid #ccc',
    overflow: 'hidden',
    marginBottom: '20px',
  };

  const overflowPageStyle = {
    width: `${IMG_WIDTH}px`,
    minHeight: `${IMG_HEIGHT}px`,
    position: 'relative',
    paddingTop: '96px',
    paddingBottom: `${FOOTER_SPACE}px`,
    paddingLeft: `${SIDE_MARGIN}px`,
    paddingRight: `${SIDE_MARGIN}px`,
    background: 'white',
    border: '1px solid #ccc',
    marginBottom: '20px',
    overflow: 'hidden',
  };

  const birfLogoStyle = {
    position: 'absolute',
    top: '24px',
    right: '24px',
    width: '150px',
    height: '112px',
    zIndex: 2,
  };

  const contentStyle = {
    fontFamily: 'Times New Roman, serif',
    fontSize: '12pt',
    lineHeight: '1.5',
    backgroundColor: 'transparent',
    position: 'relative',
    textAlign: 'justify',
    wordBreak: 'break-word',
    marginTop: '50px',
  };

  const titleStyle = {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: '30px',
    fontSize: '14pt',
    textTransform: 'uppercase',
    fontFamily: 'Times New Roman, serif',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '20px',
    marginTop: '20px',
  };

  const cellStyle = {
    border: '1px solid #000',
    padding: '8px',
    textAlign: 'left',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  };

  const headerCellStyle = {
    ...cellStyle,
    backgroundColor: 'rgba(242, 242, 242, 0.9)',
    fontWeight: 'bold',
  };

  const dateStyle = {
    position: 'absolute',
    top: '220px',
    right: '55px',
    fontSize: '12pt',
    fontFamily: 'Times New Roman, serif',
    zIndex: 2,
  };

  // Format coordinate for display
  const formatCoordinate = (coord) => {
    if (!coord) return { lat: '', lon: '' };
    
    const { lat_deg, lat_min, lat_sec, lat_dir, lon_deg, lon_min, lon_sec, lon_dir } = coord;
    
    // Check if all required values exist
    if (lat_deg === undefined || lat_min === undefined || lat_sec === undefined || !lat_dir ||
        lon_deg === undefined || lon_min === undefined || lon_sec === undefined || !lon_dir) {
      return { lat: '', lon: '' };
    }

    return {
      lat: `${lat_deg}°${lat_min}'${lat_sec.toFixed(2)}"${lat_dir}`,
      lon: `${lon_deg}°${lon_min}'${lon_sec.toFixed(2)}"${lon_dir}`
    };
  };

  // Get highest elevation from coordinates
  const getHighestElevation = () => {
    if (!coordinates || coordinates.length === 0) return 0;
    return Math.max(...coordinates.map(coord => coord.amsl));
  };

  // Split content into first image and overflow pages
  const splitContentForImageAndOverflow = () => {
    // Compose all content as an array of React elements
    const contentElements = [
      <h2 style={titleStyle} key="title">TO WHOMSOEVER IT MAY CONCERN</h2>,
      <p key="surveyor"><strong>(A)</strong> We, M/s GMR Hyderabad International Airport Limited (GHIAL) presently owning, operating, and maintaining the Rajiv Gandhi International Airport, hereby undertake to setup, operate, and maintain {facility || 'VIP parking facilitation building'} at Survey No.{surveyNo || '23'}, {villageName || 'Ananthreddy'} Guda Village, Rajiv Gandhi International Airport, Hyderabad, Telengana-500108, within the Airport land at the following location:</p>,
      <table style={tableStyle} key="table">
        <thead>
          <tr>
            <th style={headerCellStyle}>Corner No.</th>
            <th style={headerCellStyle}>Latitude (DD MM SS.s)</th>
            <th style={headerCellStyle}>Longitude (DD MM SS.s)</th>
            <th style={headerCellStyle}>Site Elevation (AMSL) in meters</th>
          </tr>
        </thead>
        <tbody>
          {coordinates && coordinates.map((coord, index) => {
            const formatted = formatCoordinate(coord);
            return (
              <tr key={index}>
                <td style={cellStyle}>{String.fromCharCode(65 + index)}</td>
                <td style={cellStyle}>{formatted.lat}</td>
                <td style={cellStyle}>{formatted.lon}</td>
                <td style={cellStyle}>{coord.amsl.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>,
      <p key="B"><strong>(B)</strong> This letter is provided to obtain the height clearance from AAI for constructing the {facility || 'VIP parking facilitation building'} at Survey No.{surveyNo || '23'}, {villageName || 'Ananthreddy'} Guda Village, Rajiv Gandhi International Airport, Hyderabad, Telengana-500108, India.</p>,
      <div style={{ marginTop: '50px' }} key="date">
        <p>DATE: {new Date().toLocaleDateString()}</p>
        <p>PLACE: Hyderabad</p>
      </div>,
      <div style={{ marginTop: '50px' }} key="sign">
        <div style={{ textAlign: 'right' }}>
          <p>For GMR Hyderabad International Airport Limited</p>
          <br />
          <br />
          <br />
          <p>Authorized Signatory</p>
        </div>
      </div>
    ];

    // Calculate dynamic table height based on number of rows
    const tableHeight = coordinates ? (coordinates.length * 30) + 40 : 0; // 30px per row + 40px for header

    // Simulate content height for each element
    const elementHeights = {
      h2: 40,
      p: 20,
      table: tableHeight,
      ol: 60,
      div: 60
    };

    let pages = [];
    let currentPage = [];
    let currentHeight = 0;
    let isFirst = true;
    const MAX_FIRST_PAGE_HEIGHT = CONTENT_HEIGHT - 250; // Adjusted space for header

    contentElements.forEach((element) => {
      let type = element.type;
      if (typeof type === 'string') type = type.toLowerCase();
      const elementHeight = elementHeights[type] || 20;

      // For first page, use MAX_FIRST_PAGE_HEIGHT
      const maxHeight = isFirst ? MAX_FIRST_PAGE_HEIGHT : CONTENT_HEIGHT;

      // Special handling for table on first page
      if (type === 'table' && isFirst) {
        // Check if table will fit on first page
        if (currentHeight + elementHeight <= maxHeight) {
          currentPage.push(element);
          currentHeight += elementHeight;
        } else {
          // If table doesn't fit, start a new page
          pages.push({
            isFirst,
            content: currentPage
          });
          currentPage = [element];
          currentHeight = elementHeight;
          isFirst = false;
        }
      } else {
        // Normal content flow
        if (currentHeight + elementHeight > maxHeight) {
          pages.push({
            isFirst,
            content: currentPage
          });
          currentPage = [];
          currentHeight = 0;
          isFirst = false;
        }
        currentPage.push(element);
        currentHeight += elementHeight;
      }
    });

    if (currentPage.length > 0) {
      pages.push({
        isFirst,
        content: currentPage
      });
    }
    return pages;
  };

  const handleDownload = async () => {
    if (!certificateRef.current) return;

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [IMG_WIDTH, IMG_HEIGHT],
        compress: false,
        precision: 32
      });

      const pages = certificateRef.current.getElementsByClassName('certificate-page');
      
      for (let i = 0; i < pages.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        const backgroundImage = new Image();
        backgroundImage.crossOrigin = 'anonymous';
        backgroundImage.src = letterheadPath;

        await new Promise((resolve) => {
          backgroundImage.onload = resolve;
          setTimeout(resolve, 2000);
        });

        const canvas = await html2canvas(pages[i], {
          scale: 4,
          useCORS: true,
          logging: false,
          backgroundColor: 'white',
          allowTaint: true,
          imageTimeout: 5000,
          removeContainer: true,
          letterRendering: true,
          onclone: (clonedDoc) => {
            const style = clonedDoc.createElement('style');
            style.innerHTML = `
              @font-face {
                font-family: 'Times New Roman';
                src: local('Times New Roman');
              }
              * {
                font-family: 'Times New Roman', serif !important;
                font-size: 12pt !important;
              }
              .certificate-page {
                background-color: white !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            `;
            clonedDoc.head.appendChild(style);
          }
        });

        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        pdf.addImage(
          imgData,
          'JPEG',
          0,
          0,
          IMG_WIDTH,
          IMG_HEIGHT,
          undefined,
          'MEDIUM',
          0
        );
      }

      pdf.save('authorization_letter.pdf', { returnPromise: true });
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <div ref={certificateRef} style={documentContainerStyle}>
        {splitContentForImageAndOverflow().map((page, idx) => (
          <div
            key={idx}
            className="certificate-page"
            style={page.isFirst ? firstImageStyle : overflowPageStyle}
          >
            {page.isFirst && (
              <>
                <img src={letterheadPath} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }} alt="letterhead" />
                {/* <div style={dateStyle}>
                  <strong>Dated:</strong> {new Date().toLocaleDateString()}
                </div> */}
              </>
            )}
            {!page.isFirst && (
              <img src={birfLogoPath} style={birfLogoStyle} alt="birf logo" />
            )}
            <div style={{ ...contentStyle, position: 'relative', zIndex: 2 }}>{page.content}</div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-gray-100 flex justify-center">
        <button
          onClick={handleDownload}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Download Authorization Letter
        </button>
      </div>
    </div>
  );
}