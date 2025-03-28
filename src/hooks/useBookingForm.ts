
import { useState } from 'react';
import { toast } from 'sonner';

export const useBookingForm = () => {
  const [pickupLocation, setPickupLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [passengers, setPassengers] = useState(1);
  
  // State for map coordinates - centered on Colombo
  const [mapCenter, setMapCenter] = useState<[number, number]>([6.9271, 79.8612]);
  const [startPoint, setStartPoint] = useState<[number, number] | null>(null);
  const [endPoint, setEndPoint] = useState<[number, number] | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [selectionStep, setSelectionStep] = useState<'pickup' | 'destination'>('pickup');
  
  // State for edit popup
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState<any>(null);

  // Handle route selection from map
  const handleRouteSelect = (start: [number, number], end: [number, number]) => {
    setStartPoint(start);
    setEndPoint(end);
    
    // Calculate distance in kilometers (simple straight-line distance)
    const R = 6371; // Radius of the Earth in km
    const dLat = (end[0] - start[0]) * Math.PI / 180;
    const dLon = (end[1] - start[1]) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(start[0] * Math.PI / 180) * Math.cos(end[0] * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    
    setDistance(distance);
  };

  // Handle location selection from map
  const handleLocationSelect = (location: { lat: number; lng: number; name: string }) => {
    if (selectionStep === 'pickup') {
      setPickupLocation(location.name);
      setStartPoint([location.lat, location.lng]);
      setSelectionStep('destination');
      toast.info("Pickup location selected. Now select your destination.");
    } else {
      setDestination(location.name);
      setEndPoint([location.lat, location.lng]);
      setSelectionStep('pickup');
      
      // If we have both points, calculate the route
      if (startPoint) {
        handleRouteSelect(startPoint, [location.lat, location.lng]);
      }
      
      toast.success("Route selected successfully!");
    }
  };

  // Open edit modal
  const openEditModal = (item: any) => {
    setCurrentEditItem(item);
    setIsEditModalOpen(true);
  };

  // Close edit modal
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentEditItem(null);
  };

  // Handle editing item
  const handleEditItem = (updatedItem: any) => {
    // Here you would typically update the item in your database
    toast.success("Item updated successfully!");
    closeEditModal();
  };

  // Handle deleting item
  const handleDeleteItem = (item: any) => {
    // Here you would typically delete the item from your database
    toast.success("Item deleted successfully!");
  };

  // Reset form
  const resetForm = () => {
    setPickupLocation('');
    setDestination('');
    setPickupDate('');
    setPickupTime('');
    setVehicleType('');
    setPassengers(1);
    setStartPoint(null);
    setEndPoint(null);
    setDistance(null);
    setSelectionStep('pickup');
    toast.info("Form has been reset");
  };

  return {
    pickupLocation,
    setPickupLocation,
    destination,
    setDestination,
    pickupDate,
    setPickupDate,
    pickupTime,
    setPickupTime,
    vehicleType,
    setVehicleType,
    passengers,
    setPassengers,
    mapCenter,
    setMapCenter,
    startPoint,
    setStartPoint,
    endPoint,
    setEndPoint,
    distance,
    setDistance,
    selectionStep,
    setSelectionStep,
    handleRouteSelect,
    handleLocationSelect,
    resetForm,
    isEditModalOpen,
    currentEditItem,
    openEditModal,
    closeEditModal,
    handleEditItem,
    handleDeleteItem
  };
};

export default useBookingForm;
