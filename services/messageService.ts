
import { Vehicle, BookingData, ContactPlatform } from '../types';
import { CONTACT_INFO } from '../constants';

const getLocationFee = (seats: string, area: string): string => {
  const is14 = seats.includes('14') || seats.includes('15') || seats.includes('12');
  const is7 = seats.includes('7');
  
  const fees: Record<string, { s5: string, s7: string, s14: string }> = {
    'City Proper': { s5: '1,000', s7: '1,200', s14: '1,500' },
    'Port Barton': { s5: '4,500', s7: '5,500', s14: '6,000' },
    'San Vicente': { s5: '5,000', s7: '6,000', s14: '6,500' },
    'El Nido': { s5: '6,000', s7: '6,500', s14: '8,000' },
    'Buliluyan Port': { s5: '6,000', s7: '6,500', s14: '8,000' },
  };

  const areaFees = fees[area] || { s5: '0', s7: '0', s14: '0' };
  if (is14) return areaFees.s14;
  if (is7) return areaFees.s7;
  return areaFees.s5;
};

/**
 * Generates a summary message for booking inquiries.
 * Now supports both Vehicle objects and direct service strings for flexible inquiries.
 */
export const generateBookingSummary = (vehicle: Vehicle | string, booking: BookingData): string => {
  // Delivery & Pick-Up Fee is fixed at ₱300
  const deliveryFee = '300';
  const isUnitString = typeof vehicle === 'string';
  const securityDeposit = isUnitString ? '3,000' : (vehicle.securityDepositPhp ?? 3000).toLocaleString();
  
  const unitInfo = isUnitString 
    ? vehicle 
    : `${vehicle.year} ${vehicle.brand} ${vehicle.model} (${vehicle.color})`;
    
  const dailyRate = isUnitString ? 'N/A' : `₱${vehicle.price}`;
  const washFee = isUnitString ? '0' : `₱${vehicle.wash}`;

  return `*BOOKING CONFIRMATION*
---------------------------------------
🚗 *Unit:* ${unitInfo}
👤 *Name:* ${booking.customerName}
📞 *Contact:* ${booking.contactNumber}
📅 *Start Date of Rent:* ${booking.startDate}${booking.startTime ? ` ${booking.startTime}` : ''}
📍 *Deliver Location:* ${booking.deliveryLocation}
📅 *End Date of Rent:* ${booking.endDate}${booking.endTime ? ` ${booking.endTime}` : ''}
📍 *Pick-Up Location:* ${booking.pickupLocation}
💰 *Daily Rate:* ${dailyRate}
🚚 *Delivery & Pick-Up Fee:* ₱${deliveryFee}
🧽 *Car Wash Fee:* ${washFee}
🛡️ *Security Deposit:* ₱${securityDeposit}
📝 *Note:* Refundable after car return without damage
---------------------------------------
Generated via EAR Website`;
};

export const openPlatformLink = (platform: ContactPlatform, message: string) => {
  const encodedMessage = encodeURIComponent(message);
  
  switch (platform) {
    case ContactPlatform.WHATSAPP:
      window.open(`https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodedMessage}`, '_blank');
      break;
    case ContactPlatform.VIBER:
      window.open(`viber://forward?text=${encodedMessage}`, '_blank');
      break;
    case ContactPlatform.MESSENGER:
      window.open(`https://m.me/${CONTACT_INFO.messenger}`, '_blank');
      break;
  }
};
