
export interface Vehicle {
  id: number;
  year: string;
  brand: string;
  model: string;
  trans: 'AT' | 'MT';
  seats: string;
  color: string;
  price: string;
  wash: string;
  imageUrl: string;
  description?: string;
  fuelType?: string;
  serviceType?: string;
}

export interface BookingData {
  customerName: string;
  contactNumber: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  deliveryLocation: string;
  pickupLocation: string;
  locationArea: string;
  additionalService: string;
  notes: string;
}

export enum ContactPlatform {
  WHATSAPP = 'WHATSAPP',
  VIBER = 'VIBER',
  MESSENGER = 'MESSENGER'
}
