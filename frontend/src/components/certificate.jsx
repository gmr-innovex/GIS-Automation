import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function LetterheadCertificate({ coordinates, surveyNo, villageName, owner, facility }) {
  const certificateRef = useRef(null);
  // Letterhead image dimensions (in px, at 96 DPI)
  const IMG_WIDTH = 793;  // 20.97 cm * 96 DPI
  const IMG_HEIGHT = 1122; // 29.63 cm * 96 DPI
  const HEADER_SPACE = 192; // 2 inches
  const FOOTER_SPACE = 192; // 2 inches
  const SIDE_MARGIN = 60;   // 1 inch
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
    marginTop: '50px', // Add space after the date
  };

  const titleStyle = {
    textAlign: 'left',
    fontWeight: 'bold',
    textDecoration: 'underline',
    marginBottom: '12px',
    fontSize: '12pt',
    textTransform: 'uppercase',
    fontFamily: 'Times New Roman, serif',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '10px',
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
  };

  const dateStyle = {
    position: 'absolute',
    top: '240px',
    right: '55px',
    fontSize: '12pt',
    fontFamily: 'Times New Roma, serif',
    zIndex: 2,
  };

  const surveyorDetailsStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '10px',
  };

  const surveyorLabelStyle = {
    padding: '4px 8px',
    textAlign: 'left',
    width: '200px',
    verticalAlign: 'top',
  };

  const surveyorValueStyle = {
    padding: '4px 8px',
    textAlign: 'left',
    verticalAlign: 'top',
    textDecoration: 'underline',
  };

  // Format coordinate for display
  const formatCoordinate = (coord) => {
    const { lat_deg, lat_min, lat_sec, lat_dir, lon_deg, lon_min, lon_sec, lon_dir } = coord;
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
      <h2 style={titleStyle} key="title">SITE ELEVATION AND SITE COORDINATES CERTIFICATE</h2>,
      <table style={surveyorDetailsStyle} key="surveyor">
        <tbody>
          <tr>
            <td style={surveyorLabelStyle}>Name of the licensed surveyor:</td>
            <td style={surveyorValueStyle}>Mr. Sapan Gupta</td>
          </tr>
          <tr>
            <td style={surveyorLabelStyle}>Address:</td>
            <td style={surveyorValueStyle}>4<sup>th</sup> floor, GMR Aero towers, GHIAL, RGIA, Shamshabad-500108</td>
          </tr>
          <tr>
            <td style={surveyorLabelStyle}>Email id:</td>
            <td style={surveyorValueStyle}>sapan.gupta@gmrgroup.in</td>
          </tr>
          <tr>
            <td style={surveyorLabelStyle}>Mobile number:</td>
            <td style={surveyorValueStyle}>+919739753583</td>
          </tr>
          <tr>
            <td style={surveyorLabelStyle}>License number:</td>
            <td style={surveyorValueStyle}>Airport Operator</td>
          </tr>
          <tr>
            <td style={surveyorLabelStyle}>License validity:</td>
            <td style={surveyorValueStyle}>Airport Operator</td>
          </tr>
          <tr>
            <td style={surveyorLabelStyle}>Scope of License:</td>
            <td style={surveyorValueStyle}>Airport Operator</td>
          </tr>
          <tr>
            <td style={surveyorLabelStyle}>License issuing authority:</td>
            <td style={surveyorValueStyle}>Airport Operator</td>
          </tr>
        </tbody>
      </table>,
      <p key="certify">I hereby certify that I have carried out the site survey as per the following details and the results are shown in (A) and (B) below:</p>,
      <p key="plot"><strong><u>Site /plot no:</u></strong></p>,
      <p key="plotdesc">Survey no: {surveyNo || '23'} of {villageName || 'Ananthreddy'} village, RGIA, Shamshabad, Hyderabad -- 500108, Telangana. (As per the local bodies map)</p>,
      <p key="siteaddr"><strong><u>Site address:</u></strong></p>,
      <p key="siteaddrd">Survey no: {surveyNo || '23'} of {villageName || 'Ananthreddy'} village, RGIA, Shamshabad, Hyderabad -- 500108, Telangana.</p>,
      <p key="owner"><strong><u>Owner/Lessee of the Plot /Site:</u></strong> {owner === 'GHAIL' ? 'GMR Hyderabad International Airport Limited' : owner}.</p>,
      <p key="A"><strong>(A) Site Coordinates for proposed {facility || 'VIP parking facilitation building'}</strong></p>,
      <table style={tableStyle} key="table">
        <thead>
          <tr>
            <th style={headerCellStyle}>Corner</th>
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
      <p key="B"><strong>(B) Highest Site Elevation of the Plot:</strong> {getHighestElevation().toFixed(2)} meters.</p>,
      <p key="C"><strong>(C) Further it is certified that:</strong></p>,
      <ol className="pl-6" key="ol1">
        <li>I/we am /are trained and equipped to issue this certificate for site elevation and site coordinates.</li>
        <li>The site elevation and site coordinates data are correct to best of my knowledge and belief and are within permissible limits of accuracy of 50 cm in vertical and 03 meters in lateral.</li>
        <li>I have used the following equipment for survey.</li>
      </ol>,
      <p className="pl-6" key="equip1">(a) DGPS conforming to accuracy levels defined in 2 above along with validity of calibration certificate.</p>,
      <p className="pl-6" key="equip2">(b) Total station conforming to accuracy levels defined in 2 above along with validity of calibration certificate.</p>,
      <p key="D"><strong>(D) Undertaking:</strong></p>,
      <ol className="pl-6" key="ol2">
        <li>I indemnify Airports Authority of India and the concerned airport operator against all damages arising out of errors in data furnished above by me in addition to the owner's responsibility in this regard. I may further be blacklisted by AAI in case of wrong data.</li>
        <li>Within a period of three months from the date of filing of NOC application, I shall submit the following documents to the Airport Director of the concerned airport, if so required by AAI.
          <ol type="a" className="pl-6">
            <li>License certificate of surveyor.</li>
            <li>Letter of authorization by airport operator.</li>
            <li>Calibration certificate of the survey equipment.</li>
            <li>Photograph of the surveyor at site and showing the neighboring land area.</li>
            <li>Site plotted on Google Earth map.</li>
          </ol>
        </li>
      </ol>,
      <div className="mt-16 flex justify-end" key="sign">
        <div className="text-center">
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <p>____________________________</p>
          <p>(Name and Signature of the authorized Architect and Planner)</p>
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

        // Force load letterhead image first
        const backgroundImage = new Image();
        backgroundImage.crossOrigin = 'anonymous';
        backgroundImage.src = letterheadPath;

        await new Promise((resolve) => {
          backgroundImage.onload = resolve;
          setTimeout(resolve, 2000);
        });

        // Enhanced html2canvas settings for much better quality
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

        // Convert canvas to highest-quality image
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        // Add image to PDF with precise dimensions
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

      // Save with high quality settings
      pdf.save('certificate.pdf', { returnPromise: true });
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
                <div style={dateStyle}>
                  <strong>Dated:</strong> {new Date().toLocaleDateString()}
                </div>
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
          Download Certificate
        </button>
      </div>
    </div>
  );
}