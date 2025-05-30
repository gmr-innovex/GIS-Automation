import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function UndertakingCertificate({ coordinates, surveyNo, villageName, owner, facility, userName, userAddress, userPhone, userEmail }) {
  const certificateRef = useRef(null);
  // Letterhead image dimensions (in px, at 96 DPI)
  const IMG_WIDTH = 793;  // 20.97 cm * 96 DPI
  const IMG_HEIGHT = 1122; // 29.63 cm * 96 DPI
  const HEADER_SPACE = 245; // 2 inches
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

  const dateStyle = {
    position: 'absolute',
    top: '250px',
    right: '70px',
    fontSize: '11pt',
    fontFamily: 'Times New Roman, serif',
    zIndex: 2,
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const contentStyle = {
    fontFamily: 'Calibri, sans-serif',
    fontSize: '11pt',
    lineHeight: '1.5',
    backgroundColor: 'transparent',
    position: 'relative',
    textAlign: 'justify',
    wordBreak: 'break-word',
    marginTop: '40px',
    padding: '0 20px',
  };

  const titleStyle = {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: '30px',
    marginTop: '10px',
    fontSize: '11pt',
    textTransform: 'uppercase',
    fontFamily: 'Calibri, sans-serif',
    letterSpacing: '0.5px',
  };

  const paragraphStyle = {
    marginBottom: '12px',
    textAlign: 'justify',
  };

  const sectionTitleStyle = {
    fontWeight: 'bold',
    marginTop: '20px',
    marginBottom: '10px',
    fontSize: '11pt',
    display: 'flex',
    alignItems: 'flex-start',
  };

  const sectionTitleLetterStyle = {
    width: '25px',
    display: 'inline-block',
  };

  const sectionTitleTextStyle = {
    flex: 1,
  };

  const signatureSectionStyle = {
    marginTop: '50px',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 20px',
    position: 'relative',
  };

  const witnessContainerStyle = {
    width: '48%',
    display: 'flex',
    flexDirection: 'column',
  };

  const lesseeContainerStyle = {
    width: '48%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  };

  const datePlaceStyle = {
    marginTop: '20px',
    textAlign: 'left',
  };

  const witnessTextStyle = {
    marginBottom: '8px',
  };

  const witnessNumberStyle = {
    marginTop: '10px',
  };

  const lesseeTextStyle = {
    marginBottom: '5px',
  };

  const entityTextStyle = {
    marginBottom: '0',
    marginLeft: '20px',
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
      <h2 style={titleStyle} key="title">UNDERTAKING 1A AND AUTHORISATION LETTER</h2>,
      <p key="surveyor"><strong>(A)</strong> We GMR HYDERABAD INTERNATIONAL AIRPORT LIMITED having registered office at 3rd Floor, GMR AERO Towers, RGIA, Shamshabad, Hyderabad-500108, the applicant for the proposed construction of {facility || 'VIP parking facilitation building'} at survey no: {surveyNo || '23'}, {villageName || 'Ananthreddy'} Guda, Rajiv Gandhi International Airport, Shamshabad, Hyderabad-500108, Within the Airport land, do hereby undertake.</p>,
      <p><strong>A. Data Integrity</strong></p>,
      <p>l) That We the Lessee Legally authorized of the above plot and shall abide by all Terms & Conditions of NOC issued by AAI.</p>,
      <p>II) That, the details submitted in the application including the site elevation and the coordinates, CTS/Plot/Survey Numbers are correct. I am also aware that the NOC will be null and void in case it is established at any stage that the details submitted are different from the actual.</p>,
      <p><strong>B. Previous NOC Details</strong></p>,
      <p>l) That we have NOT applied for / received any No Objection Certificate from Airports Authority of India against an application for the same/different set of coordinates depicting the same building earlier. The plot is vacant and the construction is yet to start.</p>,
      <p><strong>C. Authorization</strong></p>,
      <p>I do hereby authorize {userName || 'Mr. Balakrishnan.R'} communication address {userAddress || '4th Floor, GMR AERO Towers, RGIA, Shamshabad, Hyderabad-500108'}. Mobile no – {userPhone || '9962309594'}, Email Id – {userEmail || 'Balakrishnan.R@gmrgroup.in'}. (herein after referred to as applicant) to file online NOC application for height clearance for the site mentioned above at AAI website on my behalf including acceptance of all the terms and conditions, data accuracy and verification of site plotted in the map.</p>,
      <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: '45%' }}>
          <p>Signature, Name and Address of witnesses:</p>
          <p>Entity legally authorized</p>
          <p>1)</p>
          <br />
          <p>2)</p>
        </div>
        <div style={{ width: '45%', textAlign: 'right' }}>
          <p>Name and Signature of the Lessee:</p>
          <br />
          <br />
          <br />
          <li>Date: {new Date().toLocaleDateString()}</li>
          <li>Place: Hyderabad</li>
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

      pdf.save('undertaking_letter.pdf', { returnPromise: true });
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <div ref={certificateRef} style={documentContainerStyle}>
        <div className="certificate-page" style={firstImageStyle}>
          <img src={letterheadPath} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }} alt="letterhead" />
          <div style={dateStyle}>
            <strong>Date:</strong> {formatDate(new Date())}
          </div>
          <div style={{ ...contentStyle, position: 'relative', zIndex: 2 }}>
            <h2 style={titleStyle}>UNDERTAKING 1A AND AUTHORISATION LETTER</h2>
            
            <p style={paragraphStyle}>We GMR HYDERABAD INTERNATIONAL AIRPORT LIMITED having registered office at 3rd Floor, GMR AERO Towers, RGIA, Shamshabad, Hyderabad-500108, the applicant for the proposed construction of {facility || 'VIP parking facilitation building'} at survey no: {surveyNo || '23'}, {villageName || 'Ananthreddy'} Guda, Rajiv Gandhi International Airport, Shamshabad, Hyderabad-500108, Within the Airport land, do hereby undertake.</p>

            <div style={sectionTitleStyle}>
              <span style={sectionTitleLetterStyle}>A.</span>
              <span style={sectionTitleTextStyle}>Data Integrity</span>
            </div>
            <p style={paragraphStyle}>l) That We the Lessee Legally authorized of the above plot and shall abide by all Terms & Conditions of NOC issued by AAI.</p>
            <p style={paragraphStyle}>II) That, the details submitted in the application including the site elevation and the coordinates, CTS/Plot/Survey Numbers are correct. I am also aware that the NOC will be null and void in case it is established at any stage that the details submitted are different from the actual.</p>

            <div style={sectionTitleStyle}>
              <span style={sectionTitleLetterStyle}>B.</span>
              <span style={sectionTitleTextStyle}>Previous NOC Details</span>
            </div>
            <p style={paragraphStyle}>l) That we have NOT applied for / received any No Objection Certificate from Airports Authority of India against an application for the same/different set of coordinates depicting the same building earlier. The plot is vacant and the construction is yet to start.</p>

            <div style={sectionTitleStyle}>
              <span style={sectionTitleLetterStyle}>C.</span>
              <span style={sectionTitleTextStyle}>Authorization</span>
            </div>
            <p style={paragraphStyle}>I do hereby authorize {userName || 'Mr. Balakrishnan.R'} communication address {userAddress || '4th Floor, GMR AERO Towers, RGIA, Shamshabad, Hyderabad-500108'}. Mobile no – {userPhone || '9962309594'}, Email Id – {userEmail || 'Balakrishnan.R@gmrgroup.in'}. (herein after referred to as applicant) to file online NOC application for height clearance for the site mentioned above at AAI website on my behalf including acceptance of all the terms and conditions, data accuracy and verification of site plotted in the map.</p>

            <div style={signatureSectionStyle}>
              <div style={witnessContainerStyle}>
                <p style={witnessTextStyle}>Signature, Name and Address of witnesses:</p>
                <p style={witnessNumberStyle}>1)</p>
                <p style={witnessNumberStyle}>2)</p>
                <div style={datePlaceStyle}>
                  <p>Date: {formatDate(new Date())}</p>
                  <p style={{ marginTop: '5px' }}>Place: Hyderabad</p>
                </div>
              </div>
              <div style={lesseeContainerStyle}>
                <p style={lesseeTextStyle}>Name and Signature of the Lessee:</p>
                <p style={entityTextStyle}>Entity legally authorized</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 bg-gray-100 flex justify-center">
        <button
          onClick={handleDownload}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Download Undertaking Letter
        </button>
      </div>
    </div>
  );
}