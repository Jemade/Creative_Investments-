/**
 * Creative Wing Investments — WhatsApp Link & Conversion System
 */
const CWI_CONTACT = {
  whatsappNumber: '263785783150',
  whatsappDisplay: '+263 78 578 3150',
  phoneDisplay: '077 441 1867',
  emailDisplay: 'info@creativewinginvestments.co.zw',
  hoursDisplay: 'Monday to Saturday · 8:00 to 18:00',
  locationDisplay: 'Harare, Zimbabwe',
  termsDisplay: 'Cash Deals Only • USD Pricing • In-Person Inspection in Harare'
};

function formatUSD(num) {
  if (num === null || num === undefined || isNaN(num)) return 'Price on request';
  return 'USD ' + Number(num).toLocaleString('en-US');
}

function getWhatsAppBaseUrl() {
  return 'https://wa.me/' + CWI_CONTACT.whatsappNumber;
}

function buildVehicleWhatsAppUrl(vehicle) {
  const priceStr = (vehicle.price && !isNaN(vehicle.price)) ? ('USD ' + Number(vehicle.price).toLocaleString('en-US')) : 'Price on request';
  const idStr = vehicle.id && vehicle.id.startsWith('CW-') ? vehicle.id : ('CW-' + vehicle.id);
  const text = "Hello Creative Wing Investments, I'm interested in " + vehicle.name + ", ID " + idStr + ", listed at " + priceStr + ". Is it still available?";
  return getWhatsAppBaseUrl() + '?text=' + encodeURIComponent(text);
}

function buildHomeVehicleWhatsAppUrl(vehicle) {
  const idStr = vehicle.id && vehicle.id.startsWith('CW-') ? vehicle.id : ('CW-' + vehicle.id);
  const text = "Hello Creative Wing Investments, I'm interested in " + vehicle.name + ", ID " + idStr + ". Is it currently available for Harare viewing?";
  return getWhatsAppBaseUrl() + '?text=' + encodeURIComponent(text);
}

function buildSportswearWhatsAppUrl(item) {
  const idStr = item.id && item.id.startsWith('CW-') ? item.id : ('CW-' + item.id);
  const text = "Hello Creative Wing Investments, I'm interested in " + item.name + ", ID " + idStr + ". Please share availability, sizes and pricing.";
  return getWhatsAppBaseUrl() + '?text=' + encodeURIComponent(text);
}

function buildDivisionWhatsAppUrl(divisionName) {
  const text = "Hello Creative Wing Investments, I'm interested in your " + divisionName + " services. I would like to discuss a project brief.";
  return getWhatsAppBaseUrl() + '?text=' + encodeURIComponent(text);
}

function buildGeneralWhatsAppUrl(customText) {
  const text = customText || "Hello Creative Wing Investments, I'd like to inquire about your commercial services, vehicles and sportswear in Harare.";
  return getWhatsAppBaseUrl() + '?text=' + encodeURIComponent(text);
}
